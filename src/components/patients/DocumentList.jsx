import React, { useState, useEffect } from 'react';
import { documentService } from '../../api/documents/documentService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';

const DocumentList = ({ patientId, onDocumentDelete }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const categories = documentService.getDocumentCategories();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const response = await documentService.getDocuments(patientId, params);
      setDocuments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId, selectedCategory, searchTerm]);

  const handleDownload = async (documentId) => {
    try {
      const response = await documentService.getDocument(documentId);
      window.open(response.data.downloadUrl, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      setDocuments(docs => docs.filter(doc => doc._id !== documentId));
      if (onDocumentDelete) {
        onDocumentDelete(documentId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const getCategoryLabel = (value) => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Patient Documents</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        {documents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No documents found
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900">{doc.name}</h4>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      <p>Category: {getCategoryLabel(doc.category)}</p>
                      <p>Uploaded by: {doc.uploadedBy?.name || 'Unknown'}</p>
                      <p>Date: {new Date(doc.createdAt).toLocaleDateString()}</p>
                      {doc.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload(doc._id)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(doc._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentList;