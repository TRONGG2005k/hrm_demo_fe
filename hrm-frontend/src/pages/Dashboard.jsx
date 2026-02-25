/**
 * ============================================================
 * DASHBOARD PAGE - HRM Frontend
 * ============================================================
 * Trang tổng quan hệ thống
 * ============================================================
 */

import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useToast } from '../components/Notification';
import { CardSkeleton } from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalDepartments: 0,
        todayAttendance: 0,
        pendingLeaves: 0,
    });
    const [recentActivities, setRecentActivities] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Gọi API lấy thống kê (giả lập data)
            // const response = await apiClient.get('/api/v1/dashboard/stats');
            // setStats(response.data);

            // Mock data cho demo
            setTimeout(() => {
                setStats({
                    totalEmployees: 156,
                    totalDepartments: 8,
                    todayAttendance: 142,
                    pendingLeaves: 5,
                });
                setRecentActivities([
                    { id: 1, action: 'Nhân viên mới', detail: 'Nguyễn Văn A đã được thêm vào', time: '10 phút trước', type: 'success' },
                    { id: 2, action: 'Duyệt nghỉ phép', detail: 'Phê duyệt đơn nghỉ phép #123', time: '30 phút trước', type: 'info' },
                    { id: 3, action: 'Cập nhật hợp đồng', detail: 'Hợp đồng NV-2024-001 đã được cập nhật', time: '1 giờ trước', type: 'warning' },
                    { id: 4, action: 'Tính lương', detail: 'Bảng lương tháng 1/2024 đã được tạo', time: '2 giờ trước', type: 'success' },
                    { id: 5, action: 'Chấm công', detail: '142/156 nhân viên đã chấm công hôm nay', time: '3 giờ trước', type: 'info' },
                ]);
                setLoading(false);
            }, 1000);
        } catch (err) {
            error('Không thể tải dữ liệu dashboard');
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Tổng nhân viên',
            value: stats.totalEmployees,
            icon: '👥',
            color: 'blue',
            trend: '+5%',
            trendUp: true,
        },
        {
            title: 'Phòng ban',
            value: stats.totalDepartments,
            icon: '🏢',
            color: 'green',
            trend: '0%',
            trendUp: true,
        },
        {
            title: 'Chấm công hôm nay',
            value: stats.todayAttendance,
            icon: '⏰',
            color: 'purple',
            trend: '91%',
            trendUp: true,
        },
        {
            title: 'Đơn nghỉ phép chờ duyệt',
            value: stats.pendingLeaves,
            icon: '📋',
            color: 'orange',
            trend: '-2',
            trendUp: false,
        },
    ];

    const getActivityIcon = (type) => {
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
        };
        return icons[type] || '📝';
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <CardSkeleton count={4} />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Stats Cards */}
            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div key={index} className={`stat-card stat-card-${card.color}`}>
                        <div className="stat-icon">{card.icon}</div>
                        <div className="stat-content">
                            <h3 className="stat-value">{card.value.toLocaleString()}</h3>
                            <p className="stat-title">{card.title}</p>
                            <span className={`stat-trend ${card.trendUp ? 'up' : 'down'}`}>
                                {card.trendUp ? '↑' : '↓'} {card.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-grid">
                {/* Recent Activities */}
                <div className="dashboard-card activities-card">
                    <div className="card-header">
                        <h3>📋 Hoạt động gần đây</h3>
                        <button className="btn-view-all">Xem tất cả</button>
                    </div>
                    <div className="card-body">
                        <ul className="activity-list">
                            {recentActivities.map((activity) => (
                                <li key={activity.id} className="activity-item">
                                    <span className="activity-icon">
                                        {getActivityIcon(activity.type)}
                                    </span>
                                    <div className="activity-content">
                                        <p className="activity-action">{activity.action}</p>
                                        <p className="activity-detail">{activity.detail}</p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card quick-actions-card">
                    <div className="card-header">
                        <h3>⚡ Thao tác nhanh</h3>
                    </div>
                    <div className="card-body">
                        <div className="quick-actions-grid">
                            <button className="quick-action-btn">
                                <span className="action-icon">➕</span>
                                <span>Thêm nhân viên</span>
                            </button>
                            <button className="quick-action-btn">
                                <span className="action-icon">📄</span>
                                <span>Tạo hợp đồng</span>
                            </button>
                            <button className="quick-action-btn">
                                <span className="action-icon">💰</span>
                                <span>Tính lương</span>
                            </button>
                            <button className="quick-action-btn">
                                <span className="action-icon">🌴</span>
                                <span>Đơn nghỉ phép</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Chart Placeholder */}
                <div className="dashboard-card chart-card">
                    <div className="card-header">
                        <h3>📊 Chấm công tháng này</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-placeholder">
                            <div className="mock-chart">
                                <div className="mock-bar" style={{ height: '60%' }}></div>
                                <div className="mock-bar" style={{ height: '80%' }}></div>
                                <div className="mock-bar" style={{ height: '45%' }}></div>
                                <div className="mock-bar" style={{ height: '90%' }}></div>
                                <div className="mock-bar" style={{ height: '70%' }}></div>
                                <div className="mock-bar" style={{ height: '85%' }}></div>
                                <div className="mock-bar" style={{ height: '55%' }}></div>
                            </div>
                            <p className="chart-label">Biểu đồ chấm công 7 ngày gần nhất</p>
                        </div>
                    </div>
                </div>

                {/* Birthdays */}
                <div className="dashboard-card birthdays-card">
                    <div className="card-header">
                        <h3>🎂 Sinh nhật sắp tới</h3>
                    </div>
                    <div className="card-body">
                        <ul className="birthday-list">
                            <li className="birthday-item">
                                <div className="birthday-avatar">NA</div>
                                <div className="birthday-info">
                                    <p className="birthday-name">Nguyễn Văn A</p>
                                    <p className="birthday-date">Hôm nay 🎉</p>
                                </div>
                            </li>
                            <li className="birthday-item">
                                <div className="birthday-avatar">TB</div>
                                <div className="birthday-info">
                                    <p className="birthday-name">Trần Thị B</p>
                                    <p className="birthday-date">Ngày mai</p>
                                </div>
                            </li>
                            <li className="birthday-item">
                                <div className="birthday-avatar">LC</div>
                                <div className="birthday-info">
                                    <p className="birthday-name">Lê Văn C</p>
                                    <p className="birthday-date">3 ngày tới</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;