/**
 * ============================================================
 * MAIN LAYOUT - HRM Frontend
 * ============================================================
 * Layout chính của ứng dụng với Sidebar và Header
 * Cấu trúc: Flex layout với h-screen và overflow-hidden
 * ============================================================
 */

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './MainLayout.css';

const MainLayout = () => {
    const { user, logout, isAdmin, isHRManager, isHRStaff } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Handle logout
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Menu items với phân quyền
    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: null },
        {
            path: '/employees',
            label: 'Quản lý Nhân viên',
            icon: '👥',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER']
        },
        {
            path: '/contracts',
            label: 'Quản lý Hợp đồng',
            icon: '📄',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']
        },
        {
            path: '/departments',
            label: 'Phòng Ban',
            icon: '🏢',
            roles: null
        },
        {
            path: '/sub-departments',
            label: 'Bộ Phận',
            icon: '🏭',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']
        },
        {
            path: '/positions',
            label: 'Chức Vụ',
            icon: '💼',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']
        },
        {
            path: '/attendance',
            label: 'Chấm Công',
            icon: '⏰',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER']
        },
        {
            path: '/payroll',
            label: 'Tính Lương',
            icon: '💰',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']
        },
        {
            path: '/leave',
            label: 'Nghỉ Phép',
            icon: '🌴',
            roles: null
        },
        {
            path: '/users',
            label: 'Quản lý Users',
            icon: '🔐',
            roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER']
        },
    ];

    // Filter menu items theo quyền
    const filteredMenuItems = menuItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.some(role => {
            if (role === 'ROLE_ADMIN') return isAdmin();
            if (role === 'ROLE_HR_MANAGER') return isHRManager();
            if (role === 'ROLE_HR_STAFF') return isHRStaff();
            if (role === 'ROLE_MANAGER') {
                const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
                return userRoles?.includes('ROLE_MANAGER');
            }
            return false;
        });
    });

    return (
        <div className="main-layout">
            {/* Sidebar - Fixed width, no shrink */}
            <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">🏢</span>
                        {isSidebarOpen && <span className="logo-text">HRM System</span>}
                    </div>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {filteredMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            title={!isSidebarOpen ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {isSidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {isSidebarOpen && (
                        <div className="app-version">
                            v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-content-wrapper">
                {/* Header - Fixed height, no shrink */}
                <header className="header">
                    <div className="header-left">
                        <h1 className="page-title">
                            {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'HRM System'}
                        </h1>
                    </div>

                    <div className="header-right">
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
                                    <Link to="/profile" className="dropdown-item">
                                        <span>👤</span> Hồ sơ cá nhân
                                    </Link>
                                    <Link to="/settings" className="dropdown-item">
                                        <span>⚙️</span> Cài đặt
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                                        <span>🚪</span> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content - Scrollable area */}
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
