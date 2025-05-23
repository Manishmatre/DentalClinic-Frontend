import client from '../axios';
import { toast } from 'react-toastify';

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
  // Upload a single file
  async uploadFile(file, type = 'image', onProgress = null, metadata = {}) {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata if provided
      if (metadata) {
        // Convert metadata object to JSON string and append
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Add folder based on type if not specified in metadata
      if (!metadata.folder) {
        let folder = 'general';
        switch (type) {
          case 'medical-record':
            folder = 'medical_records';
            break;
          case 'bill':
            folder = 'billing';
            break;
          case 'profile-picture':
            folder = 'profiles';
            break;
          case 'document':
            folder = 'documents';
            break;
          // Add more cases as needed
        }
        formData.append('folder', folder);
      }

      // Configuration for tracking upload progress
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Add progress tracking if provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        };
      }

      // Make API call
      const response = await client.post(`/api/upload/${type}`, formData, config);
      return response.data;
    } catch (error) {
      return handleError(error, `Failed to upload ${type} file`);
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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Add progress tracking if provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        };
      }
      
      // Add metadata if provided
      if (metadata) {
        // Convert metadata object to JSON string and append
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Make API call
      const response = await client.post(`/api/upload/${type}`, formData, config);
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

      const response = await client.post('/api/upload/data', data);
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
      
      const response = await client.delete(`/api/upload/${publicId}?resourceType=${resourceType}`);
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
      
      const response = await client.get(`/api/upload/signature?folder=${folder}${metadataQuery}`);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to get upload signature');
    }
  },

  // Upload a profile picture
  async uploadProfilePicture(file, onProgress = null) {
    return this.uploadFile(file, 'profile-picture', onProgress, { folder: 'profiles' });
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
