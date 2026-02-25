/**
 * ============================================================
 * MODAL COMPONENT - HRM Frontend
 * ============================================================
 * Component modal đa năng cho form thêm/sửa/xóa
 * ============================================================
 */

import { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium', // small, medium, large, full
    footer = null,
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
}) => {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Xử lý ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        };

        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            // Focus vào modal
            setTimeout(() => {
                modalRef.current?.focus();
            }, 0);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
            previousActiveElement.current?.focus();
        };
    }, [isOpen, closeOnEscape, onClose]);

    // Xử lý click overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'modal-small',
        medium: 'modal-medium',
        large: 'modal-large',
        full: 'modal-full',
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={`modal-container ${sizeClasses[size]}`}
                tabIndex="-1"
            >
                {/* Header */}
                <div className="modal-header">
                    <h3 id="modal-title" className="modal-title">{title}</h3>
                    {showCloseButton && (
                        <button
                            className="modal-close-btn"
                            onClick={onClose}
                            aria-label="Đóng"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="modal-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// Modal Footer Button Helpers
export const ModalFooter = ({ children }) => (
    <div className="modal-footer-buttons">
        {children}
    </div>
);

export const ModalButton = ({
    children,
    onClick,
    variant = 'primary', // primary, secondary, danger, success
    type = 'button',
    disabled = false,
    loading = false,
}) => {
    return (
        <button
            type={type}
            className={`modal-btn modal-btn-${variant}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && <span className="btn-spinner"></span>}
            {children}
        </button>
    );
};

export default Modal;