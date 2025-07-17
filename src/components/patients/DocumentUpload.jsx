import React, { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { documentService } from '../../api/documents/documentService';
import { toast } from 'react-toastify';

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const DocumentUpload = ({ patientId, onUploadComplete, onClose }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const categories = documentService.getDocumentCategories();

  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      file: null,
      category: 'other',
      tags: '',
      description: ''
    }
  });

  useEffect(() => {
    reset({ file: null, category: 'other', tags: '', description: '' });
    setPreview(null);
  }, [reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type.');
      return;
    }
    setValue('file', file);
    setError(null);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreview('pdf');
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data) => {
    if (!data.file) {
      setError('Please select a file to upload');
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('documents', data.file);
      formData.append('category', data.category);
      formData.append('tags', data.tags);
      formData.append('metadata', JSON.stringify({ description: data.description }));
      await documentService.uploadDocuments(patientId, formData);
      toast.success('Document uploaded successfully');
      if (onUploadComplete) onUploadComplete();
      if (onClose) onClose();
      reset();
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}
      {/* File Input with Preview */}
      <Controller
        name="file"
        control={control}
        rules={{ required: 'File is required' }}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File *</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                preview === 'pdf' ? (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl text-red-500">PDF</span>
                    <span className="text-xs text-gray-500 mt-2">PDF file selected</span>
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto mb-2" />
                )
              ) : (
                <div className="text-gray-500">
                  <span className="block mb-2">Click to select a file</span>
                  <span className="text-xs">Supported: Images, PDF, DOCX</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={e => {
                  handleFileChange(e);
                  field.onChange(e.target.files[0]);
                }}
                disabled={uploading || isSubmitting}
              />
            </div>
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
          </div>
        )}
      />
      {/* Category */}
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Category is required' }}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Category *</label>
            <select
              {...field}
              className="w-full border px-3 py-2 rounded"
              disabled={uploading || isSubmitting}
            >
              {categories.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
        )}
      />
      {/* Tags */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              {...field}
              type="text"
              placeholder="e.g., important, followup, urgent"
              className="w-full border px-3 py-2 rounded"
              disabled={uploading || isSubmitting}
            />
          </div>
        )}
      />
      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              {...field}
              type="text"
              placeholder="Description of the document"
              className="w-full border px-3 py-2 rounded"
              disabled={uploading || isSubmitting}
            />
          </div>
        )}
      />
      <div className="flex justify-end space-x-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={uploading || isSubmitting}>Cancel</Button>
        )}
        <Button type="submit" loading={uploading || isSubmitting} disabled={uploading || isSubmitting}>
          Upload
        </Button>
      </div>
    </form>
  );
};

export default DocumentUpload;