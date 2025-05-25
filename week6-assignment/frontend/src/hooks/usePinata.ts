import { useState } from 'react';
import { uploadToPinata, uploadMetadataToPinata } from '../services/pinataService';
import type { FileWithPreview, NFTMetadata } from '../types/nft';
import { createFilePreview, validateFile } from '../utils/helpers';

export const usePinata = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload file to IPFS via Pinata
  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Validate file
      const { valid, message } = validateFile(file);
      if (!valid) {
        throw new Error(message);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Upload file to IPFS
      const ipfsHash = await uploadToPinata(file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      return ipfsHash;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Upload metadata JSON to IPFS via Pinata
  const uploadMetadata = async (metadata: NFTMetadata): Promise<string> => {
    try {
      return await uploadMetadataToPinata(metadata);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload metadata');
      throw error;
    }
  };

  // Process and prepare file for upload
  const prepareFile = async (file: File): Promise<FileWithPreview> => {
    const preview = await createFilePreview(file);
    return Object.assign(file, { preview });
  };

  return {
    uploadFile,
    uploadMetadata,
    prepareFile,
    isUploading,
    uploadProgress,
    uploadError,
    setUploadError
  };
};