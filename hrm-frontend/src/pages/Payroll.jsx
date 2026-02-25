/**
 * ============================================================
 * PAYROLL PAGE - HRM Frontend
 * ============================================================
 * Quản lý tính lương
 * API: /api/v1/payroll
 * ============================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import PayrollApprovalModal from '../components/PayrollApprovalModal';
import { useToast } from '../components/Notification';
import { useAuth } from '../auth/AuthContext';
import './Payroll.css';

const Payroll = () => {
    const { success, error } = useToast();
    const { isHRManager } = useAuth();

    // Data states
    const [payroll, setPayroll] = useState([]);
    const [payrollStatus, setPayrollStatus] = useState(null); // DRAFT, APPROVED, etc.
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Modal states
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // Parse month and year from selectedMonth (format: "YYYY-MM")
    const { month, year } = useMemo(() => {
        const [y, m] = selectedMonth.split('-');
        return { month: parseInt(m), year: parseInt(y) };
    }, [selectedMonth]);

    // Tính tổng tiền lương của tháng
    const totalPayrollAmount = useMemo(() => {
        return payroll.reduce((sum, item) => sum + (Number(item.totalSalary) || 0), 0);
    }, [payroll]);

    // Kiểm tra có hiển thị nút duyệt lương không
    const canShowApproveButton = useMemo(() => {
        return isHRManager() && payrollStatus === 'DRAFT' && payroll.length > 0;
    }, [isHRManager, payrollStatus, payroll.length]);

    // Fetch payroll data
    const fetchPayroll = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/payroll/month', {
                params: {
                    month: month,
                    year: year,
                    page: currentPage - 1,
                    size: 10
                },
            });

            const data = response.data.content || response.data;
            setPayroll(data);
            setTotalItems(response.data.totalElements || data.length);

            // Lấy status từ dữ liệu (giả sử tất cả records cùng status)
            // Hoặc có thể backend trả về status riêng
            if (data.length > 0 && data[0].status) {
                setPayrollStatus(data[0].status);
            } else {
                // Mặc định là DRAFT nếu có data
                setPayrollStatus(data.length > 0 ? 'DRAFT' : null);
            }
        } catch (err) {
            error('Không thể tải dữ liệu lương');
        } finally {
            setLoading(false);
        }
    }, [currentPage, month, year, error]);

    useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

    // Tính lương cho tất cả nhân viên
    const handleCalculateAll = async () => {
        try {
            await apiClient.post(`/api/v1/payroll?month=${month}&year=${year}`);
            success('Tính lương cho tất cả nhân viên thành công');
            fetchPayroll();
        } catch (err) {
            error('Tính lương thất bại');
        }
    };

    // Mở modal duyệt lương
    const handleOpenApprovalModal = useCallback(() => {
        setIsApprovalModalOpen(true);
    }, []);

    // Đóng modal duyệt lương
    const handleCloseApprovalModal = useCallback(() => {
        setIsApprovalModalOpen(false);
    }, []);

    // Xử lý duyệt lương
    const handleApprovePayroll = useCallback(async (comment) => {
        setIsApproving(true);
        try {
            const requestBody = {
                month: month,
                year: year,
                comment: comment || '',
                status: 'APPROVED'
            };

            await apiClient.post('/api/v1/payroll/approval', requestBody);

            success('Duyệt lương thành công');
            setIsApprovalModalOpen(false);

            // Reload danh sách payroll
            await fetchPayroll();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Không thể duyệt lương';
            error(errorMessage);
        } finally {
            setIsApproving(false);
        }
    }, [month, year, success, error, fetchPayroll]);

    // Duyệt lương từng dòng (cũ - giữ lại để tương thích)
    const handleApprove = async (id) => {
        try {
            await apiClient.post('/api/v1/payroll/approval', { payrollId: id, approved: true });
            success('Duyệt lương thành công');
            fetchPayroll();
        } catch (err) {
            error('Không thể duyệt lương');
        }
    };

    // Export Excel
    const handleExport = async () => {
        try {
            const response = await apiClient.get(`/api/v1/payroll/export/month?month=${month}&year=${year}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payroll_${selectedMonth}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            success('Xuất bảng lương thành công');
        } catch (err) {
            error('Không thể xuất Excel');
        }
    };

    const columns = [
        { key: 'employeeCode', title: 'Mã NV', width: '100px' },
        { key: 'fullName', title: 'Họ tên' },
        {
            key: 'period',
            title: 'Kỳ lương',
            render: (_, row) => `${row.month || month}/${row.year || year}`
        },
        {
            key: 'baseSalary',
            title: 'Lương CB',
            render: (v) => Number(v).toLocaleString('vi-VN') + ' đ'
        },
        {
            key: 'totalAllowance',
            title: 'Phụ cấp',
            render: (v) => Number(v).toLocaleString('vi-VN') + ' đ'
        },
        {
            key: 'totalDeductions',
            title: 'Khấu trừ',
            render: (v) => Number(v).toLocaleString('vi-VN') + ' đ'
        },
        {
            key: 'totalSalary',
            title: 'Thực lĩnh',
            render: (v) => <strong>{Number(v).toLocaleString('vi-VN')} đ</strong>
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (v) => {
                const map = {
                    'DRAFT': { label: 'Bản nháp', class: 'status-draft' },
                    'PENDING': { label: 'Chờ duyệt', class: 'status-pending' },
                    'APPROVED': { label: 'Đã duyệt', class: 'status-approved' },
                    'PAID': { label: 'Đã thanh toán', class: 'status-paid' }
                };
                const s = map[v] || { label: v, class: '' };
                return <span className={`status-badge ${s.class}`}>{s.label}</span>;
            }
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'PENDING' && isHRManager() && (
                        <button
                            className="btn-icon btn-approve"
                            onClick={() => handleApprove(row.id)}
                            title="Duyệt"
                        >
                            ✓
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="payroll-page">
            <div className="page-header">
                <h2>Tính Lương</h2>
                <div className="header-actions">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-picker"
                    />
                    <button className="btn btn-success" onClick={handleExport}>
                        📤 Export
                    </button>
                    {isHRManager() && (
                        <button className="btn btn-primary" onClick={handleCalculateAll}>
                            🧮 Tính lương tháng
                        </button>
                    )}
                    {canShowApproveButton && (
                        <button
                            className="btn btn-approve-payroll"
                            onClick={handleOpenApprovalModal}
                        >
                            ✅ Duyệt lương
                        </button>
                    )}
                </div>
            </div>

            {/* Status indicator */}
            {payrollStatus && (
                <div className="payroll-status-bar">
                    <span className="status-label">Trạng thái bảng lương:</span>
                    <span className={`status-badge status-${payrollStatus.toLowerCase()}`}>
                        {payrollStatus === 'DRAFT' && 'Bản nháp'}
                        {payrollStatus === 'PENDING' && 'Chờ duyệt'}
                        {payrollStatus === 'APPROVED' && 'Đã duyệt'}
                        {payrollStatus === 'PAID' && 'Đã thanh toán'}
                    </span>
                </div>
            )}

            <DataTable
                columns={columns}
                data={payroll}
                loading={loading}
                totalItems={totalItems}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                emptyMessage="Chưa có dữ liệu lương"
            />

            {/* Payroll Approval Modal */}
            <PayrollApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={handleCloseApprovalModal}
                onConfirm={handleApprovePayroll}
                month={month}
                year={year}
                totalAmount={totalPayrollAmount}
                isLoading={isApproving}
                currency="VND"
            />
        </div>
    );
};

export default Payroll;
