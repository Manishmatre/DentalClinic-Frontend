import React, { useState } from 'react';
import Button from './Button';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';

const FileUpload = ({
  onUpload,
  onError,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  previewUrl,
  className = '',
  label = 'Upload File',
  error = null,
  disabled = false,
}) => {
  const [localPreview, setLocalPreview] = useState(previewUrl || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      onError('Invalid file type. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      onError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Call onUpload callback
    try {
      await onUpload(file);
    } catch (err) {
      onError(err.message || 'Failed to upload file');
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <div className="upload-area">
        {localPreview ? (
          <div className="preview-container">
            <img src={localPreview} alt="Preview" className="preview-image" />
            <button
              type="button"
              className="remove-button"
              onClick={() => {
                setLocalPreview(null);
                onUpload(null);
              }}
              disabled={disabled}
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" className="upload-label">
            <FaUpload className="upload-icon" />
            <span>{label}</span>
            <input
              type="file"
              id="file-upload"
              accept={acceptedTypes.join(',')}
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

FileUpload.defaultProps = {
  maxSize: 5 * 1024 * 1024,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  previewUrl: null,
  className: '',
  label: 'Upload File',
  error: null,
  disabled: false,
};

export default FileUpload;
