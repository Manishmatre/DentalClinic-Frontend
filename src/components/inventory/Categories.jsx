import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';

const initialCategories = [
  { id: 1, name: 'Consumables', description: 'Single-use items' },
  { id: 2, name: 'Equipment', description: 'Reusable equipment' },
  { id: 3, name: 'Medicines', description: 'Pharmaceuticals' },
];

const Categories = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const openAdd = () => {
    setEditCategory(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };
  const openEdit = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editCategory) {
      setCategories(categories.map(c => c.id === editCategory.id ? { ...c, ...form } : c));
    } else {
      setCategories([...categories, { id: Date.now(), ...form }]);
    }
    closeModal();
  };
  const handleDelete = (id) => setCategories(categories.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button variant="primary" onClick={openAdd}><FaPlus className="mr-2" />Add Category</Button>
      </div>
      <Card>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(cat => (
              <tr key={cat.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cat.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button size="sm" variant="secondary" className="mr-2" onClick={() => openEdit(cat)}><FaEdit /></Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(cat.id)}><FaTrash /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editCategory ? 'Edit' : 'Add'} Category</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary">{editCategory ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 