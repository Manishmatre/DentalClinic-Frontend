import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaDownload, FaTrash, FaSearch, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';

const IMAGE_TYPES = [
  { value: 'panoramic', label: 'Panoramic X-Ray' },
  { value: 'periapical', label: 'Periapical X-Ray' },
  { value: 'bitewing', label: 'Bitewing X-Ray' },
  { value: 'cbct', label: 'CBCT Scan' },
  { value: 'intraoral', label: 'Intraoral Photo' },
  { value: 'extraoral', label: 'Extraoral Photo' }
];

const DentalImaging = ({ patientId, readOnly = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const fileInputRef = useRef(null);

  // Fetch dental images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await dentalService.getPatientImages(patientId);
        setImages(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dental images:', error);
        toast.error('Failed to load dental images');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchImages();
    }
  }, [patientId]);

  // Filter images based on search term, filter, and date range
  const filteredImages = images.filter(image => {
    const matchesSearch = 
      image.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (image.toothNumbers && image.toothNumbers.some(tooth => tooth.toString().includes(searchTerm)));
    
    // Filter by type
    if (filter !== 'all' && image.type !== filter) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.start && new Date(image.createdAt) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of the day
      if (new Date(image.createdAt) > endDate) {
        return false;
      }
    }
    
    return matchesSearch;
  });

  // Handle image selection
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Handle image upload
  const handleUpload = async (imageData) => {
    try {
      setLoading(true);
      await dentalService.uploadDentalImage(patientId, imageData);
      
      // Refresh images
      const data = await dentalService.getPatientImages(patientId);
      setImages(data);
      
      setShowUploadModal(false);
      setLoading(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setLoading(false);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await dentalService.deleteDentalImage(imageId);
      
      // Remove from state
      setImages(images.filter(img => img.id !== imageId));
      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage(null);
      }
      
      setLoading(false);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl font-semibold">Dental Imaging</h2>
          {!readOnly && (
            <button
              className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              onClick={() => setShowUploadModal(true)}
            >
              <FaUpload className="mr-2" />
              Upload Image
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
            <select
              className="w-full p-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {IMAGE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange(e, 'start')}
              />
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange(e, 'end')}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded"
                placeholder="Search by type, description, tooth #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              
              {(filter !== 'all' || searchTerm || dateRange.start || dateRange.end) && (
                <button
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery and Viewer */}
      <div className="flex flex-col md:flex-row">
        {/* Image Gallery */}
        <div className="w-full md:w-1/3 border-r overflow-y-auto" style={{ maxHeight: '600px' }}>
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 p-4">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  className={`cursor-pointer border rounded overflow-hidden ${selectedImage && selectedImage.id === image.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={image.url}
                      alt={image.description || 'Dental image'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-2 bg-gray-50 text-xs">
                    <div className="font-medium truncate">{IMAGE_TYPES.find(t => t.value === image.type)?.label || image.type}</div>
                    <div className="text-gray-500">{new Date(image.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
              <p className="text-gray-500 mb-4">No dental images found</p>
              {!readOnly && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                  onClick={() => setShowUploadModal(true)}
                >
                  <FaUpload className="mr-2" />
                  Upload First Image
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image Viewer */}
        <div className="w-full md:w-2/3 p-4">
          {selectedImage ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {IMAGE_TYPES.find(t => t.value === selectedImage.type)?.label || selectedImage.type}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Taken on {new Date(selectedImage.createdAt).toLocaleDateString()}
                    {selectedImage.takenBy && ` by ${selectedImage.takenBy.name}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center"
                    onClick={() => window.open(selectedImage.url, '_blank')}
                  >
                    <FaDownload className="mr-1" />
                    Download
                  </button>
                  {!readOnly && (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center"
                      onClick={() => handleDeleteImage(selectedImage.id)}
                    >
                      <FaTrash className="mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 border rounded p-4 bg-black flex justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.description || 'Dental image'}
                  className="max-h-96 max-w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedImage.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                    <p className="text-sm">{selectedImage.description}</p>
                  </div>
                )}
                
                {selectedImage.toothNumbers && selectedImage.toothNumbers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Teeth Involved</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedImage.toothNumbers.map(tooth => (
                        <span key={tooth} className="bg-gray-200 px-2 py-1 rounded text-xs">
                          Tooth #{tooth}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedImage.notes && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Clinical Notes</h4>
                    <p className="text-sm">{selectedImage.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500">Select an image to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          patientId={patientId}
        />
      )}
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, patientId }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [toothNumbers, setToothNumbers] = useState([]);
  const [notes, setNotes] = useState('');
  const [toothInput, setToothInput] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle tooth number input
  const handleAddTooth = () => {
    const tooth = parseInt(toothInput);
    if (isNaN(tooth) || tooth < 1 || tooth > 32) {
      toast.error('Please enter a valid tooth number (1-32)');
      return;
    }
    
    if (toothNumbers.includes(tooth)) {
      toast.error('This tooth number is already added');
      return;
    }
    
    setToothNumbers([...toothNumbers, tooth]);
    setToothInput('');
  };

  // Handle tooth number removal
  const handleRemoveTooth = (tooth) => {
    setToothNumbers(toothNumbers.filter(t => t !== tooth));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!file) {
      toast.error('Please select an image file');
      return;
    }
    
    if (!type) {
      toast.error('Please select an image type');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('toothNumbers', JSON.stringify(toothNumbers));
    formData.append('notes', notes);
    formData.append('patientId', patientId);
    
    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Upload Dental Image</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image File *</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto mb-2" />
                ) : (
                  <div className="text-gray-500">
                    <FaUpload className="mx-auto h-8 w-8 mb-2" />
                    <p>Click to select an image</p>
                    <p className="text-xs mt-1">Supported formats: JPEG, PNG, DICOM</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,.dcm"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            {/* Image Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Type *</label>
              <select
                className="w-full p-2 border rounded"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select Image Type</option>
                {IMAGE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the image"
              />
            </div>
          </div>
          
          <div>
            {/* Tooth Numbers */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Teeth Involved</label>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  max="32"
                  className="w-full p-2 border rounded-l"
                  value={toothInput}
                  onChange={(e) => setToothInput(e.target.value)}
                  placeholder="Enter tooth number (1-32)"
                />
                <button
                  className="bg-blue-500 text-white px-3 py-2 rounded-r"
                  onClick={handleAddTooth}
                >
                  <FaPlus />
                </button>
              </div>
              
              {toothNumbers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {toothNumbers.sort((a, b) => a - b).map(tooth => (
                    <span 
                      key={tooth} 
                      className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center"
                      onClick={() => handleRemoveTooth(tooth)}
                    >
                      Tooth #{tooth}
                      <FaTrash className="ml-1 text-red-500 cursor-pointer" />
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about findings, diagnosis, etc."
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default DentalImaging;
