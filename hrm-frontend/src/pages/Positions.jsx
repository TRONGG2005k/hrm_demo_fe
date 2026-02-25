/**
 * ============================================================
 * POSITIONS PAGE - HRM Frontend
 * ============================================================
 * Quản lý chức vụ: CRUD, Import/Export Excel
 * API: /api/v1/positions
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './Positions.css';

const Positions = () => {
    const { success, error } = useToast();
    const { isHRManager, isHRStaff } = useAuth();

    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [formData, setFormData] = useState({ positionCode: '', positionName: '', level: 1, description: '' });

    // Import state
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchPositions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/positions');
            setPositions(response.data.content || response.data);
        } catch (err) {
            error('Không thể tải danh sách chức vụ');
        } finally {
            setLoading(false);
        }
    }, [error]);

    useEffect(() => { fetchPositions(); }, [fetchPositions]);

    const handleExport = async () => {
        try {
            const response = await apiClient.get('/api/v1/positions/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `positions_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                '/api/v1/positions/import',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (response.data.successCount > 0) {
                success(`Import thành công ${response.data.successCount} bản ghi`);
            } else {
                error(response.data.errors?.join('\n') || 'Import thất bại');
            }
            setImportFile(null);
            fetchPositions();
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
                await apiClient.put(`/api/v1/positions/${selectedPosition.id}`, formData);
                success('Cập nhật chức vụ thành công');
            } else {
                await apiClient.post('/api/v1/positions', formData);
                success('Thêm chức vụ thành công');
            }
            setIsModalOpen(false);
            fetchPositions();
        } catch (err) {
            error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const columns = [
        { key: 'code', title: 'Mã CV', width: '100px' },
        { key: 'name', title: 'Tên chức vụ' },
        // { key: 'level', title: 'Cấp bậc', width: '80px' },
        { key: 'description', title: 'Mô tả' },
        {
            key: 'actions',
            title: 'Thao tác',
            width: '100px',
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="btn-icon btn-edit" onClick={() => { setIsEditing(true); setSelectedPosition(row); setFormData(row); setIsModalOpen(true); }}>✏️</button>
                    {isHRManager() && <button className="btn-icon btn-delete" onClick={async () => { if (confirm(`Xóa chức vụ "${row.positionName}"?`)) { try { await apiClient.delete(`/api/v1/positions/${row.id}`); success('Xóa thành công'); fetchPositions(); } catch { error('Không thể xóa'); } } }}>🗑️</button>}
                </div>
            ),
        },
    ];

    return (
        <div className="positions-page">
            <div className="page-header">
                <h2>Quản lý Chức Vụ</h2>
                <div className="header-actions">
                    {isHRStaff() && (
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
                    {isHRStaff() && <button className="btn btn-primary" onClick={() => { setIsEditing(false); setFormData({ positionCode: '', positionName: '', level: 1, description: '' }); setIsModalOpen(true); }}>➕ Thêm chức vụ</button>}
                </div>
            </div>
            <DataTable
                columns={columns}
                data={positions}
                loading={loading}
                emptyMessage="Không có chức vụ nào"
                selectable={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                rowKey="id"
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Cập nhật Chức vụ' : 'Thêm Chức vụ'} footer={
                <ModalFooter>
                    <ModalButton variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</ModalButton>
                </ModalFooter>
            }>
                <form className="position-form">
                    <div className="form-group"><label>Mã chức vụ *</label><input type="text" value={formData.positionCode} onChange={(e) => setFormData({ ...formData, positionCode: e.target.value })} required /></div>
                    <div className="form-group"><label>Tên chức vụ *</label><input type="text" value={formData.positionName} onChange={(e) => setFormData({ ...formData, positionName: e.target.value })} required /></div>
                    <div className="form-group"><label>Cấp bậc</label><input type="number" value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })} /></div>
                    <div className="form-group"><label>Mô tả</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                </form>
            </Modal>
        </div>
    );
};

export default Positions;