/**
 * ============================================================
 * LOGIN PAGE - HRM Frontend
 * ============================================================
 * Trang đăng nhập hệ thống
 * ============================================================
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, hasRole } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Lấy redirect path từ location state
    const from = location.state?.from?.pathname || '/dashboard';

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user types
        if (error) setError('');
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username.trim() || !formData.password.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }

        setError('');

        const result = await login(formData.username, formData.password);

        if (result.success) {
            // Lưu username nếu remember me
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', formData.username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // Kiểm tra role và redirect phù hợp
            const userRoles = result.user?.roles || [];
            // Nếu roles là chuỗi (ví dụ: "ROLE_HR_MANAGER ROLE_EMPLOYEE"), tách thành mảng
            const userRolesArray = Array.isArray(userRoles)
                ? userRoles
                : (typeof userRoles === 'string' ? userRoles.split(' ') : [userRoles]);

            // Nếu chỉ có ROLE_EMPLOYEE (không có role admin/manager khác), redirect đến employee-dashboard
            const isOnlyEmployee = userRolesArray.includes('ROLE_EMPLOYEE') &&
                !userRolesArray.some(role => ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER'].includes(role));

            if (isOnlyEmployee) {
                navigate('/employee-dashboard', { replace: true });
            } else {
                // Redirect theo path ban đầu hoặc dashboard
                navigate(from, { replace: true });
            }
        } else {
            setError(result.error || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left side - Login form */}
                <div className="login-form-section">
                    <div className="login-header">
                        <div className="login-logo">
                            <span className="logo-icon">🏢</span>
                            <h1>HRM System</h1>
                        </div>
                        <p className="login-subtitle">Đăng nhập để tiếp tục</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="login-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    disabled={isLoading}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>© 2024 HRM System. All rights reserved.</p>
                    </div>
                </div>

                {/* Right side - Illustration */}
                <div className="login-illustration">
                    <div className="illustration-content">
                        <h2>Quản lý nhân sự thông minh</h2>
                        <p>
                            Giải pháp quản lý nhân sự toàn diện giúp doanh nghiệp
                            tối ưu hóa quy trình tuyển dụng, đánh giá và phát triển nhân tài.
                        </p>
                        <div className="feature-list">
                            <div className="feature-item">
                                <span className="feature-icon">👥</span>
                                <span>Quản lý nhân viên</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>Báo cáo & Phân tích</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔐</span>
                                <span>Bảo mật cao cấp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
