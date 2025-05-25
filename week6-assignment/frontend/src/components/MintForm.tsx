import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useWeb3 } from '../hooks/useWeb3';
import { useNFTs } from '../hooks/useNFTs';
import { usePinata } from '../hooks/usePinata';
import { createNFTMetadata } from '../utils/helpers';
import { NFT_ATTRIBUTES, MAX_FILE_SIZE } from '../utils/constants';
import type { FileWithPreview } from '../types/nft';

const MintForm = () => {
  const { isConnected } = useWeb3();
  const { mintNFT } = useNFTs();
  const { uploadFile, uploadMetadata, prepareFile, uploadProgress, uploadError } = usePinata();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintingStep, setMintingStep] = useState<'idle' | 'uploading' | 'minting' | 'success'>('idle');
  const [tokenId, setTokenId] = useState<string | null>(null);
  
  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        const preparedFile = await prepareFile(acceptedFiles[0]);
        setFile(preparedFile);
      } catch (error) {
        console.error('Error preparing file:', error);
        toast.error('Failed to prepare file for upload');
      }
    }
  }, [prepareFile]);
  
  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': ['.mp4'],
      'audio/*': ['.mp3', '.wav'],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
  });
  
  // Add/update attribute
  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const updatedAttributes = [...attributes];
    
    if (!updatedAttributes[index]) {
      updatedAttributes[index] = { trait_type: '', value: '' };
    }
    
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };
  
  // Add new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };
  
  // Remove attribute field
  const removeAttribute = (index: number) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!file) {
      toast.error('Please upload a file for your NFT');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Please provide a name for your NFT');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setMintingStep('uploading');
      
      // 1. Upload file to IPFS
      const fileUri = await uploadFile(file);
      
      // 2. Create and upload metadata
      const filteredAttributes = attributes.filter(attr => attr.trait_type && attr.value);
      const metadata = createNFTMetadata(name, description, fileUri, filteredAttributes);
      const metadataUri = await uploadMetadata(metadata);
      
      // 3. Mint NFT
      setMintingStep('minting');
      const newTokenId = await mintNFT(metadataUri);
      
      // 4. Success
      setMintingStep('success');
      setTokenId(newTokenId);
      toast.success('NFT minted successfully!');
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT. Please try again.');
      setMintingStep('idle');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form state
  const resetForm = () => {
    setName('');
    setDescription('');
    setFile(null);
    setAttributes([]);
    setMintingStep('idle');
  };
  
  // Clear selected file
  const clearFile = () => {
    setFile(null);
  };
  
  // Check if form is valid
  const isFormValid = name.trim() && file && isConnected;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mint a New NFT</h2>
      
      {mintingStep === 'success' ? (
        <div className="flex flex-col items-center justify-center py-8">
          <svg className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">NFT Minted Successfully!</h3>
          <p className="text-gray-600 mb-6 text-center">
            Your new NFT has been minted with token ID: <span className="font-semibold">{tokenId}</span>
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
            >
              Mint Another NFT
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              NFT Image/Media <span className="text-red-500">*</span>
            </label>
            
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...getInputProps()} />
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                
                <p className="text-gray-600 mb-2">
                  {isDragActive
                    ? 'Drop the file here...'
                    : 'Drag & drop a file here, or click to browse'}
                </p>
                
                <p className="text-gray-500 text-sm">
                  Supported formats: JPG, PNG, GIF, WEBP, MP4, MP3, WAV (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative border rounded-lg p-4">
                <div className="flex items-center">
                  {file.type.startsWith('image/') ? (
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-4">
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : file.type.startsWith('video/') ? (
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-4 flex items-center justify-center">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-4 flex items-center justify-center">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-gray-500 text-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter NFT name"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter NFT description"
              rows={4}
            />
          </div>

          {/* Attributes */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium">Attributes</label>
              <button
                type="button"
                onClick={addAttribute}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Attribute
              </button>
            </div>
            
            {attributes.length === 0 ? (
              <p className="text-gray-500 text-sm mb-2">
                No attributes added yet. Attributes help describe your NFT's unique features.
              </p>
            ) : (
              <div className="space-y-3 mb-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={attr.trait_type}
                      onChange={e => handleAttributeChange(index, 'trait_type', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select trait type</option>
                      {NFT_ATTRIBUTES.map(attrOption => (
                        <option key={attrOption.name} value={attrOption.name}>
                          {attrOption.name}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={attr.value}
                      onChange={e => handleAttributeChange(index, 'value', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={!attr.trait_type}
                    >
                      <option value="">Select value</option>
                      {attr.trait_type && 
                        NFT_ATTRIBUTES.find(a => a.name === attr.trait_type)?.values.map(value => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`
                w-full py-3 rounded-lg font-medium transition-colors
                ${isFormValid && !isSubmitting
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {mintingStep === 'uploading' 
                    ? `Uploading... ${Math.round(uploadProgress)}%` 
                    : mintingStep === 'minting'
                    ? 'Minting NFT...'
                    : 'Processing...'}
                </div>
              ) : (
                'Mint NFT'
              )}
            </button>
            
            {/* Display upload error if any */}
            {uploadError && (
              <p className="mt-2 text-red-500 text-sm">{uploadError}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default MintForm;