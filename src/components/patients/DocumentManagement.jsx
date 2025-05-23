import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

const DocumentManagement = ({ patientId }) => {
  const [refreshList, setRefreshList] = useState(false);

  const handleUploadComplete = () => {
    setRefreshList(prev => !prev);
  };

  const handleDocumentDelete = () => {
    setRefreshList(prev => !prev);
  };

  return (
    <div className="space-y-6">
      <DocumentUpload 
        patientId={patientId}
        onUploadComplete={handleUploadComplete}
      />
      <DocumentList 
        patientId={patientId}
        onDocumentDelete={handleDocumentDelete}
        key={refreshList} // Force re-render on refresh
      />
    </div>
  );
};

export default DocumentManagement;