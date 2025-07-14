import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../config';
import { getAuthHeaders } from '../../utils/authUtils';

// Create axios instance for uploads
const client = axios.create({
  baseURL: API_URL
  // Do NOT set 'Content-Type' here! Let axios/browser handle it for FormData.
});

// Add request interceptor to include auth headers
client.interceptors.request.use(
  (config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
      ...config.headers,
      ...authHeaders
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Default cloud name from environment or hardcoded for development
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'deekt4ncx';
const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

// Helper function for handling API errors
const handleError = (error, customMessage) => {
  const message = error.response?.data?.message || customMessage || 'An error occurred';
  toast.error(message);
  if (import.meta.env.DEV) {
    console.error(customMessage, error);
  }
  return { error: message };
};

const uploadService = {
  // Upload a profile image specifically for staff profiles
  async uploadProfileImage(formData, onProgress = null) {
    try {
      // Configuration for tracking upload progress
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percentCompleted);
        }
      };

      // Log the form data contents for debugging
      console.log('Uploading profile image with form data:', {
        file: formData.get('file'),
        metadata: formData.get('metadata')
      });

      const response = await client.post('/upload/profile', formData, config);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload profile image');
    }
  },
  
      // Upload a single file
      async uploadFile(formData, type = 'image', onProgress = null, metadata = {}) {
        try {
          // Add metadata if provided
          if (Object.keys(metadata).length > 0) {
            formData.append('metadata', JSON.stringify(metadata));
          }

          // Configuration for tracking upload progress
          const config = {
            headers: {
              // Remove Content-Type to let axios set it correctly for multipart/form-data
              // 'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress?.(percentCompleted);
            }
          };

          const endpoint = type === 'profile' ? '/profile-picture' : `/upload/${type}`;
          const response = await client.post(endpoint, formData, config);
          
          // Check for errors in response
          if (response.data?.error) {
            throw new Error(response.data.error);
          }
          
          return response.data;
        } catch (error) {
          console.error('Upload error:', {
            error: error,
            response: error.response?.data,
            message: error.message
          });
          
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
          
          throw new Error('Failed to upload file: ' + error.message);
        }
      },

  // Upload multiple files
  async uploadMultipleFiles(files, type = 'images', onProgress = null, metadata = {}) {
    try {
      // Create form data with multiple files
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Configuration for tracking upload progress
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percentCompleted);
        }
      };

      // Add metadata if provided
      if (metadata) {
        // Convert metadata object to JSON string and append
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Make API call
      const response = await client.post(`/upload/${type}`, formData, config);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to upload files');
    }
  },

  // Upload data URL (e.g., canvas image, cropped image)
  async uploadDataUrl(dataUrl, folder = 'general', fileName = null, metadata = {}) {
    try {
      const data = {
        dataUrl,
        folder,
        fileName,
        metadata
      };

      const response = await client.post('/upload/data', data);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to upload image data');
    }
  },

  // Delete a file
  async deleteFile(publicId, resourceType = 'image') {
    try {
      if (!publicId) {
        return { success: false, message: 'No public ID provided' };
      }
      
      const response = await client.delete(`/upload/${publicId}?resourceType=${resourceType}`);
      toast.success('File deleted successfully');
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to delete file');
    }
  },

  // Get upload signature for direct browser uploads
  async getUploadSignature(folder = 'general', metadata = {}) {
    try {
      // Convert metadata to query string
      const metadataQuery = metadata ? `&metadata=${encodeURIComponent(JSON.stringify(metadata))}` : '';
      
      const response = await client.get(`/upload/signature?folder=${folder}${metadataQuery}`);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to get upload signature');
    }
  },

  // Upload a profile picture
  async uploadProfilePicture(file, onProgress = null) {
    try {
      // Make sure we have a valid file
      if (!file) {
        throw new Error('No file provided');
      }
      
      // Defensive: check file type
      if (!(file instanceof File || file instanceof Blob)) {
        throw new Error('Provided file is not a valid File or Blob object');
      }
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Log the file details
      console.log('File to be uploaded:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });
      
      // Configuration for tracking upload progress
      const config = {
        headers: {
          // Remove Content-Type to let axios set it correctly for multipart/form-data
          // 'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          onProgress(percentCompleted);
        } : null
      };

      console.log('Sending request to /upload/profile-picture');
      
      // Log the form data entries
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }
      
      const response = await client.post('/upload/profile-picture', formData, config);
      
      console.log('Upload response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Check for errors in response
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      if (response.data && typeof response.data === 'object') {
        // Extract the file data from the response
        const fileData = response.data.file || response.data;
        
        // Return the file data in the expected format
        return {
          url: fileData.url || fileData.secure_url,
          public_id: fileData.public_id,
          ...fileData
        };
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Profile picture upload error:', {
        error: error,
        response: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to upload profile picture: ' + error.message);
    }
  },

  // Upload a medical record
  async uploadMedicalRecord(file, onProgress = null, metadata = {}) {
    return this.uploadFile(file, 'medical-record', onProgress, { ...metadata, folder: 'medical_records' });
  },

  // Upload a document
  async uploadDocument(file, onProgress = null, metadata = {}) {
    return this.uploadFile(file, 'document', onProgress, { ...metadata, folder: 'documents' });
  },
  
  // Upload a bill or invoice attachment
  async uploadBillAttachment(file, onProgress = null, metadata = {}) {
    return this.uploadFile(file, 'bill', onProgress, { ...metadata, folder: 'billing' });
  },
  
  // Upload a lab result
  async uploadLabResult(file, onProgress = null, metadata = {}) {
    return this.uploadFile(file, 'lab-result', onProgress, { ...metadata, folder: 'lab_results' });
  },
  
  // Upload a prescription
  async uploadPrescription(file, onProgress = null, metadata = {}) {
    return this.uploadFile(file, 'prescription', onProgress, { ...metadata, folder: 'prescriptions' });
  },

  // Get file URL from public ID
  getFileUrl(publicId, transformations = '', resourceType = 'image') {
    if (!publicId) return '';
    
    // If it's already a full URL, return it
    if (publicId.startsWith('http')) {
      return publicId;
    }
    
    // Set default delivery type based on resource type
    let deliveryType = 'upload';
    
    // Determine if we need to use a different delivery path based on file type
    if (publicId.endsWith('.pdf')) {
      resourceType = 'image';
      deliveryType = 'pdf';
    } else if (resourceType === 'raw' || 
               publicId.match(/\.(doc|docx|xls|xlsx|txt|csv|rtf|odt)$/i)) {
      resourceType = 'raw';
      deliveryType = 'upload';
    } else if (resourceType === 'video' || 
               publicId.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i)) {
      resourceType = 'video';
    }
    
    return `${CLOUDINARY_URL}/${resourceType}/${deliveryType}${transformations ? '/' + transformations : ''}/${publicId}`;
  },
  
  // Get optimized image URL with transformations
  getOptimizedImageUrl(publicId, width = 400, height = 400, crop = 'fill') {
    if (!publicId) return '';
    
    // For PDF files, generate a thumbnail of the first page
    if (publicId.endsWith('.pdf')) {
      return this.getFileUrl(publicId, `pg_1,c_${crop},w_${width},h_${height},q_auto,f_auto`);
    }
    
    // For other files, use standard optimization
    return this.getFileUrl(publicId, `c_${crop},w_${width},h_${height},q_auto,f_auto`);
  },
  
  // Get thumbnail URL
  getThumbnailUrl(publicId, size = 100) {
    if (!publicId) return '';
    
    // For PDF files
    if (publicId.endsWith('.pdf')) {
      return this.getFileUrl(publicId, `pg_1,c_thumb,w_${size},h_${size}`);
    }
    
    // For documents, try to generate a thumbnail if possible
    if (publicId.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i)) {
      return '/assets/document-thumbnail.png'; // Fallback to a static document icon
    }
    
    // For images, use face detection if possible
    return this.getFileUrl(publicId, `c_thumb,w_${size},h_${size},g_face`);
  },
  
  // Get file type icon based on file extension
  getFileTypeIcon(filename) {
    if (!filename) return 'file';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    // Map extensions to icon types
    const iconMap = {
      // Images
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'svg': 'image',
      'webp': 'image',
      
      // Documents
      'pdf': 'pdf',
      'doc': 'word',
      'docx': 'word',
      'xls': 'excel',
      'xlsx': 'excel',
      'ppt': 'powerpoint',
      'pptx': 'powerpoint',
      'txt': 'text',
      'rtf': 'text',
      'odt': 'text',
      
      // Medical
      'dcm': 'dicom',
      'dicom': 'dicom',
      
      // Archives
      'zip': 'archive',
      'rar': 'archive',
      '7z': 'archive',
      'tar': 'archive',
      'gz': 'archive',
      
      // Audio/Video
      'mp4': 'video',
      'mov': 'video',
      'avi': 'video',
      'mp3': 'audio',
      'wav': 'audio',
      'ogg': 'audio'
    };
    
    return iconMap[extension] || 'file';
  },
  
  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default uploadService;
