import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaDownload, FaTrash, FaSearch, FaPlus, FaCalendarAlt, FaImage, FaEye, FaEdit, FaTimes } from 'react-icons/fa';
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
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <FaImage className="mr-2 text-blue-500" /> Dental Imaging
        </h2>
      </div>
      
      <div className="p-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <select
            className="border rounded px-3 py-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {IMAGE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            className="border rounded px-3 py-2"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          
          {!readOnly && (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              onClick={() => setShowUploadForm(true)}
            >
              <FaUpload className="mr-2" /> Upload
            </button>
          )}
        </div>
        
        {/* Image Gallery */}
        {sortedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedImages.map(image => (
              <div key={image._id} className="border rounded-lg overflow-hidden">
                <div 
                  className="h-40 bg-gray-100 cursor-pointer relative"
                  onClick={() => handleViewImage(image)}
                >
                  <img 
                    src={image.thumbnailUrl || image.url} 
                    alt={image.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {getImageTypeLabel(image.type)}
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm line-clamp-1" title={image.description}>
                      {image.description}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <FaCalendarAlt className="mr-1" />
                    {new Date(image.date).toLocaleDateString()}
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleViewImage(image)}
                    >
                      <FaEye />
                    </button>
                    
                    {!readOnly && (
                      <div className="flex space-x-2">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowUploadForm(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteImage(image._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaImage className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No dental images found</p>
            {!readOnly && (
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
                onClick={() => setShowUploadForm(true)}
              >
                <FaUpload className="mr-2" /> Upload First Image
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Image Upload Form */}
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
    </div>
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
