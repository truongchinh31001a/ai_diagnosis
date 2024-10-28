import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseAdmin';  // Firebase Admin SDK để quản lý người dùng
import connectMongo from '@/lib/connectMongo';
import User from '@/models/User';  // Model MongoDB cho người dùng

export async function DELETE(req) {
  try {
    // Kết nối MongoDB
    await connectMongo();

    // Lấy `userId` từ request body hoặc URL (tùy theo cách bạn thiết kế API)
    const { userId } = await req.json();  // Hoặc lấy từ URL nếu bạn đang sử dụng param

    // Tìm người dùng trong MongoDB dựa trên `userId`
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Xóa người dùng khỏi Firebase Authentication
    await auth.deleteUser(user.uid);  // `uid` của người dùng trong Firebase

    // Xóa người dùng khỏi MongoDB
    await User.findByIdAndDelete(userId);  // Xóa người dùng trong MongoDB

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user', error }, { status: 500 });
  }
}
