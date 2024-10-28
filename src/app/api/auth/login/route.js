import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase.config';
import User from '@/models/User';
import connectMongo from '@/lib/connectMongo';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Kiểm tra email và password không rỗng
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Đăng nhập với Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kết nối tới MongoDB
    await connectMongo();

    // Kiểm tra xem người dùng đã tồn tại trong MongoDB chưa (chỉ lưu thông tin, không lưu mật khẩu)
    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      // Nếu người dùng chưa tồn tại trong MongoDB, tạo mới với thông tin từ Firebase
      existingUser = new User({
        email: user.email,
        firstName: user.displayName ? user.displayName.split(' ')[0] : 'Unknown',
        lastName: user.displayName ? user.displayName.split(' ')[1] : '',
        uid: user.uid, // UID từ Firebase
        provider: 'email-password', // Hoặc 'google' nếu là đăng nhập qua Google
      });
      await existingUser.save();
    }

    // Thành công
    return NextResponse.json({
      message: "Login successful",
      user: { uid: user.uid, email: user.email }
    }, { status: 200 });

  } catch (error) {
    let errorMessage = "Login failed";

    // Xử lý các lỗi cụ thể từ Firebase
    if (error.code === 'auth/user-not-found') {
      errorMessage = "User not found";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
