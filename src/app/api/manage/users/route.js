// app/api/users/route.js
import connectMongo from "@/lib/connectMongo";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo(); // Kết nối đến MongoDB

    const users = await User.find(); // Lấy tất cả người dùng từ bảng User

    return NextResponse.json({ users }); // Trả về danh sách người dùng dưới dạng JSON
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
