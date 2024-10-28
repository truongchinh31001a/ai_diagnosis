'use client';

import { Avatar, Dropdown, Menu } from 'antd';
import { HomeOutlined, BarChartOutlined, InfoCircleOutlined, FileSearchOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signOut } from '@/firebase.config';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // Thêm trạng thái kiểm tra vai trò admin
    const route = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Nếu người dùng đã đăng nhập, lấy thông tin từ MongoDB bằng cách gọi API với fetch
                try {
                    const response = await fetch('/api/getUserDetails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ uid: currentUser.uid }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data);

                        // Kiểm tra thuộc tính isAdmin của người dùng
                        if (data.isAdmin) {
                            setIsAdmin(true); // Nếu là admin, đặt trạng thái isAdmin thành true
                        } else {
                            setIsAdmin(false);
                        }
                    } else {
                        console.error('Failed to fetch user data:', response.status);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                // Nếu người dùng không đăng nhập, đặt user và isAdmin thành null
                setUser(null);
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        signOut(auth).then(() => {
            setUser(null);
            setIsAdmin(false); // Đặt lại trạng thái isAdmin
            route.push('/');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    };

    const menu = (
        <Menu>
            <Menu.Item key="profile">
                <Link href="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="history">
                <Link href="/history">History</Link>
            </Menu.Item>
            {/* Chỉ hiển thị mục Manage nếu người dùng là admin */}
            {isAdmin && (
                <Menu.Item key="manage">
                    <Link href="/manage">Manage</Link>
                </Menu.Item>
            )}
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    const items = [
        { key: 'home', icon: <HomeOutlined /> },
        { key: 'diagnosis', icon: <FileSearchOutlined /> },
        { key: 'metrics', icon: <BarChartOutlined /> },
        { key: 'about', icon: <InfoCircleOutlined /> },
    ];

    return (
        <header className="p-4 flex justify-between items-center bg-white border-b border-gray-300 fixed top-0 left-0 w-full z-50">
            <div className="flex items-center">
                <Link href="/">
                    <img src="/LOGO.png" alt="Logo" className="h-20" />
                </Link>
            </div>

            <nav className="flex-grow flex justify-start space-x-6 ml-6">
                {items.map(item => (
                    <Link
                        href={item.key === 'home' ? '/' : `/${item.key}`}
                        key={item.key}
                        className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center space-x-4">
                {user ? (
                    <Dropdown overlay={menu} trigger={['click']}>
                        <div className="flex items-center cursor-pointer">
                            <Avatar
                                icon={<UserOutlined />}
                                src={user?.image || '/default-avatar.png'}
                            />
                            <span className="ml-2 text-gray-700">{`${user.firstName} ${user.lastName}`}</span>
                        </div>
                    </Dropdown>
                ) : (
                    <Link href="/auth">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
}
