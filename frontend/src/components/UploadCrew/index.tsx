import axios from "axios";
import { useState } from "react";
import { Button } from "../ui/button";

const UploadCrew = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Выберите файл для загрузки");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:8000/crew/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (Array.isArray(response.data)) {
        onUploadSuccess(response.data);
      } else {
        throw new Error("Некорректный формат ответа");
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || "Ошибка загрузки файла");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={isUploading}
      />
      <Button
        className={`px-4 py-2 text-white rounded ${
          isUploading || !file ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={handleUpload}
        disabled={isUploading || !file}
      >
        {isUploading ? "Загрузка..." : "Загрузить"}
      </Button>
      {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
    </div>
  );
};

export default UploadCrew;
