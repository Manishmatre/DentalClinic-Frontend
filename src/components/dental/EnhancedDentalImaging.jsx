import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FaUpload, FaDownload, FaTrash, FaSearch, FaPlus, FaCalendarAlt, FaImage, FaEye, FaEdit, FaTimes, FaChevronDown, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import dentalService from '../../api/dental/dentalService';

const IMAGE_TYPES = [
  { value: 'panoramic', label: 'Panoramic X-Ray' },
  { value: 'periapical', label: 'Periapical X-Ray' },
  { value: 'bitewing', label: 'Bitewing X-Ray' },
  { value: 'cbct', label: 'CBCT Scan' },
  { value: 'intraoral', label: 'Intraoral Photo' },
  { value: 'extraoral', label: 'Extraoral Photo' }
];

// Sample images for demo purposes
const SAMPLE_IMAGES = [
  {
    _id: 'img1',
    type: 'panoramic',
    description: 'Full mouth panoramic X-ray',
    date: '2024-04-15T00:00:00.000Z',
    url: 'https://www.dentalcare.com/~/media/MRCDental/Images/Global/global-content/clinical-education/clinical-topics/periodontal-disease-stages-and-treatments/periodontal-disease-stages-and-treatments-fig2.jpg',
    thumbnailUrl: 'https://www.dentalcare.com/~/media/MRCDental/Images/Global/global-content/clinical-education/clinical-topics/periodontal-disease-stages-and-treatments/periodontal-disease-stages-and-treatments-fig2.jpg',
    notes: 'Initial panoramic X-ray showing overall dental condition'
  },
  {
    _id: 'img2',
    type: 'periapical',
    description: 'Periapical X-ray of tooth #8',
    date: '2024-04-16T00:00:00.000Z',
    url: 'https://www.dentalcare.com/~/media/MRCDental/Images/Global/global-content/clinical-education/clinical-topics/dental-radiographic-anatomy/dental-radiographic-anatomy-fig9.jpg',
    thumbnailUrl: 'https://www.dentalcare.com/~/media/MRCDental/Images/Global/global-content/clinical-education/clinical-topics/dental-radiographic-anatomy/dental-radiographic-anatomy-fig9.jpg',
    notes: 'Periapical X-ray showing root structure of tooth #8'
  },
  {
    _id: 'img3',
    type: 'intraoral',
    description: 'Intraoral photo of upper arch',
    date: '2024-04-17T00:00:00.000Z',
    url: 'https://www.dentalcare.com/~/media/MRCDental/Images/Global/global-content/clinical-education/clinical-topics/gingival-health/gingival-health-fig1.jpg',
    thumbnailUrl: 'https://www.dentalcare.com/~/media/MRCDental/Images/Global/global-content/clinical-education/clinical-topics/gingival-health/gingival-health-fig1.jpg',
    notes: 'Intraoral photo showing gingival condition'
  }
];

const EnhancedDentalImaging = ({ patientId, readOnly = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const fileInputRef = useRef(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const typeDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  
  // Fetch dental images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await dentalService.getPatientImages(patientId);
        setImages(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dental images:', error);
        toast.error('Failed to load dental images');
        // Use sample data for demo purposes
        setImages(SAMPLE_IMAGES);
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchImages();
    }
  }, [patientId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = async (imageData) => {
    try {
      setLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', imageData.file);
      formData.append('type', imageData.type);
      formData.append('description', imageData.description);
      formData.append('notes', imageData.notes);
      
      // Upload image
      const result = await dentalService.uploadDentalImage(patientId, formData);
      
      // Update images list
      setImages(prev => [result, ...prev]);
      
      setShowUploadForm(false);
      setLoading(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      
      // For demo purposes, add a mock image
      const mockImage = {
        _id: `mock-${Date.now()}`,
        type: imageData.type,
        description: imageData.description,
        date: new Date().toISOString(),
        url: URL.createObjectURL(imageData.file),
        thumbnailUrl: URL.createObjectURL(imageData.file),
        notes: imageData.notes
      };
      
      setImages(prev => [mockImage, ...prev]);
      setShowUploadForm(false);
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      setLoading(true);
      await dentalService.deleteDentalImage(imageId);
      
      // Update images list
      setImages(prev => prev.filter(img => img._id !== imageId));
      
      if (selectedImage && selectedImage._id === imageId) {
        setSelectedImage(null);
      }
      
      setLoading(false);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      
      // For demo purposes, remove from state anyway
      setImages(prev => prev.filter(img => img._id !== imageId));
      setLoading(false);
    }
  };

  const handleUpdateImage = async (imageId, updatedData) => {
    try {
      setLoading(true);
      const result = await dentalService.updateDentalImage(imageId, updatedData);
      
      // Update images list
      setImages(prev => prev.map(img => 
        img._id === imageId ? { ...img, ...updatedData } : img
      ));
      
      if (selectedImage && selectedImage._id === imageId) {
        setSelectedImage(prev => ({ ...prev, ...updatedData }));
      }
      
      setLoading(false);
      toast.success('Image updated successfully');
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
      
      // For demo purposes, update in state anyway
      setImages(prev => prev.map(img => 
        img._id === imageId ? { ...img, ...updatedData } : img
      ));
      setLoading(false);
    }
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setShowImageViewer(true);
  };

  const filteredImages = images.filter(img => {
    // Filter by type
    if (filterType !== 'all' && img.type !== filterType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        img.description.toLowerCase().includes(term) ||
        img.notes.toLowerCase().includes(term) ||
        img.type.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Sort images
  const sortedImages = [...filteredImages].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const getImageTypeLabel = (type) => {
    const imageType = IMAGE_TYPES.find(t => t.value === type);
    return imageType ? imageType.label : type;
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaImage className="mr-2 text-blue-500" /> Dental Imaging
        </h3>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search images..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
                tabIndex={-1}
              >
                ×
              </button>
            )}
          </div>
          {/* Type Dropdown */}
          <div className="relative ml-2" ref={typeDropdownRef}>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center min-w-[140px] justify-between"
              onClick={() => setShowTypeDropdown((v) => !v)}
              type="button"
            >
              <FaFilter className="mr-2" />
              {filterType === 'all' ? 'All Types' : (IMAGE_TYPES.find(t => t.value === filterType)?.label || filterType)}
              <FaChevronDown className="ml-2" />
            </Button>
            {showTypeDropdown && (
              <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterType === 'all' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setFilterType('all'); setShowTypeDropdown(false); }}
                >
                  All Types
                </button>
                {IMAGE_TYPES.map(type => (
                  <button
                    key={type.value}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${filterType === type.value ? 'text-indigo-600 font-semibold' : ''}`}
                    onClick={() => { setFilterType(type.value); setShowTypeDropdown(false); }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Sort Dropdown */}
          <div className="relative ml-2" ref={sortDropdownRef}>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center min-w-[120px] justify-between"
              onClick={() => setShowSortDropdown((v) => !v)}
              type="button"
            >
              <FaSortAmountDown className="mr-2" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              <FaChevronDown className="ml-2" />
            </Button>
            {showSortDropdown && (
              <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${sortOrder === 'newest' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setSortOrder('newest'); setShowSortDropdown(false); }}
                >
                  Newest First
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${sortOrder === 'oldest' ? 'text-indigo-600 font-semibold' : ''}`}
                  onClick={() => { setSortOrder('oldest'); setShowSortDropdown(false); }}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>
          {/* Upload Button */}
          {!readOnly && (
            <Button
              size="sm"
              variant="primary"
              className="flex items-center ml-2"
              onClick={() => setShowUploadForm(true)}
            >
              <FaUpload className="mr-2" /> Upload Image
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">
        {/* Image List */}
        {sortedImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedImages.map((img) => (
              <div key={img._id} className="bg-gray-50 p-4 rounded shadow-sm flex flex-col">
                <div className="flex items-center mb-2">
                  <img src={img.thumbnailUrl || img.url} alt={img.description} className="w-20 h-20 object-cover rounded mr-4 border" />
                  <div className="flex-1">
                    <div className="font-semibold text-indigo-700">{getImageTypeLabel(img.type)}</div>
                    <div className="text-xs text-gray-500">{new Date(img.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{img.description}</div>
                  </div>
                </div>
                <div className="flex-1 text-xs text-gray-500 mb-2">{img.notes}</div>
                <div className="flex space-x-2 mt-2">
                  <Button size="sm" variant="secondary" onClick={() => handleViewImage(img)}><FaEye className="mr-1" /> View</Button>
                  {!readOnly && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setSelectedImage(img) || setShowUploadForm(true)}><FaEdit className="mr-1" /> Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteImage(img._id)}><FaTrash className="mr-1" /> Delete</Button>
                    </>
                  )}
                  <a href={img.url} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"><FaDownload className="mr-1" /> Download</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No dental images found</div>
        )}
      </div>
      {/* Upload Form and Image Viewer logic remains unchanged */}
      {showUploadForm && (
        <UploadForm 
          onUpload={handleImageUpload}
          onCancel={() => setShowUploadForm(false)}
          existingImage={selectedImage}
          onUpdate={(updatedData) => {
            if (selectedImage) {
              handleUpdateImage(selectedImage._id, updatedData);
              setSelectedImage(null);
              setShowUploadForm(false);
            }
          }}
        />
      )}
      
      {/* Image Viewer */}
      {showImageViewer && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedImage.description}</h3>
              <button 
                onClick={() => setShowImageViewer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.description}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            </div>
            
            <div className="p-4 border-t">
              <div className="mb-2">
                <span className="font-medium">Type:</span> {getImageTypeLabel(selectedImage.type)}
              </div>
              <div className="mb-2">
                <span className="font-medium">Date:</span> {new Date(selectedImage.date).toLocaleDateString()}
              </div>
              {selectedImage.notes && (
                <div>
                  <span className="font-medium">Notes:</span> {selectedImage.notes}
                </div>
              )}
              
              <div className="flex justify-end mt-4 space-x-2">
                <a 
                  href={selectedImage.url} 
                  download={`dental-image-${selectedImage._id}.jpg`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaDownload className="mr-2" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Upload Form Component
const UploadForm = ({ onUpload, onCancel, existingImage, onUpdate }) => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState(existingImage ? existingImage.type : 'panoramic');
  const [description, setDescription] = useState(existingImage ? existingImage.description : '');
  const [notes, setNotes] = useState(existingImage ? existingImage.notes : '');
  const [previewUrl, setPreviewUrl] = useState(existingImage ? existingImage.url : null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (existingImage && onUpdate) {
      onUpdate({
        type,
        description,
        notes
      });
    } else {
      if (!file) {
        toast.error('Please select a file to upload');
        return;
      }
      
      onUpload({
        file,
        type,
        description,
        notes
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {existingImage ? 'Edit Image Details' : 'Upload Dental Image'}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {!existingImage && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
              <div 
                className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <div className="mb-2">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-40 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-gray-500 mb-2">
                    <FaUpload className="text-3xl mx-auto mb-2" />
                    <p>Click to select an image or drag and drop</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300"
                >
                  Browse Files
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
            <select
              className="w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              {IMAGE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Brief description of the image"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border rounded p-2"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this image"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {existingImage ? 'Update' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedDentalImaging;
