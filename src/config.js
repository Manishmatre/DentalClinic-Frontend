// src/config.js

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Other global configuration variables can be added here
export const APP_NAME = 'Clinic Management System';
export const DEFAULT_PAGINATION_LIMIT = 10;

// Image upload configuration
export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];