import { auth } from "@/firebase.config"; // Đảm bảo bạn đã thiết lập auth từ Firebase

export const createProfile = async (fileList) => {
  const formData = new FormData();

  // Lặp qua danh sách file và thêm từng file vào form data
  fileList.forEach((file) => {
    formData.append('images', file.originFileObj); // Sử dụng originFileObj để lấy file gốc
  });

  // Tạo tên hồ sơ tự động với "Hồ sơ" + số ngẫu nhiên
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Tạo số ngẫu nhiên 4 chữ số
  const autoGeneratedName = `#${randomNumber}`;

  // Thêm tên hồ sơ vào form data
  formData.append('name', autoGeneratedName);

  try {
    // Kiểm tra nếu người dùng đã đăng nhập
    const user = auth.currentUser;
    let headers = {};

    if (user) {
      // Lấy token xác thực từ Firebase nếu người dùng đã đăng nhập
      const token = await user.getIdToken();
      headers = {
        'Authorization': `Bearer ${token}`, // Thêm token vào header
      };
    } else {
      // Nếu người dùng chưa đăng nhập, không thêm token
      headers = {};
    }

    // Gửi request đến API tạo hồ sơ
    const response = await fetch('/api/create-profile', {
      method: 'POST',
      headers: headers, // Gửi kèm token nếu có
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Something went wrong during profile creation');
  }
};