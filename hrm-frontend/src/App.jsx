/**
 * ============================================================
 * APP.JSX - HRM Frontend
 * ============================================================
 * Main App component with React Router configuration
 * ============================================================
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './components/Notification';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import ActiveAccount from './pages/ActiveAccount';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Contracts from './pages/Contracts';
import Departments from './pages/Departments';
import SubDepartments from './pages/SubDepartments';
import Positions from './pages/Positions';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Users from './pages/Users';
import Leave from './pages/Leave';
import EmployeeDashboard from './pages/EmployeeDashboard';

// CSS
import './App.css';
import './styles/common.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/active-account" element={<ActiveAccount />} />

            {/* Employee Dashboard - standalone route for ROLE_EMPLOYEE only */}
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute requiredRoles={['ROLE_EMPLOYEE']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />

              {/* Employees - accessible by MANAGER, HR_STAFF, HR_MANAGER, ADMIN */}
              <Route
                path="employees"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER']}>
                    <Employees />
                  </PrivateRoute>
                }
              />

              {/* Contracts - accessible by HR_STAFF, HR_MANAGER, ADMIN */}
              <Route
                path="contracts"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']}>
                    <Contracts />
                  </PrivateRoute>
                }
              />

              {/* Departments - all authenticated users */}
              <Route path="departments" element={<Departments />} />

              {/* SubDepartments - accessible by HR_STAFF, HR_MANAGER, ADMIN */}
              <Route
                path="sub-departments"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']}>
                    <SubDepartments />
                  </PrivateRoute>
                }
              />

              {/* Positions - accessible by HR_STAFF, HR_MANAGER, ADMIN */}
              <Route
                path="positions"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']}>
                    <Positions />
                  </PrivateRoute>
                }
              />

              {/* Attendance - accessible by MANAGER, HR_STAFF, HR_MANAGER, ADMIN */}
              <Route
                path="attendance"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER']}>
                    <Attendance />
                  </PrivateRoute>
                }
              />

              {/* Payroll - accessible by HR_STAFF, HR_MANAGER, ADMIN */}
              <Route
                path="payroll"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF']}>
                    <Payroll />
                  </PrivateRoute>
                }
              />

              {/* Users - accessible by HR_MANAGER, ADMIN */}
              <Route
                path="users"
                element={
                  <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER']}>
                    <Users />
                  </PrivateRoute>
                }
              />

              {/* Leave - all authenticated users */}
              <Route path="leave" element={<Leave />} />

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <div className="not-found">
                    <h1>404</h1>
                    <p>Trang không tồn tại</p>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
