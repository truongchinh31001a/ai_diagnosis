'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Input, Space, Avatar, DatePicker } from 'antd';
import { SearchOutlined, FileImageOutlined, DownloadOutlined } from '@ant-design/icons';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

export default function ManageReports() {
  const [loadingReports, setLoadingReports] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Các hàng được chọn

  // Fetch Reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch('/api/manage/reports');
      const data = await response.json();
      setReports(data.reports);
      setFilteredReports(data.reports); // Set filtered reports to all reports initially
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Failed to load reports');
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Search function for Reports
  const handleReportSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = reports.filter((report) =>
      report.comment.toLowerCase().includes(value)
    );
    setFilteredReports(filtered);
  };

  // Lọc theo ngày tháng
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;
      const filtered = reports.filter((report) => {
        const reportDate = dayjs(report.createdAt);
        return reportDate.isAfter(startDate) && reportDate.isBefore(endDate);
      });
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  };

  // tải ảnh report
  const handleDownloadZip = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one report.");
      return;
    }

    const zip = new JSZip(); // Tạo đối tượng ZIP

    // Lặp qua các báo cáo được chọn và thêm ảnh vào ZIP
    for (const reportId of selectedRowKeys) {
      const report = reports.find((report) => report._id === reportId);
      if (report && report.imageDetails) {
        const imageUrl = report.imageDetails.path;
        const response = await fetch(imageUrl); // Fetch ảnh từ server
        const blob = await response.blob(); // Lấy dữ liệu dưới dạng Blob
        zip.file(report.imageDetails.filename, blob); // Thêm ảnh vào ZIP với tên tệp là filename
      }
    }

    // Tạo file ZIP và tải về
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `selected_reports.zip`); // Lưu file ZIP với tên là selected_reports.zip
    });
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  // Cấu hình bảng báo cáo
  const reportColumns = [
    {
      title: 'Image',
      dataIndex: ['imageDetails', 'path'],
      key: 'image',
      render: (path) => (
        <Avatar src={path} size={64} icon={<FileImageOutlined />} />
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => <span className="text-gray-700">{comment}</span>,
    },
    {
      title: 'User ID',
      dataIndex: 'user',
      key: 'user',
      render: (user) => <span className="text-gray-500">{user._id}</span>,
    },
    {
      title: 'Diagnosis',
      dataIndex: ['imageDetails', 'thirdPartyInfo', 'predictions'],
      key: 'thirdPartyInfo',
      render: (predictions) =>
        predictions ? (
          predictions.map((prediction, index) => (
            <span key={index} className="text-sm text-gray-700">
              {prediction.join(', ')}
            </span>
          ))
        ) : (
          'No Data'
        ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'), // Hiển thị ngày tháng
    },
  ];

  return (
    <div className="mt-10 mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Manage Reports</h2>

      {/* Phần tìm kiếm và lọc theo ngày tháng */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Search reports by comment"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={handleReportSearch}
            allowClear
            className="w-full md:w-1/3 p-2 rounded-lg border border-gray-300 focus:border-blue-500"
          />
        </div>
        <div className="flex-grow-0">
          <DatePicker.RangePicker onChange={handleDateRangeChange} />
        </div>
      </div>

      {loadingReports ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            rowSelection={rowSelection} // Thêm tính năng chọn hàng
            dataSource={filteredReports}
            columns={reportColumns}
            rowKey="_id"
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            className="rounded-lg w-full"
            style={{ fontSize: '16px' }}
          />
          {/* Ẩn nút nếu không có hàng nào được chọn */}
          {selectedRowKeys.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                icon={<DownloadOutlined />}
                className="bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 rounded px-4 py-2"
                onClick={handleDownloadZip} // Gọi hàm tải ZIP khi nhấn nút
              >
                Download
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
