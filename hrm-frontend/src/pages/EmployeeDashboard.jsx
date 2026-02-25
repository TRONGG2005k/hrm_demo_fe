/**
 * ============================================================
 * EMPLOYEE DASHBOARD - HRM Frontend
 * ============================================================
 * Trang dashboard độc lập cho ROLE_EMPLOYEE
 * Chỉ hiển thị "Hello World"
 * ============================================================
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="employee-dashboard">
            {/* Header */}
            <header className="employee-header">
                <div className="employee-header-left">
                    <div className="employee-logo">
                        <span className="logo-icon">🏢</span>
                        <span className="logo-text">HRM System</span>
                    </div>
                </div>

                <div className="employee-header-right">
                    {/* Notifications */}
                    <button className="header-btn notification-btn">
                        <span className="icon">🔔</span>
                        <span className="badge">3</span>
                    </button>

                    {/* User Menu */}
                    <div className="user-menu-container">
                        <button
                            className="user-menu-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="user-avatar">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </div>
                            <span className="user-name">
                                {user?.fullName || user?.username || 'User'}
                            </span>
                            <span className="dropdown-icon">▼</span>
                        </button>

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">
                                    <strong>{user?.fullName || user?.username}</strong>
                                    <small>{user?.email}</small>
                                    <div className="user-roles">
                                        {(Array.isArray(user?.roles) ? user.roles : [user?.roles]).filter(Boolean).map(role => (
                                            <span key={role} className="role-badge">
                                                {role.replace('ROLE_', '')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item" onClick={() => alert('Tính năng đang phát triển')}>
                                    <span>👤</span> Hồ sơ cá nhân
                                </button>
                                <button className="dropdown-item" onClick={() => alert('Tính năng đang phát triển')}>
                                    <span>⚙️</span> Cài đặt
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout-item" onClick={handleLogout}>
                                    <span>🚪</span> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="employee-dashboard-content">
                <h1>Hello World</h1>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
