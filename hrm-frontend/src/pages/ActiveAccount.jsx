/**
 * ============================================================
 * ACTIVE ACCOUNT PAGE - HRM Frontend
 * ============================================================
 * Trang kích hoạt tài khoản - chỉ có form nhập password
 * ============================================================
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import './ActiveAccount.css';

const ActiveAccount = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Form state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle submit
    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp');
            return;
        }

        if (!token) {
            setError('Token không hợp lệ');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('api/v1/auth/activate', {
                token,
                password,
            });

            // Chuyển về login sau khi thành công
            alert('Kích hoạt tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login', { state: { message: 'Kích hoạt tài khoản thành công! Vui lòng đăng nhập.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Kích hoạt tài khoản thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="active-account-page">
            <div className="active-account-container">
                <div className="active-account-form-wrapper">
                    <div className="active-account-header">
                        <span className="active-account-icon">🔐</span>
                        <h1>Kích hoạt tài khoản</h1>
                        <p>Vui lòng tạo mật khẩu cho tài khoản của bạn</p>
                    </div>

                    <form className="active-account-form">
                        {error && (
                            <div className="active-account-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    disabled={isLoading}
                                    autoFocus
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

                        <div className="form-group">
                            <label>Nhập lại mật khẩu</label>
                            <div className="input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="active-account-btn"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Đang tạo...
                                </>
                            ) : (
                                'Tạo'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ActiveAccount;
