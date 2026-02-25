/**
 * ============================================================
 * LOADING SPINNER COMPONENT - HRM Frontend
 * ============================================================
 * Component loading spinner đa dạng kích thước
 * ============================================================
 */

import './LoadingSpinner.css';

const LoadingSpinner = ({
    size = 'medium', // small, medium, large
    fullScreen = false,
    text = 'Đang tải...',
    showText = true,
}) => {
    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large',
    };

    const spinner = (
        <div className={`spinner-container ${sizeClasses[size]}`}>
            <div className="spinner">
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
            </div>
            {showText && <p className="spinner-text">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fullscreen-spinner-overlay">
                {spinner}
            </div>
        );
    }

    return spinner;
};

// Inline spinner cho button
export const ButtonSpinner = ({ size = 'small' }) => (
    <span className={`button-spinner button-spinner-${size}`}></span>
);

// Skeleton loading
export const Skeleton = ({
    width = '100%',
    height = '20px',
    circle = false,
    count = 1,
}) => {
    return (
        <div className="skeleton-wrapper">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`skeleton ${circle ? 'skeleton-circle' : ''}`}
                    style={{
                        width: circle ? height : width,
                        height,
                        borderRadius: circle ? '50%' : '4px',
                    }}
                />
            ))}
        </div>
    );
};

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="table-skeleton">
        <div className="table-skeleton-header">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} width="100%" height="24px" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="table-skeleton-row">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} width="100%" height="20px" />
                ))}
            </div>
        ))}
    </div>
);

// Card skeleton
export const CardSkeleton = ({ count = 1 }) => (
    <div className="card-skeleton-wrapper">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="card-skeleton">
                <Skeleton width="60%" height="24px" />
                <Skeleton width="100%" height="16px" count={3} />
            </div>
        ))}
    </div>
);

export default LoadingSpinner;