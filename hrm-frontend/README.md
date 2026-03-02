# HRM Attendance Web Admin

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Axios-1.13.5-5A29E4?logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/React_Router-7.13.0-CA4245?logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <b>Enterprise-grade Human Resource Management Frontend</b><br/>
  A production-ready React application for distributed HRM Attendance Management Systems
</p>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Application Architecture](#-application-architecture)
- [Technology Stack](#-technology-stack)
- [Project Folder Structure](#-project-folder-structure)
- [Authentication Flow](#-authentication-flow)
- [Token Refresh Strategy](#-token-refresh-strategy)
- [API Communication Strategy](#-api-communication-strategy)
- [Protected Route Mechanism](#-protected-route-mechanism)
- [Environment Configuration](#-environment-configuration)
- [Running Locally](#-running-locally)
- [Docker Deployment](#-docker-deployment)
- [Integration with Backend API](#-integration-with-backend-api)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🎯 Project Overview

**HRM Attendance Web Admin** is the frontend component of a distributed Human Resource Management Attendance System. Built with enterprise-grade practices, it provides a comprehensive administrative interface for managing employees, tracking attendance, processing payroll, and handling organizational hierarchies.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based auth with automatic token refresh |
| 👥 **Employee Management** | CRUD operations with role-based access control |
| ⏰ **Attendance Monitoring** | Real-time attendance tracking and reporting |
| 💰 **Payroll Processing** | Automated payroll calculation and approval workflows |
| 🏢 **Organization Structure** | Department and sub-department management |
| 📊 **Dashboard Analytics** | Visual insights into HR metrics |
| 🌴 **Leave Management** | Leave request submission and approval system |

---

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                           │
│              (Static Assets + API Proxy)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌───────────────────────┐           ┌───────────────────────┐
│   React SPA (Docker)  │           │   Spring Boot API     │
│   - Vite Build        │◄─────────►│   - REST Endpoints    │
│   - Auth Context      │   HTTPS   │   - JWT Security      │
│   - Axios Client      │           │   - MySQL Database    │
└───────────────────────┘           └───────────────────────┘
```

### Architectural Principles

- **Separation of Concerns**: UI components decoupled from API services
- **State Management**: Centralized auth state via React Context API
- **Security-First**: Memory-based access tokens, HTTP-only refresh cookies
- **Scalable Design**: Modular component architecture supporting future enhancements

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React 19.2.0 | UI Library with Concurrent Features |
| **Build Tool** | Vite 7.3.1 | Fast development and optimized builds |
| **Routing** | React Router DOM 7.13.0 | Declarative routing with protected routes |
| **HTTP Client** | Axios 1.13.5 | API communication with interceptors |
| **State Management** | React Context API | Global authentication state |
| **Styling** | CSS3 with Variables | Component-scoped styles |
| **Deployment** | Docker + Nginx | Containerized deployment |

---

## 📁 Project Folder Structure

```
hrm-frontend/
├── 📂 public/                     # Static assets
│   └── vite.svg
│
├── 📂 src/
│   ├── 📂 api/                    # API configuration
│   │   └── axios.js               # Axios instance with interceptors
│   │
│   ├── 📂 auth/                   # Authentication layer
│   │   ├── AuthContext.jsx        # Global auth state management
│   │   └── PrivateRoute.jsx       # Route protection component
│   │
│   ├── 📂 components/             # Reusable UI components
│   │   ├── DataTable.jsx          # Paginated data table
│   │   ├── DataTable.css
│   │   ├── Modal.jsx              # Modal dialog component
│   │   ├── Modal.css
│   │   ├── LoadingSpinner.jsx     # Loading indicators
│   │   ├── LoadingSpinner.css
│   │   ├── Notification.jsx       # Toast notification system
│   │   ├── Notification.css
│   │   ├── PayrollApprovalModal.jsx
│   │   └── PayrollApprovalModal.css
│   │
│   ├── 📂 hooks/                  # Custom React hooks
│   │
│   ├── 📂 layouts/                # Page layouts
│   │   ├── MainLayout.jsx         # Sidebar + Header layout
│   │   └── MainLayout.css
│   │
│   ├── 📂 pages/                  # Route pages
│   │   ├── Login.jsx              # Authentication page
│   │   ├── Login.css
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Dashboard.css
│   │   ├── Employees.jsx          # Employee management
│   │   ├── Employees.css
│   │   ├── EmployeeDashboard.jsx  # Employee self-service portal
│   │   ├── EmployeeDashboard.css
│   │   ├── Contracts.jsx          # Contract management
│   │   ├── Contracts.css
│   │   ├── Departments.jsx        # Department management
│   │   ├── Departments.css
│   │   ├── SubDepartments.jsx     # Sub-department management
│   │   ├── SubDepartments.css
│   │   ├── Positions.jsx          # Position/Role management
│   │   ├── Positions.css
│   │   ├── Attendance.jsx         # Attendance tracking
│   │   ├── Attendance.css
│   │   ├── Payroll.jsx            # Payroll processing
│   │   ├── Payroll.css
│   │   ├── Leave.jsx              # Leave management
│   │   ├── Leave.css
│   │   ├── Users.jsx              # User account management
│   │   ├── Users.css
│   │   ├── ActiveAccount.jsx      # Account activation
│   │   └── ActiveAccount.css
│   │
│   ├── 📂 styles/                 # Global styles
│   │   └── common.css             # Shared CSS variables & utilities
│   │
│   ├── 📂 utils/                  # Utility functions
│   │
│   ├── App.jsx                    # Root component & routing
│   ├── App.css
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Application entry point
│
├── 📄 .env                        # Environment variables
├── 📄 .env.example                # Environment template
├── 📄 .gitignore
├── 📄 docker-compose.yml          # Docker orchestration
├── 📄 Dockerfile                  # Container definition
├── 📄 eslint.config.js            # ESLint configuration
├── 📄 index.html                  # HTML entry point
├── 📄 nginx.conf                  # Nginx configuration
├── 📄 package.json                # Dependencies & scripts
├── 📄 package-lock.json
├── 📄 README.md                   # Project documentation
└── 📄 vite.config.js              # Vite configuration
```

---

## 🔐 Authentication Flow

### JWT Authentication Sequence

```
┌─────────┐                    ┌─────────────┐                    ┌─────────────┐
│  User   │                    │   Frontend  │                    │   Backend   │
└────┬────┘                    └──────┬──────┘                    └──────┬──────┘
     │                                 │                                 │
     │  1. POST /login                 │                                 │
     │     {username, password}        │                                 │
     │────────────────────────────────>│                                 │
     │                                 │                                 │
     │                                 │  2. POST /api/v1/auth/login      │
     │                                 │     {username, password}        │
     │                                 │────────────────────────────────>│
     │                                 │                                 │
     │                                 │  3. Response:                    │
     │                                 │     {accessToken, userData}     │
     │                                 │     Set-Cookie: refreshToken    │
     │                                 │<────────────────────────────────│
     │                                 │                                 │
     │  4. Store accessToken           │                                 │
     │     in localStorage             │                                 │
     │     Store user info             │                                 │
     │<────────────────────────────────│                                 │
     │                                 │                                 │
     │  5. Navigate to Dashboard       │                                 │
     │<────────────────────────────────│                                 │
     │                                 │                                 │
```

### Authentication State Management

The `AuthContext` provides centralized authentication state:

```javascript
// Auth Context Value Structure
{
  user: Object | null,           // Current user info & roles
  isAuthenticated: boolean,      // Auth status
  isLoading: boolean,            // Loading state
  error: string | null,          // Auth errors
  login: Function,               // Login handler
  logout: Function,              // Logout handler
  logoutAll: Function,           // Global logout
  updateUser: Function,          // Update user info
  hasRole: Function,             // Role checker
  isAdmin: Function,             // Admin check
  isHRManager: Function,         // HR Manager check
  isHRStaff: Function,           // HR Staff check
  isManager: Function,           // Manager check
  isEmployee: Function           // Employee check
}
```

### Token Storage Strategy

| Token Type | Storage | Security Level | Purpose |
|------------|---------|----------------|---------|
| **Access Token** | `localStorage` | Medium | Short-lived (15-30 min), sent with API requests |
| **Refresh Token** | HTTP-only Cookie | High | Long-lived, used to obtain new access tokens |

---

## 🔄 Token Refresh Strategy

### Automatic Token Refresh Flow

```
┌─────────────┐                              ┌─────────────┐
│   Frontend  │                              │   Backend   │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. Request with expired accessToken       │
       │     GET /api/v1/employees                  │
       │───────────────────────────────────────────>│
       │                                            │
       │  2. Response: 401 Unauthorized             │
       │<───────────────────────────────────────────│
       │                                            │
       │  3. POST /api/v1/auth/refresh              │
       │     Cookie: refreshToken (HTTP-only)       │
       │───────────────────────────────────────────>│
       │                                            │
       │  4. Response: {newAccessToken}             │
       │<───────────────────────────────────────────│
       │                                            │
       │  5. Retry original request                 │
       │     with new accessToken                   │
       │───────────────────────────────────────────>│
       │                                            │
       │  6. Response: 200 OK with data             │
       │<───────────────────────────────────────────│
       │                                            │
```

### Request Queue Management

To handle concurrent API calls during token refresh, the system implements a request queue:

```javascript
// Axios Interceptor Implementation
let isRefreshing = false;
let refreshSubscribers = [];

// Queue requests while refreshing
if (isRefreshing) {
  return new Promise((resolve) => {
    subscribeTokenRefresh((newToken) => {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      resolve(apiClient(originalRequest));
    });
  });
}
```

### Token Refresh Failure Handling

When refresh token expires or is invalid:
1. Clear stored tokens from `localStorage`
2. Redirect user to `/login`
3. Display session expired notification

---

## 📡 API Communication Strategy

### Axios Instance Configuration

```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,        // Enable cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,               // 30 second timeout
});
```

### Request Interceptor

Automatically attaches `Authorization` header to all outgoing requests:

```javascript
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

Handles token expiration and automatic refresh:

```javascript
apiClient.interceptors.response.use(
  (response) => response,           // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors with automatic retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

### API Endpoint Categories

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `/api/v1/auth/*` | Login, logout, refresh, password reset |
| **Employees** | `/api/v1/employees/*` | CRUD operations, import/export |
| **Contracts** | `/api/v1/contract/*` | Contract management, approval workflow |
| **Departments** | `/api/v1/departments/*` | Department & sub-department CRUD |
| **Positions** | `/api/v1/positions/*` | Position/role management |
| **Attendance** | `/api/v1/attendance/*` | Attendance records, scanning |
| **Payroll** | `/api/v1/payroll/*` | Payroll calculation, approval |
| **Leave** | `/api/v1/leave-requests/*` | Leave requests, approval |
| **Users** | `/api/v1/user-accounts/*` | User management, role assignment |

---

## 🛡️ Protected Route Mechanism

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Route Access Matrix                         │
├─────────────────────┬───────────────────────────────────────────┤
│ Route               │ Allowed Roles                             │
├─────────────────────┼───────────────────────────────────────────┤
│ /login              │ Public                                    │
│ /employee-dashboard │ ROLE_EMPLOYEE                             │
│ /dashboard          │ All authenticated                         │
│ /employees          │ ADMIN, HR_MANAGER, HR_STAFF, MANAGER      │
│ /contracts          │ ADMIN, HR_MANAGER, HR_STAFF               │
│ /departments        │ All authenticated                         │
│ /sub-departments    │ ADMIN, HR_MANAGER, HR_STAFF               │
│ /positions          │ ADMIN, HR_MANAGER, HR_STAFF               │
│ /attendance         │ ADMIN, HR_MANAGER, HR_STAFF, MANAGER      │
│ /payroll            │ ADMIN, HR_MANAGER, HR_STAFF               │
│ /leave              │ All authenticated                         │
│ /users              │ ADMIN, HR_MANAGER                         │
└─────────────────────┴───────────────────────────────────────────┘
```

### PrivateRoute Component Implementation

```jsx
const PrivateRoute = ({ children, requiredRoles, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect employees without admin privileges
  const isOnlyEmployee = checkIfOnlyEmployee(user.roles);
  if (isOnlyEmployee && location.pathname !== '/employee-dashboard') {
    return <Navigate to="/employee-dashboard" replace />;
  }

  // Check role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

### Usage in Routing

```jsx
<Route
  path="/employees"
  element={
    <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_HR_STAFF', 'ROLE_MANAGER']}>
      <Employees />
    </PrivateRoute>
  }
/>
```

---

## ⚙️ Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# ============================================
# HRM Frontend Environment Configuration
# ============================================

# API Base URL - Backend server URL
VITE_API_URL=https://hrm-api.your-domain.com/
# VITE_API_URL=http://localhost:8080

# App Configuration
VITE_APP_NAME=HRM System
VITE_APP_VERSION=1.0.0
```

### Environment Variable Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | `http://localhost:8080` |
| `VITE_APP_NAME` | Application display name | No | `HRM System` |
| `VITE_APP_VERSION` | Application version | No | `1.0.0` |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+ 
- npm 9+ or yarn
- Backend API running (Spring Boot)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/TRONGG2005k/hrm_demo_fe.git
cd hrm-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API URL

# 4. Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |

### Development Server

The application will be available at: `http://localhost:5173`

---

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Or build and run manually
docker build -t hrm-frontend:latest .
docker run -p 80:80 --name hrm-frontend hrm-frontend:latest
```

### Docker Configuration

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  hrm-frontend:
    build:
      context: ./hrm-frontend
      dockerfile: Dockerfile
    container_name: hrm-frontend
    ports:
      - "80:80"
    restart: unless-stopped
    networks:
      - hrm-network

networks:
  hrm-network:
    driver: bridge
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Clone and deploy
git clone https://github.com/TRONGG2005k/hrm_demo_fe
cd hrm-frontend
docker-compose up -d
```

---

## 🔗 Integration with Backend API

### Backend Requirements

- **Framework:** Spring Boot 3.x
- **Security:** Spring Security with JWT
- **Database:** MySQL 8.0+
- **API Documentation:** OpenAPI/Swagger

### CORS Configuration

Ensure backend allows requests from frontend origin:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("https://your-frontend.com"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### API Response Format

```json
// Success Response
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

---

## 📸 Screenshots

> 🚧 Screenshots will be added in future updates

| Page | Preview | Description |
|------|---------|-------------|
| Login | ![Login](docs/screenshots/login.png) | Secure authentication interface |
| Dashboard | ![Dashboard](docs/screenshots/dashboard.png) | Analytics and overview |
| Employees | ![Employees](docs/screenshots/employees.png) | Employee management grid |
| Attendance | ![Attendance](docs/screenshots/attendance.png) | Time tracking interface |
| Payroll | ![Payroll](docs/screenshots/payroll.png) | Salary processing dashboard |

---

## 🔮 Future Improvements

- [ ] **PWA Support** - Service workers for offline capability
- [ ] **Real-time Updates** - WebSocket integration for live notifications
- [ ] **Advanced Analytics** - Chart.js/D3.js data visualization
- [ ] **Multi-language Support** - i18n internationalization (EN/VI/JA)
- [ ] **Dark Mode** - Theme switching capability
- [ ] **Mobile App** - React Native companion app
- [ ] **Audit Logging** - Activity tracking and history
- [ ] **Bulk Operations** - Mass import/export with progress tracking
- [ ] **Advanced Filtering** - Dynamic search with faceted filters
- [ ] **Report Generation** - PDF/Excel export capabilities

---

## 👨‍💻 Author

**HRM Development Team**

- 📧 Email: tn0061350951@gmail.com
- 🔗 GitHub: [TRONGG2005k/hrm_demo_fe](https://github.com/TRONGG2005k/hrm_demo_fe)
- 🌐 Website: [https://hrm-db.duckdns.org](https://hrm-db.duckdns.org)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for efficient HR management
</p>
