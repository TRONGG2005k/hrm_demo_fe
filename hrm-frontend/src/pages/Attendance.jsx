/**
 * ============================================================
 * ATTENDANCE PAGE - HRM Frontend
 * ============================================================
 * Quản lý chấm công
 * API: /api/v1/attendance
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import { useToast } from '../components/Notification';
import './Attendance.css';

const Attendance = () => {
    const { success, error } = useToast();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/v1/attendance', {
                params: { page: currentPage - 1, size: 10, date: selectedDate },
            });
            setAttendance(response.data.content || response.data);
            setTotalItems(response.data.totalElements || response.data.length);
        } catch (err) {
            error('Không thể tải dữ liệu chấm công');
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedDate, error]);

    useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

    const handleScan = async () => {
        try {
            await apiClient.post('/api/v1/attendance/scan');
            success('Chấm công thành công');
            fetchAttendance();
        } catch (err) {
            error('Chấm công thất bại');
        }
    };

    const columns = [
        { key: 'employeeCode', title: 'Mã NV', width: '100px' },
        { key: 'evaluation', title: 'đánh giá' },
        { key: 'workDate', title: 'Ngày làm việc', render: (v) => v || '-' },
        { key: 'earlyLeaveMinutes', title: 'Số phút nghỉ sớm', width: '120px' },
        { key: 'otMinutes', title: 'Số phút làm thêm', width: '120px' },
        { key: 'otRate', title: 'Tỷ lệ làm thêm', width: '120px' },
        { key: 'lateMinutes', title: 'Số phút đi muộn', width: '120px' },
        { key: 'checkInTime', title: 'Giờ vào', render: (v) => v || '-' },
        { key: 'checkOutTime', title: 'Giờ ra', render: (v) => v || '-' },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (v) => {
                const map = { 'PRESENT': { label: 'Có mặt', class: 'status-present' }, 'ABSENT': { label: 'Vắng', class: 'status-absent' }, 'LATE': { label: 'Đi muộn', class: 'status-late' } };
                const s = map[v] || { label: v, class: '' };
                return <span className={`status-badge ${s.class}`}>{s.label}</span>;
            }
        },
    ];

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h2>Chấm Công</h2>
                <div className="header-actions">
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-picker" />
                    <button className="btn btn-primary" onClick={handleScan}>📷 Quét chấm công</button>
                </div>
            </div>
            <DataTable columns={columns} data={attendance} loading={loading} totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} emptyMessage="Không có dữ liệu chấm công" />
        </div>
    );
};

export default Attendance;