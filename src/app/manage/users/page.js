'use client';

import { useState, useEffect } from 'react';
import { message, Table, Spin, Modal, Button, Avatar } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { auth } from '@/firebase.config'; // Import Firebase auth

export default function ManageUsers() {
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [currentUserUID, setCurrentUserUID] = useState(null); // Để lưu UID của người dùng hiện tại
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Lấy UID của người dùng hiện tại
  const getCurrentUserUID = async () => {
    const user = auth.currentUser; // Lấy người dùng hiện tại từ Firebase
    if (user) {
      setCurrentUserUID(user.uid);
    }
  };

  // Hàm gọi API để lấy danh sách người dùng
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/manage/users');
      const data = await response.json();

      if (response.ok) {
        const filteredUsers = data.users.filter(user => user.uid !== currentUserUID); // Lọc ra người dùng hiện tại
        setUsers(filteredUsers); // Lưu danh sách người dùng sau khi đã loại bỏ người dùng hiện tại
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt("Enter new password for the user:");

    if (newPassword) {
      try {
        const response = await fetch('/api/manage/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, newPassword }),
        });

        const data = await response.json();

        // Kiểm tra phản hồi của API
        if (response.ok) {
          // Nếu thành công, hiển thị thông báo thành công
          message.success('Password updated successfully');
        } else {
          // Nếu API trả về lỗi, hiển thị thông báo lỗi
          message.error(`Error: ${data.message}`);
        }
      } catch (error) {
        // Xử lý khi có lỗi trong quá trình gọi API
        console.error('Error updating password:', error);
        message.error('Failed to update password');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch('/api/manage/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),  // Gửi `userId` để xóa
      });

      const data = await response.json();

      if (response.ok) {
        message.success('User deleted successfully');
        fetchUsers();  // Refresh lại danh sách người dùng sau khi xóa
      } else {
        message.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  useEffect(() => {
    getCurrentUserUID();  // Lấy UID của người dùng hiện tại
  }, []);

  useEffect(() => {
    if (currentUserUID) {
      fetchUsers();  // Gọi API khi UID của người dùng hiện tại đã có
    }
  }, [currentUserUID]);

  // Hàm mở modal và hiển thị thông tin chi tiết của người dùng
  const showUserDetails = (user) => {
    setSelectedUser(user);  // Lưu người dùng đã chọn
    setIsModalVisible(true);  // Hiển thị modal
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  // Cấu hình bảng người dùng
  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,  // Hiển thị tên đầy đủ
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => showUserDetails(record)} icon={<IdcardOutlined />} />
      ),
    },
  ];

  return (
    <div className="mt-10 mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Manage Users</h2>
      {loadingUsers ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={users}
          columns={userColumns}
          rowKey="_id"
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          className="rounded-lg w-full"
          style={{ fontSize: '16px' }}
        />
      )}

      {/* Modal hiển thị thông tin người dùng */}
      <Modal
        title={<h2 className="text-lg font-bold">User Details</h2>}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        {selectedUser && (
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              size={100}
              src={selectedUser.image || '/default-avatar.png'}
              className="mb-4"
            />
            <div className="text-left w-full space-y-2">
              <p><strong>First Name:</strong> {selectedUser.firstName}</p>
              <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Google Login:</strong> {selectedUser.isGoogleLogin ? 'Yes' : 'No'}</p>
              <p><strong>Admin:</strong> {selectedUser.isAdmin ? 'Yes' : 'No'}</p>
            </div>

            {/* Nút hành động */}
            <div className="flex space-x-4 justify-center mt-6">
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 rounded px-4 py-2"
                onClick={() => handleResetPassword(selectedUser._id)}
              >
                Reset Password
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 rounded px-4 py-2"
                onClick={() => handleDeleteUser(selectedUser._id)}
              >
                Delete
              </Button>
            </div>

            {/* Nút đóng modal */}
            <div className="w-full flex justify-end mt-4">
              <Button
                key="close"
                onClick={handleCloseModal}
                className="bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 rounded px-4 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
