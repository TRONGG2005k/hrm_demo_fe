/**
 * ============================================================
 * PRIVATE ROUTE - HRM Frontend
 * ============================================================
 * Bảo vệ routes yêu cầu authentication
 * Hỗ trợ phân quyền theo role
 * ============================================================
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * PrivateRoute Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần render
 * @param {string|string[]} props.requiredRoles - Các role được phép truy cập
 * @param {string} props.redirectTo - Path redirect khi không có quyền
 */
const PrivateRoute = ({
    children,
    requiredRoles = null,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, isLoading, user, hasRole } = useAuth();
    const location = useLocation();

    // Đang loading → hiển thị spinner
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    // Chưa đăng nhập → redirect về login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Kiểm tra nếu user chỉ có ROLE_EMPLOYEE (không có role admin/manager nào khác)
    const userRoles = user?.roles || [];
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
    const isOnlyEmployee = userRolesArray.includes('ROLE_EMPLOYEE') &&
        !userRolesArray.some(role => ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER'].includes(role));

    // Nếu đang ở employee-dashboard route nhưng không phải employee-only → cho phép (admin cũng có thể xem)
    // Nếu đang ở các route khác và chỉ là employee → redirect về employee-dashboard
    if (isOnlyEmployee && location.pathname !== '/employee-dashboard') {
        return <Navigate to="/employee-dashboard" replace />;
    }

    // Kiểm tra role nếu có yêu cầu
    if (requiredRoles && !hasRole(requiredRoles)) {
        // Không có quyền → redirect về dashboard hoặc trang unauthorized
        return <Navigate to="/unauthorized" replace />;
    }

    // Có quyền → render children
    return children;
};

export default PrivateRoute;
