/**
 * ============================================================
 * DEPARTMENTS PAGE - HRM Frontend
 * ============================================================
 * Quản lý phòng ban: CRUD, Import/Export Excel
 * API: /api/v1/departments
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import { ConfirmDialog } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './Departments.css';

const Departments = () => {
    const { success, error } = useToast();
    const { isHRManager } = useAuth();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({
        departmentCode: '',
        departmentName: '',
        description: '',
        managerId: '',
    });

    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

    // Import state
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/departments', {
                params: { page: currentPage - 1, size: pageSize, search: searchTerm },
            });
            setDepartments(response.data.content || response.data);
            setTotalItems(response.data.totalElements || response.data.length);
        } catch (err) {
            error('Không thể tải danh sách phòng ban');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, error]);

    useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

    const handleExport = async () => {
        try {
            const response = await apiClient.get('/api/v1/departments/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `departments_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                '/api/v1/departments/import',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (response.data.successCount > 0) {
                success(`Import thành công ${response.data.successCount} bản ghi`);
            } else {
                error(response.data.errors?.join('\n') || 'Import thất bại');
            }
            setImportFile(null);
            fetchDepartments();
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
                await apiClient.put(`/api/v1/departments/${selectedDept.id}`, formData);
                success('Cập nhật phòng ban thành công');
            } else {
                await apiClient.post('/api/v1/departments', formData);
                success('Thêm phòng ban thành công');
            }
            setIsModalOpen(false);
            fetchDepartments();
        } catch (err) {
            error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const openEditModal = (dept) => {
        setIsEditing(true);
        setSelectedDept(dept);
        setFormData({
            departmentCode: dept.departmentCode || '',
            departmentName: dept.departmentName || '',
            description: dept.description || '',
            managerId: dept.managerId || '',
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedDept(null);
        setFormData({ departmentCode: '', departmentName: '', description: '', managerId: '' });
        setIsModalOpen(true);
    };

    const columns = [
        // { key: 'departmentCode', title: 'Mã PB', width: '100px' },
        { key: 'name', title: 'Tên phòng ban' },
        { key: 'description', title: 'Mô tả' },
        // { key: 'managerName', title: 'Trưởng phòng' },
        { key: 'subDepartmentResponses', title: 'Số bộ phận', width: '80px', render: (v) => v.length || 0 },
        {
            key: 'actions',
            title: 'Thao tác',
            width: '100px',
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="btn-icon btn-edit" onClick={() => openEditModal(row)}>✏️</button>
                    {isHRManager() && (
                        <button className="btn-icon btn-delete" onClick={() => setDeleteDialog({ isOpen: true, id: row.id, name: row.departmentName })}>🗑️</button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="departments-page">
            <div className="page-header">
                <h2>Quản lý Phòng Ban</h2>
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
                    {isHRManager() && <button className="btn btn-primary" onClick={openCreateModal}>➕ Thêm phòng ban</button>}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={departments}
                loading={loading}
                totalItems={totalItems}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onSearch={setSearchTerm}
                selectable={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                rowKey="id"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Cập nhật Phòng ban' : 'Thêm Phòng ban'} footer={
                <ModalFooter>
                    <ModalButton variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</ModalButton>
                </ModalFooter>
            }>
                <form className="department-form">
                    <div className="form-group">
                        <label>Mã phòng ban *</label>
                        <input type="text" value={formData.departmentCode} onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Tên phòng ban *</label>
                        <input type="text" value={formData.departmentName} onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false })} onConfirm={async () => {
                try {
                    await apiClient.delete(`/api/v1/departments/${deleteDialog.id}`);
                    success('Xóa phòng ban thành công');
                    fetchDepartments();
                } catch (err) {
                    error('Không thể xóa phòng ban');
                }
                setDeleteDialog({ isOpen: false });
            }} title="Xác nhận xóa" message={`Xóa phòng ban "${deleteDialog.name}"?`} />
        </div>
    );
};

export default Departments;