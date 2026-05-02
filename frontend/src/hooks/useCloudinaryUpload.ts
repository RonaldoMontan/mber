import { useState } from 'react';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<string>;
  isUploading: boolean;
  uploadError: string | null;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const upload = async (file: File): Promise<string> => {
    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET no .env'
      );
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Falha ao fazer upload da imagem');
      }

      const data: CloudinaryUploadResult = await response.json();
      return data.secure_url;
    } catch (err: any) {
      const message = err?.message || 'Erro ao fazer upload da imagem';
      setUploadError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, uploadError };
}
