/**
 * ============================================================
 * PAYROLL APPROVAL MODAL - HRM Frontend
 * ============================================================
 * Modal xác nhận duyệt bảng lương
 * - Yêu cầu nhập "xác nhận" hoặc "confirm" để tiếp tục
 * - Hiển thị tổng số tiền lương cần duyệt
 * ============================================================
 */

import { useState, useMemo, useCallback } from 'react';
import Modal, { ModalFooter, ModalButton } from './Modal';
import './PayrollApprovalModal.css';

const CONFIRMATION_KEYWORDS = ['xác nhận', 'confirm'];

/**
 * Props:
 * - isOpen: boolean - Trạng thái hiển thị modal
 * - onClose: () => void - Callback khi đóng modal
 * - onConfirm: (comment) => void - Callback khi xác nhận duyệt
 * - month: number - Tháng cần duyệt
 * - year: number - Năm cần duyệt
 * - totalAmount: number - Tổng số tiền lương
 * - isLoading: boolean - Trạng thái đang gọi API
 * - currency?: string - Đơn vị tiền tệ (mặc định: 'VND')
 */
const PayrollApprovalModal = ({
    isOpen,
    onClose,
    onConfirm,
    month,
    year,
    totalAmount,
    isLoading = false,
    currency = 'VND'
}) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [comment, setComment] = useState('');
    const [touched, setTouched] = useState(false);

    // Kiểm tra text xác nhận có hợp lệ không (không phân biệt hoa thường)
    const isConfirmationValid = useMemo(() => {
        const normalizedInput = confirmationText.trim().toLowerCase();
        return CONFIRMATION_KEYWORDS.includes(normalizedInput);
    }, [confirmationText]);

    // Format số tiền
    const formattedAmount = useMemo(() => {
        return new Intl.NumberFormat('vi-VN').format(totalAmount);
    }, [totalAmount]);

    // Xử lý thay đổi input xác nhận
    const handleConfirmationChange = useCallback((e) => {
        setConfirmationText(e.target.value);
        if (!touched) setTouched(true);
    }, [touched]);

    // Xử lý thay đổi comment
    const handleCommentChange = useCallback((e) => {
        setComment(e.target.value);
    }, []);

    // Xử lý xác nhận duyệt
    const handleConfirm = useCallback(() => {
        if (!isConfirmationValid || isLoading) return;
        onConfirm(comment.trim());
    }, [isConfirmationValid, isLoading, comment, onConfirm]);

    // Reset state khi đóng modal
    const handleClose = useCallback(() => {
        setConfirmationText('');
        setComment('');
        setTouched(false);
        onClose();
    }, [onClose]);

    // Xử lý submit form
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        handleConfirm();
    }, [handleConfirm]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Xác nhận duyệt bảng lương"
            size="medium"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
            footer={
                <ModalFooter>
                    <ModalButton
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </ModalButton>
                    <ModalButton
                        variant="success"
                        onClick={handleConfirm}
                        disabled={!isConfirmationValid || isLoading}
                        loading={isLoading}
                    >
                        Xác nhận duyệt
                    </ModalButton>
                </ModalFooter>
            }
        >
            <form onSubmit={handleSubmit} className="payroll-approval-form">
                {/* Thông tin kỳ lương */}
                <div className="approval-info-section">
                    <div className="approval-info-item">
                        <span className="approval-label">Kỳ lương:</span>
                        <span className="approval-value">Tháng {month}/{year}</span>
                    </div>
                    <div className="approval-info-item total-amount">
                        <span className="approval-label">Tổng tiền lương:</span>
                        <span className="approval-amount">
                            {formattedAmount} {currency}
                        </span>
                    </div>
                </div>

                {/* Cảnh báo */}
                <div className="approval-warning">
                    <span className="warning-icon">⚠️</span>
                    <p>
                        <strong>Lưu ý:</strong> Sau khi duyệt, bảng lương sẽ được chuyển sang trạng thái
                        <strong> "Đã duyệt"</strong> và không thể chỉnh sửa.
                    </p>
                </div>

                {/* Input xác nhận */}
                <div className="form-group">
                    <label htmlFor="confirmation-text" className="form-label required">
                        Nhập "<strong>xác nhận</strong>" hoặc "<strong>confirm</strong>" để tiếp tục:
                    </label>
                    <input
                        id="confirmation-text"
                        type="text"
                        className={`form-input ${touched && !isConfirmationValid && confirmationText ? 'input-error' : ''}`}
                        value={confirmationText}
                        onChange={handleConfirmationChange}
                        placeholder="Nhập tại đây..."
                        disabled={isLoading}
                        autoFocus
                    />
                    {touched && !isConfirmationValid && confirmationText && (
                        <span className="error-message">
                            Bạn phải nhập "xác nhận" hoặc "confirm" để tiếp tục
                        </span>
                    )}
                </div>

                {/* Comment */}
                <div className="form-group">
                    <label htmlFor="approval-comment" className="form-label">
                        Ghi chú (tùy chọn):
                    </label>
                    <textarea
                        id="approval-comment"
                        className="form-textarea"
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Nhập ghi chú khi duyệt..."
                        rows={3}
                        disabled={isLoading}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default PayrollApprovalModal;
