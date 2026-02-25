/**
 * ============================================================
 * SUB DEPARTMENTS PAGE - HRM Frontend
 * ============================================================
 * Quản lý bộ phận: CRUD, Import/Export Excel
 * API: /api/v1/sub-departments
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import { ConfirmDialog } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './SubDepartments.css';

const SubDepartments = () => {
    const { success, error } = useToast();
    const { isHRManager } = useAuth();

    const [subDepartments, setSubDepartments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSubDept, setSelectedSubDept] = useState(null);
    const [formData, setFormData] = useState({
        subDepartmentCode: '',
        subDepartmentName: '',
        departmentId: '',
        description: '',
    });

    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

    // Import state
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchSubDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/sub-departments', {
                params: { page: currentPage - 1, size: pageSize, search: searchTerm },
            });
            setSubDepartments(response.data.content || response.data);
            setTotalItems(response.data.totalElements || response.data.length);
        } catch (err) {
            error('Không thể tải danh sách bộ phận');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, error]);

    const fetchDepartments = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/v1/departments');
            setDepartments(response.data.content || response.data);
        } catch (err) {
            console.error('Không thể tải danh sách phòng ban');
        }
    }, []);

    useEffect(() => {
        fetchSubDepartments();
        fetchDepartments();
    }, [fetchSubDepartments, fetchDepartments]);

    const handleExport = async () => {
        try {
            const response = await apiClient.get('/api/v1/sub-departments/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sub-departments_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                '/api/v1/sub-departments/import',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (response.data.successCount > 0) {
                success(`Import thành công ${response.data.successCount} bản ghi`);
            } else {
                error(response.data.errors?.join('\n') || 'Import thất bại');
            }
            setImportFile(null);
            fetchSubDepartments();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/api/v1/sub-departments/${selectedSubDept.id}`, formData);
                success('Cập nhật bộ phận thành công');
            } else {
                await apiClient.post('/api/v1/sub-departments', formData);
                success('Thêm bộ phận thành công');
            }
            setIsModalOpen(false);
            fetchSubDepartments();
        } catch (err) {
            error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const openEditModal = (subDept) => {
        setIsEditing(true);
        setSelectedSubDept(subDept);
        setFormData({
            subDepartmentCode: subDept.subDepartmentCode || '',
            subDepartmentName: subDept.subDepartmentName || '',
            departmentId: subDept.departmentId || '',
            description: subDept.description || '',
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedSubDept(null);
        setFormData({ subDepartmentCode: '', subDepartmentName: '', departmentId: '', description: '' });
        setIsModalOpen(true);
    };

    const columns = [
        { key: 'id', title: 'Mã BP', width: '100px' },
        { key: 'name', title: 'Tên bộ phận' },
        { key: 'departmentName', title: 'Phòng ban' },
        { key: 'description', title: 'Mô tả' },
        { key: 'employeeCount', title: 'Số NV', width: '80px', render: (v) => v || 0 },
        {
            key: 'actions',
            title: 'Thao tác',
            width: '100px',
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="btn-icon btn-edit" onClick={() => openEditModal(row)}>✏️</button>
                    {isHRManager() && (
                        <button className="btn-icon btn-delete" onClick={() => setDeleteDialog({ isOpen: true, id: row.id, name: row.subDepartmentName })}>🗑️</button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="sub-departments-page">
            <div className="page-header">
                <h2>Quản lý Bộ Phận</h2>
                <div className="header-actions">
                    {isHRManager() && (
                        <>
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
                        </>
                    )}
                    <button className="btn btn-success" onClick={handleExport}>📤 Export</button>
                    {isHRManager() && <button className="btn btn-primary" onClick={openCreateModal}>➕ Thêm bộ phận</button>}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={subDepartments}
                loading={loading}
                totalItems={totalItems}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onSearch={setSearchTerm}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Cập nhật Bộ phận' : 'Thêm Bộ phận'} footer={
                <ModalFooter>
                    <ModalButton variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</ModalButton>
                </ModalFooter>
            }>
                <form className="sub-department-form">
                    <div className="form-group">
                        <label>Mã bộ phận *</label>
                        <input type="text" value={formData.subDepartmentCode} onChange={(e) => setFormData({ ...formData, subDepartmentCode: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Tên bộ phận *</label>
                        <input type="text" value={formData.subDepartmentName} onChange={(e) => setFormData({ ...formData, subDepartmentName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Phòng ban *</label>
                        <select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} required>
                            <option value="">-- Chọn phòng ban --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false })} onConfirm={async () => {
                try {
                    await apiClient.delete(`/api/v1/sub-departments/${deleteDialog.id}`);
                    success('Xóa bộ phận thành công');
                    fetchSubDepartments();
                } catch (err) {
                    error('Không thể xóa bộ phận');
                }
                setDeleteDialog({ isOpen: false });
            }} title="Xác nhận xóa" message={`Xóa bộ phận "${deleteDialog.name}"?`} />
        </div>
    );
};

export default SubDepartments;
