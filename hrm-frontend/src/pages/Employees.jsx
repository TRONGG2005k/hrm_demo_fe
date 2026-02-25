/**
 * ============================================================
 * EMPLOYEES PAGE - HRM Frontend
 * ============================================================
 * Quản lý nhân viên: CRUD, Import/Export Excel, Upload hồ sơ ZIP
 * API: /api/v1/employees
 * ============================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import { ConfirmDialog } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './Employees.css';

const Employees = () => {
    const { success, error } = useToast();
    const { isHRStaff } = useAuth();

    // State
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]); // Mảng chứa các ID đã chọn

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE',
        status: 'ACTIVE',
        joinDate: '',
        shiftType: 'MORNING',
        addressId: '',
        subDepartmentId: '',
        positionId: '',
    });

    // Delete confirmation
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false,
        employeeId: null,
        employeeName: '',
    });

    // Import/Export state
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // Create accounts state
    const [isCreatingAccounts, setIsCreatingAccounts] = useState(false);

    // Face registration state
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [faceFiles, setFaceFiles] = useState([]);
    const [isRegisteringFace, setIsRegisteringFace] = useState(false);
    const [selectedEmployeeForFace, setSelectedEmployeeForFace] = useState(null);

    // Bulk file upload state
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch employees
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/employees', {
                params: {
                    page: currentPage - 1,
                    size: pageSize,
                    search: searchTerm,
                },
            });
            setEmployees(response.data.content || response.data);
            // console.log('Fetched employees:', response.data);
            setTotalItems(response.data.totalElements || response.data.length);
        } catch (err) {
            error('Không thể tải danh sách nhân viên');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, error]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Handle page change
    const handlePageChange = (page, newPageSize) => {
        setCurrentPage(page);
        if (newPageSize) setPageSize(newPageSize);
    };

    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    // Open create modal
    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedEmployee(null);
        setFormData({
            code: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: 'MALE',
            status: 'ACTIVE',
            joinDate: '',
            shiftType: 'MORNING',
            addressId: '',
            subDepartmentId: '',
            positionId: '',
        });
        setIsModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (employee) => {
        setIsEditing(true);
        setSelectedEmployee(employee);
        setFormData({
            code: employee.code || '',
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            phone: employee.phone || '',
            dateOfBirth: employee.dateOfBirth || '',
            gender: employee.gender || 'MALE',
            status: employee.status || 'ACTIVE',
            joinDate: employee.joinDate || '',
            shiftType: employee.shiftType || 'MORNING',
            addressId: employee.address?.id || employee.addressId || '',
            subDepartmentId: employee.subDepartment?.id || employee.subDepartmentId || '',
            positionId: employee.position?.id || employee.positionId || '',
        });
        setIsModalOpen(true);
    };

    // Handle form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && selectedEmployee) {
                await apiClient.put(`/api/v1/employees/${selectedEmployee.id}`, formData);
                success('Cập nhật nhân viên thành công');
            } else {
                await apiClient.post('/api/v1/employees', formData);
                success('Thêm nhân viên thành công');
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (err) {
            error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Delete employee
    const handleDelete = (employee) => {
        setDeleteDialog({
            isOpen: true,
            employeeId: employee.id,
            employeeName: employee.fullName,
        });
    };

    const confirmDelete = async () => {
        try {
            await apiClient.delete(`/api/v1/employees/${deleteDialog.employeeId}`);
            success('Xóa nhân viên thành công');
            fetchEmployees();
        } catch (err) {
            error('Không thể xóa nhân viên');
        } finally {
            setDeleteDialog({ isOpen: false, employeeId: null, employeeName: '' });
        }
    };

    // Export Excel
    const handleExport = async () => {
        try {
            const response = await apiClient.get('/api/v1/employees/export', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            success('Xuất Excel thành công');
        } catch (err) {
            error('Không thể xuất Excel');
        }
    };

    // Import Excel
    const handleImport = async () => {
        if (!importFile) {
            error('Vui lòng chọn file để import');
            return;
        }

        setIsImporting(true);

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await apiClient.post(
                '/api/v1/employees/import',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            console.log('Import response:', response.data);
            if (response.data.successCount > 0) {
                success(`Import thành công ${response.data.successCount} bản ghi`);
            } else {
                error(response.data.errors?.join('\n') || 'Import thất bại');
            }
            setImportFile(null);
            fetchEmployees();
        } catch (err) {
            const errors = err.response?.data?.errors;

            if (Array.isArray(errors) && errors.length > 0) {
                error(errors.join('\n'));
            } else {
                error('Import thất bại');
            }
        } finally {
            setIsImporting(false);
        }
    };

    // Create accounts for selected employees
    const handleCreateAccounts = async () => {
        if (selectedIds.length === 0) {
            error('Vui lòng chọn ít nhất 1 nhân viên');
            return;
        }

        setIsCreatingAccounts(true);
        try {
            await apiClient.post('/api/v1/user-accounts/auto', {
                listId: selectedIds
            });
            success(`Tạo tài khoản thành công cho ${selectedIds.length} nhân viên`);
            setSelectedIds([]); // Clear selection after success
        } catch (err) {
            error(err.response?.data?.message || 'Tạo tài khoản thất bại');
        } finally {
            setIsCreatingAccounts(false);
        }
    };

    // Open face registration modal
    const openFaceModal = () => {
        if (selectedIds.length !== 1) {
            error('Vui lòng chọn đúng 1 nhân viên để đăng ký khuôn mặt');
            return;
        }
        const employee = employees.find(emp => emp.id === selectedIds[0]);
        setSelectedEmployeeForFace(employee);
        setFaceFiles([]);
        setIsFaceModalOpen(true);
    };

    // Handle face file selection
    const handleFaceFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFaceFiles(prev => [...prev, ...files]);
    };

    // Remove face file
    const removeFaceFile = (index) => {
        setFaceFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Submit face registration
    const handleRegisterFace = async () => {
        if (faceFiles.length === 0) {
            error('Vui lòng chọn ít nhất 1 ảnh khuôn mặt');
            return;
        }

        setIsRegisteringFace(true);
        const formData = new FormData();
        faceFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await apiClient.post(
                `/api/v1/employees/${selectedEmployeeForFace.id}/faces`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            success('Đăng ký khuôn mặt thành công');
            setIsFaceModalOpen(false);
            setFaceFiles([]);
            setSelectedEmployeeForFace(null);
            setSelectedIds([]); // Clear selection after success
        } catch (err) {
            error(err.response?.data?.message || 'Đăng ký khuôn mặt thất bại');
        } finally {
            setIsRegisteringFace(false);
        }
    };

    /**
     * ============================================
     * BULK FILE UPLOAD - ZIP
     * ============================================
     */

    // Handle file selection for bulk upload
    const handleBulkFileSelect = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
            error('Vui lòng chọn file ZIP');
            return;
        }

        await uploadBulkFiles(selectedFile);

        // Reset input để có thể chọn lại file cùng tên
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload bulk files function
    const uploadBulkFiles = async (file) => {
        setIsUploadingFiles(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post(
                '/api/v1/employees/import-files',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            const result = response.data;
            setUploadResult(result);
            setIsResultModalOpen(true);

            // Hiển thị toast dựa trên kết quả
            if (result.failed === 0) {
                success(`Upload thành công! ${result.success}/${result.total} file đã xử lý.`);
            } else if (result.success === 0) {
                error(`Upload thất bại! ${result.failed}/${result.total} file lỗi.`);
            } else {
                success(`Upload hoàn tất: ${result.success} thành công, ${result.failed} thất bại.`);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Upload file thất bại';
            error(errorMessage);
            console.error('[Bulk Upload Error]', err);
        } finally {
            setIsUploadingFiles(false);
        }
    };

    // Close result modal
    const closeResultModal = () => {
        setIsResultModalOpen(false);
        setUploadResult(null);
    };

    // Table columns
    const columns = [
        { key: 'code', title: 'Mã NV', width: '100px' },
        { key: 'firstName', title: 'Họ' },
        { key: 'lastName', title: 'Tên' },
        { key: 'email', title: 'Email' },
        { key: 'phone', title: 'Số điện thoại', width: '120px' },
        {
            key: 'gender',
            title: 'Giới tính',
            width: '80px',
            render: (value) => value === 'MALE' ? 'Nam' : value === 'FEMALE' ? 'Nữ' : 'Khác'
        },
        {
            key: 'subDepartment',
            title: 'Phòng ban',
            render: (value) => value?.name || ''
        },
        {
            key: 'position',
            title: 'Chức vụ',
            render: (value) => value?.name || ''
        },
        {
            key: 'actions',
            title: 'Thao tác',
            width: '120px',
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="btn-icon btn-edit"
                        onClick={() => openEditModal(row)}
                        title="Sửa"
                    >
                        ✏️
                    </button>
                    {isHRStaff() && (
                        <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(row)}
                            title="Xóa"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="employees-page">
            {/* Page Header */}
            <div className="page-header">
                <h2>Danh sách Nhân viên</h2>
                <div className="header-actions">
                    <label className="btn btn-secondary import-btn">
                        📥 Import Excel
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setImportFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {importFile && (
                        <button
                            className="btn btn-primary"
                            onClick={handleImport}
                            disabled={isImporting}
                        >
                            {isImporting ? '⏳' : '✓'} {importFile.name}
                        </button>
                    )}
                    <button className="btn btn-success" onClick={handleExport}>
                        📤 Export Excel
                    </button>
                    {selectedIds.length > 0 && (
                        <button
                            className="btn btn-warning"
                            onClick={handleCreateAccounts}
                            disabled={isCreatingAccounts}
                            title="Tạo tài khoản cho nhân viên đã chọn"
                        >
                            {isCreatingAccounts ? '⏳' : '👤'} Tạo tài khoản ({selectedIds.length})
                        </button>
                    )}
                    {selectedIds.length === 1 && (
                        <button
                            className="btn btn-info"
                            onClick={openFaceModal}
                            title="Đăng ký khuôn mặt cho nhân viên"
                        >
                            📷 Đăng ký khuôn mặt
                        </button>
                    )}
                    {isHRStaff() && (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            ➕ Thêm nhân viên
                        </button>
                    )}
                    {isHRStaff() && (
                        <label className={`btn btn-secondary ${isUploadingFiles ? 'disabled' : ''}`}>
                            {isUploadingFiles ? '⏳ Đang upload...' : '📦 Upload hồ sơ hàng loạt'}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".zip"
                                onChange={handleBulkFileSelect}
                                disabled={isUploadingFiles}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={employees}
                loading={loading}
                totalItems={totalItems}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                emptyMessage="Không tìm thấy nhân viên nào"
                selectable={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                rowKey="id"
            />

            {/* Debug: Hiển thị mảng ID đã chọn (có thể xóa sau khi test) */}
            {selectedIds.length > 0 && (
                <div className="selected-ids-debug">
                    <strong>Danh sách ID đã chọn:</strong>
                    <code>{JSON.stringify(selectedIds)}</code>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên mới'}
                size="large"
                footer={
                    <ModalFooter>
                        <ModalButton variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </ModalButton>
                        <ModalButton variant="primary" onClick={handleSubmit}>
                            {isEditing ? 'Cập nhật' : 'Thêm mới'}
                        </ModalButton>
                    </ModalFooter>
                }
            >
                <form className="employee-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã nhân viên *</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleFormChange}
                                disabled={isEditing}
                                readOnly={isEditing}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Họ *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tên *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleFormChange}>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleFormChange}>
                                <option value="ACTIVE">Đang làm việc</option>
                                <option value="INACTIVE">Không hoạt động</option>
                                <option value="ON_LEAVE">Tạm nghỉ</option>
                                <option value="RESIGNED">Đã nghỉ việc</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày vào làm</label>
                            <input
                                type="date"
                                name="joinDate"
                                value={formData.joinDate}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ca làm việc</label>
                            <select name="shiftType" value={formData.shiftType} onChange={handleFormChange}>
                                <option value="MORNING">Ca sáng</option>
                                <option value="AFTERNOON">Ca chiều</option>
                                <option value="NIGHT">Ca đêm</option>
                                <option value="FULL_DAY">Cả ngày</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Địa chỉ (ID)</label>
                            <input
                                type="text"
                                name="addressId"
                                value={formData.addressId}
                                onChange={handleFormChange}
                                placeholder="Nhập ID địa chỉ"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phòng ban (ID)</label>
                            <input
                                type="text"
                                name="subDepartmentId"
                                value={formData.subDepartmentId}
                                onChange={handleFormChange}
                                placeholder="Nhập ID phòng ban"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Chức vụ (ID)</label>
                            <input
                                type="text"
                                name="positionId"
                                value={formData.positionId}
                                onChange={handleFormChange}
                                placeholder="Nhập ID chức vụ"
                            />
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, employeeId: null, employeeName: '' })}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${deleteDialog.employeeName}"?`}
                confirmText="Xóa"
                confirmVariant="danger"
            />

            {/* Face Registration Modal */}
            <Modal
                isOpen={isFaceModalOpen}
                onClose={() => setIsFaceModalOpen(false)}
                title={`Đăng ký khuôn mặt - ${selectedEmployeeForFace?.fullName || ''}`}
                size="medium"
                footer={
                    <ModalFooter>
                        <ModalButton variant="secondary" onClick={() => setIsFaceModalOpen(false)}>
                            Hủy
                        </ModalButton>
                        <ModalButton
                            variant="primary"
                            onClick={handleRegisterFace}
                            disabled={isRegisteringFace || faceFiles.length === 0}
                        >
                            {isRegisteringFace ? '⏳ Đang đăng ký...' : '✓ Đăng ký'}
                        </ModalButton>
                    </ModalFooter>
                }
            >
                <div className="face-registration-form">
                    <div className="form-group">
                        <label>Chọn ảnh khuôn mặt *</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFaceFileChange}
                            className="file-input"
                        />
                        <small className="help-text">
                            Có thể chọn nhiều ảnh để đăng ký. Ảnh nên rõ mặt, không đeo kính râm.
                        </small>
                    </div>

                    {faceFiles.length > 0 && (
                        <div className="selected-files">
                            <label>Ảnh đã chọn ({faceFiles.length}):</label>
                            <div className="file-list">
                                {faceFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <span className="file-name">{file.name}</span>
                                        <button
                                            type="button"
                                            className="btn-remove-file"
                                            onClick={() => removeFaceFile(index)}
                                            title="Xóa"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {faceFiles.length > 0 && (
                        <div className="preview-section">
                            <label>Xem trước:</label>
                            <div className="preview-grid">
                                {faceFiles.map((file, index) => (
                                    <div key={index} className="preview-item">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="preview-image"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Bulk Upload Result Modal */}
            <Modal
                isOpen={isResultModalOpen}
                onClose={closeResultModal}
                title="Kết quả Upload hồ sơ hàng loạt"
                size="medium"
                footer={
                    <ModalFooter>
                        <ModalButton variant="primary" onClick={closeResultModal}>
                            Đóng
                        </ModalButton>
                    </ModalFooter>
                }
            >
                {uploadResult && (
                    <div className="bulk-upload-result">
                        {/* Summary Cards */}
                        <div className="result-summary">
                            <div className="result-card total">
                                <div className="result-icon">📁</div>
                                <div className="result-info">
                                    <span className="result-value">{uploadResult.total}</span>
                                    <span className="result-label">Tổng file xử lý</span>
                                </div>
                            </div>
                            <div className="result-card success">
                                <div className="result-icon">✔</div>
                                <div className="result-info">
                                    <span className="result-value">{uploadResult.success}</span>
                                    <span className="result-label">Thành công</span>
                                </div>
                            </div>
                            <div className="result-card failed">
                                <div className="result-icon">✖</div>
                                <div className="result-info">
                                    <span className="result-value">{uploadResult.failed}</span>
                                    <span className="result-label">Thất bại</span>
                                </div>
                            </div>
                        </div>

                        {/* Error List */}
                        {uploadResult.errors && uploadResult.errors.length > 0 && (
                            <div className="error-section">
                                <h4 className="error-title">
                                    ⚠️ Danh sách lỗi ({uploadResult.errors.length})
                                </h4>
                                <ul className="error-list">
                                    {uploadResult.errors.map((err, index) => (
                                        <li key={index} className="error-item">
                                            <span className="error-bullet">•</span>
                                            <span className="error-message">{err}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Success message when no errors */}
                        {(!uploadResult.errors || uploadResult.errors.length === 0) && (
                            <div className="success-message">
                                <div className="success-icon">🎉</div>
                                <p>Tất cả file đã được xử lý thành công!</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Employees;
