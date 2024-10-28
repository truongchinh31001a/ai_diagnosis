'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [currentForm, setCurrentForm] = useState('login'); // Biến trạng thái để theo dõi form hiện tại.
  const [formClass, setFormClass] = useState('fade-in'); // Hiệu ứng chuyển đổi form.
  const router = useRouter(); // Sử dụng useRouter để điều hướng.

  // Hàm chuyển đổi form với hiệu ứng fade
  const handleToggleForm = (form) => {
    setFormClass('fade-out');
    setTimeout(() => {
      setCurrentForm(form); // Cập nhật form hiện tại
      setFormClass('fade-in');
    }, 500);
  };

  return (
    <div className="flex h-screen justify-center items-center p-5 relative">
      {/* Nút quay lại */}
      <div className="absolute top-4 left-4 z-50">
        <Button type="link" onClick={() => router.back()} icon={<ArrowLeftOutlined />} disabled={loading}>
          Back
        </Button>
      </div>

      {/* Ảnh nền bên trái */}
      <div className="fixed left-0 top-0 w-1/2 h-full bg-gray-100">
        <img src="/v870-mynt-06.jpg" alt="Auth" className="w-full h-full object-cover" />
      </div>

      {/* Form hiển thị */}
      <div
        className={`w-1/2 p-12 bg-white flex flex-col justify-center items-center rounded-lg ml-auto z-10 max-h-screen overflow-y-auto transition-transform duration-500 ${
          formClass === 'fade-in' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1/2'
        }`}
      >
        {currentForm === 'login' && (
          <>
            <LoginForm setLoading={setLoading} />
            <div className="text-center mt-5">
              <span>Don't have an account? </span>
              <Button type="link" onClick={() => handleToggleForm('register')} disabled={loading}>
                Sign Up
              </Button>
              <br />
              <Button type="link" onClick={() => handleToggleForm('reset')} disabled={loading}>
                Forgot Password?
              </Button>
            </div>
          </>
        )}
        {currentForm === 'register' && (
          <>
            <RegisterForm setLoading={setLoading} setActiveTab={() => handleToggleForm('login')} />
            <div className="text-center mt-5">
              <span>Already have an account? </span>
              <Button type="link" onClick={() => handleToggleForm('login')} disabled={loading}>
                Login
              </Button>
            </div>
          </>
        )}
        {currentForm === 'reset' && (
          <>
            {/* Truyền setCurrentForm vào ResetPasswordForm */}
            <ResetPasswordForm setLoading={setLoading} setCurrentForm={setCurrentForm} />
            <div className="text-center mt-5">
              <span>Remember your password? </span>
              <Button type="link" onClick={() => handleToggleForm('login')} disabled={loading}>
                Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
