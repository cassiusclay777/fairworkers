import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const FileUpload = ({ onUploadComplete, maxFiles = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size (5MB max)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('userId', user.id);
      
      files.forEach(file => {
        formData.append('profilePhoto', file);
      });

      const response = await api.post('/api/uploads/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      const newFiles = Array.isArray(response.data.files) 
        ? response.data.files 
        : [response.data.file];

      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (onUploadComplete) {
        onUploadComplete(newFiles);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (filename) => {
    try {
      await api.delete(`/api/uploads/${filename}`);
      setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
    } catch (error) {
      console.error('Error removing file:', error);
      setError('Failed to remove file');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          uploading 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-white/20 hover:border-primary-500/50 hover:bg-primary-500/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Drag & drop files here or click to browse
          </p>
          <p className="text-white/40 text-xs">
            Supported: JPG, PNG, WebP • Max 5MB per file
          </p>
        </label>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-white/60 mt-2">{progress}%</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white/80">Uploaded Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                  <img
                    src={`http://localhost:3000${file.path}`}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yzc1OGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                <button
                  onClick={() => removeFile(file.filename)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs">×</span>
                </button>
                <div className="mt-2 text-xs text-white/60 truncate">
                  {file.originalName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-semibold text-white/80 mb-2">Upload Tips</h4>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• Use clear, well-lit photos</li>
          <li>• Show your face clearly for profile verification</li>
          <li>• For service photos, show your workspace or tools</li>
          <li>• Keep file sizes under 5MB for faster loading</li>
          <li>• WebP format recommended for best quality/size ratio</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;