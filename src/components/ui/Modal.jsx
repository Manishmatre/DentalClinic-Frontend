import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, size = 'md', fullScreen = false }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle body scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle mounting for portal
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(() => setVisible(true), 10); // allow for fade-in
    } else if (mounted) {
      setVisible(false);
      // Wait for fade-out before unmounting
      const timeout = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, mounted]);

  // Handle escape key press
  useEffect(() => {
    if (!mounted) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, mounted]);

  // Size classes for the modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full w-full h-full m-0 rounded-none'
  };

  if (!mounted) return null;

  // Create the modal content
  const modalContent = (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden backdrop-blur-[6px] bg-black/70 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${fullScreen ? sizeClasses.full : sizeClasses[size]} w-full ${!fullScreen ? 'mx-4' : ''} bg-white ${!fullScreen ? 'rounded-lg' : ''} shadow-xl overflow-hidden z-[10000]`}
        onClick={(e) => e.stopPropagation()}
        style={fullScreen ? { height: '100vh', width: '100vw', borderRadius: 0 } : {}}
      >
        {/* Close button */}
        <button
          className={`absolute ${fullScreen ? 'top-6 right-6 z-50' : 'top-4 right-4'} text-gray-500 hover:text-gray-700`}
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Title */}
        {title && (
          <div className={`px-6 py-4 border-b border-gray-200 ${fullScreen ? 'sticky top-0 bg-white z-10' : ''}`}>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
        )}
        {/* Content */}
        <div className={`${fullScreen ? 'p-6 overflow-y-auto' : 'p-6'}`} style={fullScreen ? { maxHeight: 'calc(100vh - 60px)' } : {}}>
          {children}
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
};

export default Modal;