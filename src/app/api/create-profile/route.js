import { NextResponse } from 'next/server';
import Profile from '@/models/Profile';
import User from '@/models/User'; // Mô hình User trong MongoDB
import { sendImageToThirdPartyAPI } from '@/services/sendImageToThirdPartyAPI';
import path from 'path';
import { promises as fs } from 'fs'; 
import connectMongo from '@/lib/connectMongo';
import { verifyTokenAndGetUserId } from '@/lib/firebaseAdmin';

export async function POST(req) {
  await connectMongo(); // Kết nối MongoDB

  const formData = await req.formData(); // Nhận dữ liệu form
  const name = formData.get('name'); // Lấy tên từ form data
  const files = formData.getAll('images'); // Lấy danh sách file ảnh

  if (!name || files.length === 0) {
    return NextResponse.json({ message: 'Profile name and images are required' }, { status: 400 });
  }

  // Kiểm tra Authorization header để xác định người dùng
  const authHeader = req.headers.get('Authorization');
  let userId = null;
  try {
    const firebaseUid = await verifyTokenAndGetUserId(authHeader);
    const user = await User.findOne({ uid: firebaseUid }); 
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    userId = user._id; // Lưu ObjectId của người dùng
  } catch (error) {
    console.error('Error verifying token or fetching user:', error.message);
  }

  // Tạo thư mục upload nếu chưa tồn tại
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const images = await Promise.all(files.map(async (file) => {
    const filePath = `/uploads/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(`./public${filePath}`, buffer); // Lưu file lên server

    return {
      filename: file.name,
      path: filePath,
      originalname: file.name,
    };
  }));

  // Tạo đối tượng Profile mới
  let profileData = {
    name,
    images,
    isUser: !!userId,
  };

  if (userId) {
    profileData.createdBy = userId; // Gán ObjectId của người dùng vào trường createdBy
  }

  try {
    let profile = new Profile(profileData);
    await profile.save(); // Lưu profile vào MongoDB

    const updatedImages = await Promise.all(images.map(async (image) => {
      try {
        const thirdPartyResult = await sendImageToThirdPartyAPI(`./public${image.path}`);
        return {
          ...image,
          thirdPartyInfo: thirdPartyResult,
        };
      } catch (error) {
        console.error(`Failed to process image ${image.filename}: ${error.message}`);
        return image;
      }
    }));

    profile.images = updatedImages;
    await profile.save(); // Cập nhật lại Profile với thông tin từ bên thứ 3

    return NextResponse.json({
      message: 'Profile created and updated with third-party info successfully',
      profile,
    });
  } catch (error) {
    console.error('Error creating profile:', error.message);
    return NextResponse.json({ message: 'Error creating profile' }, { status: 500 });
  }
}
