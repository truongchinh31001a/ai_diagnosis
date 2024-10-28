import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseAdmin'; // Firebase Admin SDK
import connectMongo from '@/lib/connectMongo';
import User from '@/models/User';

export async function POST(req) {
  try {
    // Kết nối MongoDB
    await connectMongo();

    // Lấy thông tin từ request body (userId và mật khẩu mới)
    const { userId, newPassword } = await req.json();

    // Tìm người dùng trong MongoDB dựa trên userId
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Sử dụng Firebase Admin SDK để cập nhật mật khẩu trực tiếp
    await auth.updateUser(user.uid, {
      password: newPassword,
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ message: 'Failed to update password', error }, { status: 500 });
  }
}
