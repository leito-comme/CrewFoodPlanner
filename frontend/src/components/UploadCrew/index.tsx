import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { Button } from "../ui/button";
import { CrewMemberData } from "@/types";

interface UploadCrewProps {
  onUploadSuccess: (newData: CrewMemberData[]) => void;
}

const UploadCrew = ({ onUploadSuccess }: UploadCrewProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Choose file for uploading!");
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
        throw new Error("Server response error!");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.detail || error.message || "Unknown error";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="p-3 rounded-md flex gap-6 bg-blue-300/20">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={isUploading}
        id="actual-btn"
        hidden
      />
      <label
        htmlFor="actual-btn"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
      >
        Choose File
      </label>
      <div className="inline-flex items-center font-medium text-md">
        {file ? file.name : "No file chosen"}
      </div>
      <Button
        className={`px-4 py-2 text-white rounded-lg ${
          isUploading || !file ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={handleUpload}
        disabled={isUploading || !file}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </Button>
      {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
    </div>
  );
};

export default UploadCrew;
