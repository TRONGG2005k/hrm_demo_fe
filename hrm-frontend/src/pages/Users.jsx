/**
 * ============================================================
 * USERS PAGE - HRM Frontend
 * ============================================================
 * Quản lý User và phân quyền
 * API: /api/v1/user-accounts, /api/v1/roles
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import DataTable from '../components/DataTable';
import Modal, { ModalFooter, ModalButton } from '../components/Modal';
import { useToast } from '../components/Notification';
import './Users.css';

const Users = () => {
    const { success, error } = useToast();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', roleIds: [], employeeId: '' });

    // Role change state
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [isChangingRole, setIsChangingRole] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                apiClient.get('/api/v1/user-accounts'),
                apiClient.get('/api/v1/roles'),
            ]);
            setUsers(usersRes.data.content || usersRes.data);
            setRoles(rolesRes.data.content || rolesRes.data);
        } catch (err) {
            error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [error]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/api/v1/user-accounts/${selectedUser.id}`, formData);
                success('Cập nhật user thành công');
            } else {
                await apiClient.post('/api/v1/user-accounts', formData);
                success('Tạo user thành công');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            error(err.response?.data?.details || err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Open role change modal
    const openRoleModal = () => {
        if (selectedUserIds.length !== 1) {
            error('Vui lòng chọn đúng 1 user để đổi quyền');
            return;
        }
        const user = users.find(u => u.id === selectedUserIds[0]);
        if (user && user.roles) {
            // Initialize selected roles from user's current roles
            const initialRoles = {};
            user.roles.forEach(role => {
                initialRoles[role.id] = true;
            });
            setSelectedRoles(initialRoles);
        } else {
            setSelectedRoles({});
        }
        setIsRoleModalOpen(true);
    };

    // Handle role checkbox change
    const handleRoleChange = (roleId, checked) => {
        setSelectedRoles(prev => ({
            ...prev,
            [roleId]: checked
        }));
    };

    // Submit role change
    const handleChangeRole = async () => {
        if (selectedUserIds.length !== 1) {
            error('Không tìm thấy user được chọn');
            return;
        }

        setIsChangingRole(true);
        try {
            const userId = selectedUserIds[0];
            const payload = { changeRole: selectedRoles };
            await apiClient.put(`/api/v1/user-accounts/${userId}/change-role`, payload);
            success('Thay đổi quyền thành công');
            setIsRoleModalOpen(false);
            setSelectedUserIds([]);
            fetchUsers();
        } catch (err) {
            error(err.response?.data?.details || err.response?.data?.message || 'Thay đổi quyền thất bại');
        } finally {
            setIsChangingRole(false);
        }
    };

    const columns = [
        { key: 'username', title: 'Username' },
        { key: 'employeeCode', title: 'Nhân viên' },
        { key: 'roles', title: 'Vai trò', render: (v) => v?.map(r => r.name.replace('ROLE_', '')).join(', ') || '-' },
        { key: 'status', title: 'Trạng thái', render: (v) => v ? <span className="status-badge status-active">Hoạt động</span> : <span className="status-badge status-inactive">Khóa</span> },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="btn-icon btn-edit" onClick={() => { setIsEditing(true); setSelectedUser(row); setFormData({ ...row, roleIds: row.roles?.map(r => r.id) || [] }); setIsModalOpen(true); }}>✏️</button>
                </div>
            ),
        },
    ];

    return (
        <div className="users-page">
            <div className="page-header">
                <h2>Quản lý Users</h2>
                <div className="header-actions">
                    {selectedUserIds.length === 1 && (
                        <button
                            className="btn btn-warning"
                            onClick={openRoleModal}
                            title="Đổi quyền cho user được chọn"
                        >
                            🔑 Đổi quyền
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={() => { setIsEditing(false); setFormData({ username: '', email: '', password: '', roleIds: [], employeeId: '' }); setIsModalOpen(true); }}>➕ Thêm User</button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                emptyMessage="Không có user nào"
                selectable={true}
                selectedIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
                rowKey="id"
            />

            {/* Create/Edit User Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Cập nhật User' : 'Thêm User'} footer={
                <ModalFooter>
                    <ModalButton variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</ModalButton>
                </ModalFooter>
            }>
                <form className="user-form">
                    <div className="form-group"><label>Username *</label><input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></div>
                    <div className="form-group"><label>Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                    {!isEditing && <div className="form-group"><label>Password *</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!isEditing} /></div>}
                    <div className="form-group"><label>Vai trò</label><select multiple value={formData.roleIds} onChange={(e) => setFormData({ ...formData, roleIds: Array.from(e.target.selectedOptions, o => o.value) })}>{roles.map(r => <option key={r.id} value={r.id}>{r.name.replace('ROLE_', '')}</option>)}</select></div>
                </form>
            </Modal>

            {/* Change Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title="Đổi quyền User"
                size="medium"
                footer={
                    <ModalFooter>
                        <ModalButton variant="secondary" onClick={() => setIsRoleModalOpen(false)}>
                            Hủy
                        </ModalButton>
                        <ModalButton
                            variant="primary"
                            onClick={handleChangeRole}
                            disabled={isChangingRole}
                        >
                            {isChangingRole ? '⏳ Đang xử lý...' : '✓ Xác nhận'}
                        </ModalButton>
                    </ModalFooter>
                }
            >
                <div className="role-change-form">
                    <p className="role-change-info">
                        Chọn các quyền cho user: <strong>{users.find(u => u.id === selectedUserIds[0])?.username}</strong>
                    </p>
                    <div className="role-list">
                        {roles.map(role => (
                            <label key={role.id} className="role-checkbox">
                                <input
                                    type="checkbox"
                                    checked={!!selectedRoles[role.id]}
                                    onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                />
                                <span className="role-name">{role.name.replace('ROLE_', '')}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
