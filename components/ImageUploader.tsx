import React, { useState, useCallback, useEffect } from 'react';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h18v-3.75M16.5 13.5L12 9l-4.5 4.5" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, maxFiles = 5 }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).slice(0, maxFiles - files.length);
      const allFiles = [...files, ...newFiles];
      setFiles(allFiles);
      onFilesChange(allFiles);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
    // Reset file input value to allow re-uploading the same file
    event.target.value = '';
  }, [files, maxFiles, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previewUrls];
    
    newFiles.splice(index, 1);
    
    // Revoke the object URL before removing it from state
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviewUrls(newPreviews);
    onFilesChange(newFiles);
  }, [files, previewUrls, onFilesChange]);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
        <label
            htmlFor="image-upload"
            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-8 h-8 mb-4 text-gray-500"/>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, or GIF (MAX. {maxFiles} images)</p>
            </div>
            <input
                id="image-upload"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                onChange={handleFileChange}
                disabled={files.length >= maxFiles}
            />
        </label>
        {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {previewUrls.map((url, index) => (
                    <div key={url} className="relative group aspect-square">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md shadow-sm" />
                        <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default ImageUploader;
