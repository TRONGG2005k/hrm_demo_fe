/**
 * ============================================================
 * NOTIFICATION COMPONENT - HRM Frontend
 * ============================================================
 * Component thông báo toast và alert
 * ============================================================
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import './Notification.css';

// ============================================
// TOAST NOTIFICATION
// ============================================
const Toast = ({ id, type, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={() => onClose(id)}>
                ✕
            </button>
        </div>
    );
};

// Toast Container Context
const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// ============================================
// ALERT COMPONENT
// ============================================
export const Alert = ({ type = 'info', title, message, onClose, actions }) => {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    };

    return (
        <div className={`alert alert-${type}`}>
            <div className="alert-icon">{icons[type]}</div>
            <div className="alert-content">
                {title && <h4 className="alert-title">{title}</h4>}
                {message && <p className="alert-message">{message}</p>}
                {actions && <div className="alert-actions">{actions}</div>}
            </div>
            {onClose && (
                <button className="alert-close" onClick={onClose}>
                    ✕
                </button>
            )}
        </div>
    );
};

// ============================================
// CONFIRM DIALOG
// ============================================
export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmVariant = 'danger',
    loading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onClose}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                    <h3>{title}</h3>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-${confirmVariant}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;