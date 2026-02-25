/**
 * ============================================================
 * LEAVE PAGE - HRM Frontend
 * ============================================================
 * Quản lý nghỉ phép và import leave
 * API: /api/v1/leave-requests
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './Leave.css';

const Leave = () => {
    const { success, error } = useToast();
    const { isHRStaff, isManager } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '', type: 'ANNUAL' });
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/leave-requests', { params: { page: currentPage - 1, size: 10 } });
            setLeaves(response.data.content || response.data);
            setTotalItems(response.data.totalElements || response.data.length);
        } catch (err) {
            error('Không thể tải dữ liệu nghỉ phép');
        } finally {
            setLoading(false);
        }
    }, [currentPage, error]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/v1/leave-requests', formData);
            success('Gửi đơn nghỉ phép thành công');
            setIsModalOpen(false);
            fetchLeaves();
        } catch (err) {
            error('Gửi đơn thất bại');
        }
    };

    const handleApprove = async (id, approved) => {
        try {
            await apiClient.post(`/api/v1/leave-requests/${id}/approve`, { approved });
            success(approved ? 'Đã phê duyệt' : 'Đã từ chối');
            fetchLeaves();
        } catch (err) {
            error('Thao tác thất bại');
        }
    };

    const handleImport = async () => {
        if (!importFile) { error('Chọn file để import'); return; }
        setIsImporting(true);
        const fd = new FormData();
        fd.append('file', importFile);
        try {
            await apiClient.post('/api/v1/leave-requests/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            success('Import thành công');
            setImportFile(null);
            fetchLeaves();
        } catch (err) {
            error('Import thất bại');
        } finally {
            setIsImporting(false);
        }
    };

    const columns = [
        { key: 'employeeCode', title: 'Nhân viên' },
        { key: 'type', title: 'Loại', render: (v) => ({ 'ANNUAL': 'Năm', 'SICK': 'Ốm', 'UNPAID': 'Không lương' }[v] || v) },
        { key: 'startDate', title: 'Từ ngày', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
        { key: 'endDate', title: 'Đến ngày', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
        { key: 'reason', title: 'Lý do' },
        { key: 'status', title: 'Trạng thái', render: (v) => ({ 'PENDING': { label: 'Chờ duyệt', class: 'status-pending' }, 'APPROVED': { label: 'Đã duyệt', class: 'status-approved' }, 'REJECTED': { label: 'Từ chối', class: 'status-rejected' } }[v] ? <span className={`status-badge ${({ 'PENDING': 'status-pending', 'APPROVED': 'status-approved', 'REJECTED': 'status-rejected' }[v])}`}>{({ 'PENDING': 'Chờ duyệt', 'APPROVED': 'Đã duyệt', 'REJECTED': 'Từ chối' }[v])}</span> : v) },
        { key: 'actions', title: 'Thao tác', render: (_, row) => row.status === 'PENDING' && isManager() ? <div className="action-buttons"><button className="btn-icon btn-approve" onClick={() => handleApprove(row.id, true)}>✓</button><button className="btn-icon btn-reject" onClick={() => handleApprove(row.id, false)}>✕</button></div> : null },
    ];

    return (
        <div className="leave-page">
            <div className="page-header">
                <h2>Quản lý Nghỉ Phép</h2>
                <div className="header-actions">
                    <label className="btn btn-secondary">📥 Import<input type="file" accept=".xlsx" onChange={(e) => setImportFile(e.target.files[0])} style={{ display: 'none' }} /></label>
                    {importFile && <button className="btn btn-primary" onClick={handleImport} disabled={isImporting}>{isImporting ? '⏳' : '✓'} {importFile.name}</button>}
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Xin nghỉ</button>
                </div>
            </div>
            <DataTable columns={columns} data={leaves} loading={loading} totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} emptyMessage="Không có đơn nghỉ phép" />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo đơn nghỉ phép" footer={<ModalFooter><ModalButton variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</ModalButton><ModalButton variant="primary" onClick={handleSubmit}>Gửi đơn</ModalButton></ModalFooter>}>
                <form className="leave-form">
                    <div className="form-group"><label>Loại nghỉ</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}><option value="ANNUAL">Nghỉ phép năm</option><option value="SICK">Nghỉ ốm</option><option value="UNPAID">Nghỉ không lương</option></select></div>
                    <div className="form-row">
                        <div className="form-group"><label>Từ ngày *</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                        <div className="form-group"><label>Đến ngày *</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required /></div>
                    </div>
                    <div className="form-group"><label>Lý do</label><textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={3} /></div>
                </form>
            </Modal>
        </div>
    );
};

export default Leave;