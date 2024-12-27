import connectMongo from '@/lib/connectMongo';
import Report from '@/models/Report';

export async function GET() {
  try {
    // Kết nối MongoDB
    await connectMongo();

    // Lấy danh sách báo cáo và populate thông tin user
    const reports = await Report.find()
      .populate({
        path: 'user', // Populate trường user
        select: 'firstName lastName email', // Chỉ lấy các trường cần thiết
      })
      .exec();

    // Định dạng dữ liệu trả về
    const formattedReports = reports.map((report) => ({
      reportId: report._id,
      profileId: report.profileId,
      comment: report.comment,
      user: report.user
        ? {
            name: `${report.user.firstName} ${report.user.lastName}`,
            email: report.user.email,
          }
        : {
            name: 'Unknown',
            email: 'No email',
          },
      imageDetails: report.imageDetails,
      createdAt: report.createdAt,
    }));

    return new Response(JSON.stringify({ reports: formattedReports }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch reports', error }),
      { status: 500 }
    );
  }
}
