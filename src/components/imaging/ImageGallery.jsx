import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaTrash, FaEdit, FaEye, FaDownload } from 'react-icons/fa';
import digitalImagingService from '../../services/digitalImagingService';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/dicom'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload JPEG, PNG, or DICOM files.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 10MB.');
        return;
      }
      
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedImage = await digitalImagingService.uploadImage({
        file: uploadData.file,
        appointmentId,
        patientId,
        imageType: uploadData.imageType,
        notes: uploadData.notes
      });

      setImages(prev => [...prev, uploadedImage]);
      setShowUploadModal(false);
      setUploadData({ file: null, imageType: '', notes: '' });
      
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

  const renderUploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Upload Medical Image</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image File
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/dicom"
              onChange={handleFileSelect}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Type
            </label>
            <select
              value={uploadData.imageType}
              onChange={(e) => setUploadData(prev => ({ ...prev, imageType: e.target.value }))}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={uploadData.notes}
              onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-md border-gray-300"
              rows="3"
              placeholder="Add any notes about the image..."
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowUploadModal(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={isUploading || !uploadData.file}
          >
            Upload
          </Button>
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
    </div>
  );
};

export default ImageGallery; 