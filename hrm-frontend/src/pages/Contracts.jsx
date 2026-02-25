/**
 * ============================================================
 * CONTRACTS PAGE - HRM Frontend
 * ============================================================
 * Quản lý hợp đồng: CRUD, Import/Export Excel, Duyệt hợp đồng
 * API: /api/v1/contract
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import { ConfirmDialog } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './Contracts.css';

const Contracts = () => {
    const { success, error } = useToast();
    const { isHRManager, isHRStaff } = useAuth();

    // State
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // active, not-active
    const [selectedIds, setSelectedIds] = useState([]);

    // Import state
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [formData, setFormData] = useState({
        contractCode: '',
        employeeId: '',
        contractType: 'FULL_TIME',
        startDate: '',
        endDate: '',
        baseSalary: '',
        status: 'PENDING',
    });

    // Fetch contracts
    const fetchContracts = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'active'
                ? '/api/v1/contract'
                : '/api/v1/contract/not-active';

            const response = await apiClient.get(endpoint, {
                params: {
                    page: currentPage - 1,
                    size: pageSize,
                    search: searchTerm,
                },
            });
            setContracts(response.data.content || response.data);
            setTotalItems(response.data.totalElements || response.data.length);
        } catch (err) {
            error('Không thể tải danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, pageSize, searchTerm, error]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // Handle approve contract
    const handleApprove = async (contract) => {
        try {
            await apiClient.post(`/api/v1/contract/${contract.id}/approve`);
            success('Duyệt hợp đồng thành công');
            fetchContracts();
        } catch (err) {
            error('Không thể duyệt hợp đồng');
        }
    };

    // Export Excel
    const handleExport = async () => {
        try {
            const response = await apiClient.get('/api/v1/contract/export', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contracts_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                '/api/v1/contract/import',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            if (response.data.successCount > 0) {
                success(`Import thành công ${response.data.successCount} bản ghi`);
            } else {
                error(response.data.errors?.join('\n') || 'Import thất bại');
            }
            setImportFile(null);
            fetchContracts();
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

    // Table columns
    const columns = [
        { key: 'contractCode', title: 'Mã HĐ', width: '100px' },
        { key: 'employeeName', title: 'Nhân viên' },
        {
            key: 'contractType',
            title: 'Loại HĐ',
            render: (value) => ({
                'FULL_TIME': 'Toàn thờ gian',
                'PART_TIME': 'Bán thờ gian',
                'INTERNSHIP': 'Thực tập',
                'PROBATION': 'Thử việc',
            }[value] || value)
        },
        {
            key: 'startDate',
            title: 'Ngày bắt đầu',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
        },
        {
            key: 'endDate',
            title: 'Ngày kết thúc',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Vô thờ hạn'
        },
        {
            key: 'baseSalary',
            title: 'Lương cơ bản',
            render: (value) => value ? `${Number(value).toLocaleString('vi-VN')} đ` : '-'
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (value) => {
                const statusMap = {
                    'PENDING': { label: 'Chờ duyệt', class: 'status-pending' },
                    'ACTIVE': { label: 'Đang hiệu lực', class: 'status-active' },
                    'EXPIRED': { label: 'Hết hạn', class: 'status-expired' },
                    'TERMINATED': { label: 'Đã chấm dứt', class: 'status-terminated' },
                };
                const status = statusMap[value] || { label: value, class: '' };
                return <span className={`status-badge ${status.class}`}>{status.label}</span>;
            }
        },
        {
            key: 'actions',
            title: 'Thao tác',
            width: '150px',
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'PENDING' && isHRManager() && (
                        <button
                            className="btn-icon btn-approve"
                            onClick={() => handleApprove(row)}
                            title="Duyệt"
                        >
                            ✓
                        </button>
                    )}
                    <button
                        className="btn-icon btn-edit"
                        onClick={() => openEditModal(row)}
                        title="Sửa"
                    >
                        ✏️
                    </button>
                </div>
            ),
        },
    ];

    const openEditModal = (contract) => {
        setIsEditing(true);
        setSelectedContract(contract);
        setFormData({
            contractCode: contract.contractCode || '',
            employeeId: contract.employeeId || '',
            contractType: contract.contractType || 'FULL_TIME',
            startDate: contract.startDate || '',
            endDate: contract.endDate || '',
            baseSalary: contract.baseSalary || '',
            status: contract.status || 'PENDING',
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedContract(null);
        setFormData({
            contractCode: '',
            employeeId: '',
            contractType: 'FULL_TIME',
            startDate: '',
            endDate: '',
            baseSalary: '',
            status: 'PENDING',
        });
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && selectedContract) {
                await apiClient.put(`/api/v1/contract/${selectedContract.id}`, formData);
                success('Cập nhật hợp đồng thành công');
            } else {
                await apiClient.post('/api/v1/contract', formData);
                success('Tạo hợp đồng thành công');
            }
            setIsModalOpen(false);
            fetchContracts();
        } catch (err) {
            error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="contracts-page">
            <div className="page-header">
                <h2>Quản lý Hợp đồng</h2>
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
                    <button className="btn btn-success" onClick={handleExport}>
                        📤 Export Excel
                    </button>
                    {isHRStaff() && (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            ➕ Thêm hợp đồng
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Đang hiệu lực
                </button>
                <button
                    className={`tab ${activeTab === 'not-active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('not-active')}
                >
                    Hết hiệu lực
                </button>
            </div>

            <DataTable
                columns={columns}
                data={contracts}
                loading={loading}
                totalItems={totalItems}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onSearch={setSearchTerm}
                emptyMessage="Không tìm thấy hợp đồng nào"
                selectable={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                rowKey="id"
            />

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Cập nhật Hợp đồng' : 'Thêm Hợp đồng mới'}
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
                <form className="contract-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã hợp đồng *</label>
                            <input
                                type="text"
                                name="contractCode"
                                value={formData.contractCode}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nhân viên *</label>
                            <select name="employeeId" value={formData.employeeId} onChange={handleFormChange} required>
                                <option value="">-- Chọn nhân viên --</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Loại hợp đồng</label>
                            <select name="contractType" value={formData.contractType} onChange={handleFormChange}>
                                <option value="FULL_TIME">Toàn thờ gian</option>
                                <option value="PART_TIME">Bán thờ gian</option>
                                <option value="INTERNSHIP">Thực tập</option>
                                <option value="PROBATION">Thử việc</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Lương cơ bản</label>
                            <input
                                type="number"
                                name="baseSalary"
                                value={formData.baseSalary}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày bắt đầu *</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày kết thúc</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Contracts;