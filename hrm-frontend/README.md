# HRM Frontend System

Hệ thống quản lý nhân sự (Human Resource Management) - Frontend được xây dựng bằng React + Vite.

## 🚀 Công nghệ sử dụng

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **Context API** - State management (Authentication)
- **CSS3** - Styling với CSS Variables

## 📁 Cấu trúc thư mục

```
src/
├── api/
│   └── axios.js              # Axios instance với interceptor
├── auth/
│   ├── AuthContext.jsx       # Authentication context
│   └── PrivateRoute.jsx      # Route protection
├── components/
│   ├── DataTable.jsx         # Bảng dữ liệu có phân trang
│   ├── Modal.jsx             # Modal component
│   ├── LoadingSpinner.jsx    # Loading indicators
│   └── Notification.jsx      # Toast notifications
├── layouts/
│   ├── MainLayout.jsx        # Main layout (Sidebar + Header)
│   └── MainLayout.css
├── pages/
│   ├── Login.jsx             # Trang đăng nhập
│   ├── Dashboard.jsx         # Trang tổng quan
│   ├── Employees.jsx         # Quản lý nhân viên
│   ├── Contracts.jsx         # Quản lý hợp đồng
│   ├── Departments.jsx       # Quản lý phòng ban
│   ├── Positions.jsx         # Quản lý chức vụ
│   ├── Attendance.jsx        # Chấm công
│   ├── Payroll.jsx           # Tính lương
│   ├── Users.jsx             # Quản lý users
│   └── Leave.jsx             # Quản lý nghỉ phép
├── styles/
│   └── common.css            # Shared styles
├── App.jsx                   # Main app component
└── main.jsx                  # Entry point
```

## ⚙️ Cài đặt

### 1. Cài đặt dependencies

```bash
cd hrm-frontend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
VITE_API_URL=http://localhost:8080
```

### 3. Chạy development server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5173`

### 4. Build production

```bash
npm run build
```

## 🔐 Authentication Flow

1. User đăng nhập với username/password
2. Server trả về `accessToken` và thông tin user
3. `accessToken` được lưu trong `localStorage`
4. Axios tự động thêm `Authorization: Bearer <token>` vào header
5. Khi token hết hạn (401), Axios tự động gọi `/api/v1/auth/refresh`
6. Nếu refresh fail → tự động logout

## 👥 Phân quyền (Roles)

| Role | Quyền truy cập |
|------|----------------|
| ROLE_ADMIN | Toàn quyền |
| ROLE_HR_MANAGER | Quản lý nhân sự, duyệt lương/hợp đồng |
| ROLE_HR_STAFF | Thêm/sửa nhân viên, hợp đồng |
| ROLE_MANAGER | Xem nhân viên, duyệt nghỉ phép |
| ROLE_USER | Xem thông tin cá nhân, gửi đơn nghỉ |

## 📡 API Endpoints

### Auth
- `POST /api/v1/auth/login` - Đăng nhập
- `DELETE /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/refresh` - Refresh token

### Employees
- `GET /api/v1/employees` - Danh sách nhân viên
- `POST /api/v1/employees` - Thêm nhân viên
- `PUT /api/v1/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/v1/employees/{id}` - Xóa nhân viên
- `POST /api/v1/employees/import` - Import Excel
- `GET /api/v1/employees/export` - Export Excel

### Contracts
- `GET /api/v1/contract` - Danh sách hợp đồng
- `POST /api/v1/contract` - Tạo hợp đồng
- `PUT /api/v1/contract/{id}` - Cập nhật hợp đồng
- `POST /api/v1/contract/{id}/approve` - Duyệt hợp đồng
- `GET /api/v1/contract/export` - Export Excel

### Departments
- `GET /api/v1/departments` - Danh sách phòng ban
- `POST /api/v1/departments` - Thêm phòng ban
- `PUT /api/v1/departments/{id}` - Cập nhật
- `DELETE /api/v1/departments/{id}` - Xóa
- `GET /api/v1/departments/export` - Export Excel

### Positions
- `GET /api/v1/positions` - Danh sách chức vụ
- `POST /api/v1/positions` - Thêm chức vụ
- `PUT /api/v1/positions/{id}` - Cập nhật
- `DELETE /api/v1/positions/{id}` - Xóa
- `GET /api/v1/positions/export` - Export Excel

### Attendance
- `GET /api/v1/attendance` - Danh sách chấm công
- `POST /api/v1/attendance/scan` - Quét chấm công

### Payroll
- `GET /api/v1/payroll` - Danh sách bảng lương
- `POST /api/v1/payroll` - Tính lương tất cả
- `POST /api/v1/payroll/approval` - Duyệt lương

### Leave
- `GET /api/v1/leave-requests` - Danh sách đơn nghỉ
- `POST /api/v1/leave-requests` - Tạo đơn nghỉ
- `POST /api/v1/leave-requests/{id}/approve` - Duyệt nghỉ
- `POST /api/v1/leave-requests/import` - Import Excel

### Users
- `GET /api/v1/user-accounts` - Danh sách users
- `POST /api/v1/user-accounts` - Tạo user
- `PUT /api/v1/user-accounts/{id}` - Cập nhật user
- `GET /api/v1/roles` - Danh sách roles

## 🎨 UI Components

### DataTable
```jsx
<DataTable
  columns={columns}
  data={data}
  loading={loading}
  totalItems={total}
  pageSize={10}
  currentPage={page}
  onPageChange={handlePageChange}
  onSearch={handleSearch}
/>
```

### Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="medium"
  footer={<ModalFooter>...</ModalFooter>}
>
  Content
</Modal>
```

### Toast Notification
```jsx
const { success, error, info, warning } = useToast();

success('Thao tác thành công!');
error('Có lỗi xảy ra!');
```

## 📱 Responsive

- Desktop: Sidebar mở rộng (260px)
- Tablet: Sidebar thu gọn (70px)
- Mobile: Sidebar ẩn, có thể toggle

## 🔧 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📝 License

MIT
