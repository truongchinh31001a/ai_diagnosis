import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/firebase.config';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Kiểm tra xem tài khoản đã được đăng ký bằng Google OAuth chưa
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.includes('google.com')) {
      // Nếu tài khoản được đăng ký qua Google, yêu cầu thiết lập mật khẩu mới
      return NextResponse.json({ message: "User registered via Google, please set up a password." }, { status: 400 });
    }

    // Nếu tài khoản không phải từ Google, gửi email đặt lại mật khẩu
    await sendPasswordResetEmail(auth, email);

    return NextResponse.json({ message: "Password reset email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return NextResponse.json({ message: error.message || "Failed to send password reset email" }, { status: 500 });
  }
}
