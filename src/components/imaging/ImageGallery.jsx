import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaTrash, FaEdit, FaEye, FaDownload } from 'react-icons/fa';
import digitalImagingService from '../../services/digitalImagingService';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const ImageGallery = ({ appointmentId, patientId, onImageUploaded }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    imageType: '',
    notes: ''
  });
  const [editImage, setEditImage] = useState(null);
  const [editData, setEditData] = useState({ imageType: '', notes: '' });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef();
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load images when component mounts or IDs change
  useEffect(() => {
    loadImages();
  }, [appointmentId, patientId]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      let imageData;
      
      if (appointmentId) {
        imageData = await digitalImagingService.getAppointmentImages(appointmentId);
      } else if (patientId) {
        imageData = await digitalImagingService.getPatientImages(patientId);
      }
      
      setImages(imageData || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/dicom'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload JPEG, PNG, or DICOM files.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size too large. Maximum size is 10MB.');
        return;
      }
      setUploadData(prev => ({ ...prev, file }));
      setUploadError('');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const removeSelectedFile = () => {
    setUploadData(prev => ({ ...prev, file: null }));
    setPreviewUrl(null);
  };
  const handleUpload = async () => {
    if (!uploadData.file) {
      setUploadError('Please select a file to upload');
      return;
    }
    if (!uploadData.imageType) {
      setUploadError('Please select an image type');
      return;
    }
    setUploadError('');

    try {
      setIsUploading(true);
      const uploadedImage = await digitalImagingService.uploadImage({
        file: uploadData.file,
        patientId,
        imageType: uploadData.imageType,
        notes: uploadData.notes
      });

      setImages(prev => [...prev, uploadedImage]);
      setShowUploadModal(false);
      setUploadData({ file: null, imageType: '', notes: '' });
      setPreviewUrl(null);
      
      if (onImageUploaded) {
        onImageUploaded(uploadedImage);
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await digitalImagingService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img._id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
  };

  const handleEdit = (image) => {
    setEditImage(image);
    setEditData({ imageType: image.imageType, notes: image.notes || '' });
    setIsEditing(true);
  };
  const handleEditSave = async () => {
    try {
      const updated = await digitalImagingService.updateImageMetadata(editImage._id, editData);
      setImages(prev => prev.map(img => img._id === updated._id ? updated : img));
      setIsEditing(false);
      setEditImage(null);
      toast.success('Image updated successfully');
    } catch (error) {
      toast.error('Failed to update image');
    }
  };

  const renderUploadModal = () => (
    <Modal isOpen={showUploadModal} onClose={() => { setShowUploadModal(false); setUploadError(''); setPreviewUrl(null); }} title="Upload Dental Image" size="sm">
      <form onSubmit={e => { e.preventDefault(); handleUpload(); }} className="space-y-6">
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image File <span className="text-red-500">*</span></label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition bg-gray-50"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
          >
            {previewUrl ? (
              <div className="relative w-32 h-32 mb-2">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded" />
                <button type="button" onClick={removeSelectedFile} className="absolute top-0 right-0 bg-white rounded-full p-1 shadow text-red-500 hover:bg-red-100"><FaTrash /></button>
              </div>
            ) : (
              <>
                <FaUpload className="text-3xl text-gray-400 mb-2" />
                <span className="text-gray-500">Drag & drop or click to select image</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/dicom"
              onChange={handleFileSelect}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
          {uploadError && <div className="text-red-500 text-sm mt-1">{uploadError}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Type <span className="text-red-500">*</span></label>
          <select
            value={uploadData.imageType}
            onChange={e => setUploadData(prev => ({ ...prev, imageType: e.target.value }))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select type...</option>
            <option value="xray">X-Ray</option>
            <option value="mri">MRI</option>
            <option value="ct">CT Scan</option>
            <option value="ultrasound">Ultrasound</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input
          label="Notes"
          type="textarea"
          value={uploadData.notes}
          onChange={e => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
          className="resize-none"
          rows={3}
          helperText="Add any notes about the image (optional)"
        />
        <div className="flex justify-end space-x-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => { setShowUploadModal(false); setUploadError(''); setPreviewUrl(null); }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isUploading}
            disabled={isUploading || !uploadData.file || !uploadData.imageType}
          >
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  );

  const renderEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Image Metadata</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
            <select
              value={editData.imageType}
              onChange={e => setEditData(prev => ({ ...prev, imageType: e.target.value }))}
              className="w-full rounded-md border-gray-300"
            >
              <option value="">Select type...</option>
              <option value="xray">X-Ray</option>
              <option value="mri">MRI</option>
              <option value="ct">CT Scan</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editData.notes}
              onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-md border-gray-300"
              rows="3"
              placeholder="Add any notes about the image..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleEditSave} isLoading={false}>Save</Button>
        </div>
      </div>
    </div>
  );

  const renderImageViewer = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {selectedImage.imageType.toUpperCase()} - {new Date(selectedImage.uploadedAt).toLocaleDateString()}
          </h3>
          <Button
            variant="outline"
            onClick={() => setSelectedImage(null)}
          >
            Close
          </Button>
        </div>
        
        <div className="relative">
          <img
            src={digitalImagingService.getImageUrl(selectedImage._id)}
            alt={selectedImage.notes || 'Medical image'}
            className="max-w-full h-auto"
          />
        </div>
        
        {selectedImage.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{selectedImage.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medical Images</h3>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center"
        >
          <FaUpload className="mr-2" />
          Upload Image
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No images available
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(image => (
            <div
              key={image._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="relative aspect-square">
                <img
                  src={digitalImagingService.getThumbnailUrl(image._id)}
                  alt={image.notes || 'Medical image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      variant="icon"
                      onClick={() => handleViewImage(image)}
                      className="bg-white text-gray-800 hover:bg-gray-100"
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="icon"
                      onClick={() => handleEdit(image)}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="icon"
                      onClick={() => handleDelete(image._id)}
                      className="bg-white text-red-600 hover:bg-red-50"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900">
                  {image.imageType.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(image.uploadedAt).toLocaleDateString()}
                </div>
                {image.notes && (
                  <div className="mt-1 text-xs text-gray-600 truncate">
                    {image.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && renderUploadModal()}
      {selectedImage && renderImageViewer()}
      {isEditing && renderEditModal()}
    </div>
  );
};

export default ImageGallery; 