"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Modal, message } from "antd";

// Import động các component phụ thuộc vào client-side
const UploadArea = dynamic(() => import("@/components/UploadArea"), { ssr: false });
const ImagePreview = dynamic(() => import("@/components/ImagePreview"), { ssr: false });
const PredictionResult = dynamic(() => import("@/components/PredictionResult"), { ssr: false });
const LoadingSpinner = dynamic(() => import("@/components/LoadingSpinner"), { ssr: false });

// Import dịch vụ API
import { createProfile } from "@/services/apiService";

export default function DiagnosisPage() {
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Xử lý thay đổi file khi upload
  const handleChange = (info) => {
    setFileList(info.fileList);
    if (info.file.status === "done") {
      message.success(`Upload successful: ${info.file.name}`);
    } else if (info.file.status === "error") {
      message.error(`Upload failed: ${info.file.name}`);
    }
  };

  // Xử lý preview ảnh
  const handlePreview = (file) => {
    if (typeof window !== "undefined") {
      setPreviewImage(URL.createObjectURL(file.originFileObj));
      setIsPreviewVisible(true);
    }
  };

  // Xử lý xóa file khỏi danh sách
  const handleRemove = (file) => {
    const updatedFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(updatedFileList);
    message.success("File removed");
  };

  // Xử lý dự đoán (call API)
  const handlePredict = async () => {
    if (fileList.length === 0) {
      message.error("Please upload files first");
      return;
    }

    setLoading(true);

    try {
      const data = await createProfile(fileList);
      setResult(data);
      message.success("Prediction successful");
    } catch (error) {
      message.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ danh sách file
  const handleClear = () => {
    setFileList([]);
    setResult(null);
    message.info("Files cleared");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="container mx-auto py-10 px-4 text-center rounded-lg w-full max-w-3xl pt-20">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {result && <PredictionResult result={result} />}
            {!result && (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-red-500 fade-in-animation">
                  AI-Assisted Diagnosis
                </h1>
                <p className="text-md sm:text-lg mb-8 text-blue-400 fade-in-animation">
                  in Otolaryngological Endoscopy
                </p>
                <UploadArea fileList={fileList} handleChange={handleChange} />
                {fileList.length > 0 && (
                  <ImagePreview
                    fileList={fileList}
                    handlePreview={handlePreview}
                    handleRemove={handleRemove}
                  />
                )}
              </>
            )}
          </>
        )}

        <Modal
          open={isPreviewVisible}
          footer={null}
          onCancel={() => setIsPreviewVisible(false)}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <img alt="Preview" className="w-full" src={previewImage} />
        </Modal>

        {!loading && !result && (
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              type="primary"
              onClick={handlePredict}
              disabled={fileList.length === 0}
              className="bg-blue-400 hover:bg-blue-500 border-none"
            >
              Predict
            </Button>

            {fileList.length > 0 && (
              <Button
                type="danger"
                onClick={handleClear}
                className="bg-red-500 hover:bg-red-600 border-none"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .fade-in-animation {
          opacity: 0;
          animation: fadeIn 1.5s ease-in-out forwards;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
