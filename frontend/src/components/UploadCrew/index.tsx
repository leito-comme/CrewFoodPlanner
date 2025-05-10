import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';
import { Button } from '../ui/button';
import { CrewMemberData } from '@/types';
import { FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils'

interface UploadCrewProps {
  onUploadSuccess: (newData: CrewMemberData[]) => void;
}

const UploadCrew = ({ onUploadSuccess }: UploadCrewProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Choose file for uploading!');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse = await axios.post(
        'http://127.0.0.1:8000/crew/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (Array.isArray(response.data)) {
        onUploadSuccess(response.data);
      } else {
        throw new Error('Server response error!');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.detail || error.message || 'Unknown error';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="p-3 rounded-lg flex gap-6 bg-card shadow-md outline-1 outline-border">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={isUploading}
        id="actual-btn"
        hidden
      />
      <Button asChild className="cursor-pointer">
        <label htmlFor="actual-btn">
          Choose File <FileText className="ml-auto h-4 w-4 opacity-50" />
        </label>
      </Button>
      <div className="inline-flex items-center font-medium text-sm text-muted-foreground">
        {file ? file.name : 'No file chosen'}
      </div>
      <Button
        className={cn(
          isUploading || !file ? 'bg-muted' : 'bg-primary hover:bg-primary/90',
          'gap-2' // если хочешь расстояние между текстом и иконкой
        )}
        onClick={handleUpload}
        disabled={isUploading || !file}>
        {isUploading ? 'Uploading...' : 'Upload'}{' '}
        <Upload className="ml-auto h-4 w-4 opacity-50" />
      </Button>
      {uploadError && (
        <div className="text-destructive mt-2 text-sm font-medium">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default UploadCrew;
