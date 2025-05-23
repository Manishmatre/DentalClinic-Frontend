import React, { useState, useEffect } from 'react';
import { validateDocumentUpload } from '../../utils/validation.js';
import { documentService } from '../../api/documents/documentService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';

const DocumentUpload = ({ patientId, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState('');
  const categories = documentService.getDocumentCategories();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validation = validateDocumentUpload(selectedFiles);
    
    if (!validation.isValid) {
      setError(validation.errors.join('\n'));
      e.target.value = null;
      return;
    }

    setFiles(selectedFiles);
    setError(null);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });
      formData.append('category', category);
      if (tags) {
        formData.append('tags', tags.split(',').map(tag => tag.trim()));
      }

      // Show upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      await documentService.uploadDocuments(patientId, formData);

      // Complete the progress bar
      setProgress(100);
      clearInterval(progressInterval);

      // Clear the form and notify parent
      setFiles([]);
      setCategory('other');
      setTags('');
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
        
        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={handleTagsChange}
                placeholder="e.g., important, followup, urgent"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Files (Max 5 files, 10MB each)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>

          {files.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <span className="flex-1">{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploading && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <div className="flex items-center">
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Uploading...
                </div>
              ) : (
                'Upload Documents'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentUpload;