import React, { useState } from 'react';
import { validateMedicalRecord } from '../../utils/validation';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const MedicalHistoryForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    condition: initialData.condition || '',
    diagnosis: initialData.diagnosis || '',
    treatment: initialData.treatment || '',
    notes: initialData.notes || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    medications: initialData.medications || []
  });
  const [medication, setMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddMedication = () => {
    if (!medication.name || !medication.dosage || !medication.frequency) {
      setError('Please fill in all medication fields');
      return;
    }
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, medication]
    }));
    setMedication({ name: '', dosage: '', frequency: '' });
    setError(null);
  };

  const handleRemoveMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateMedicalRecord(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Condition *
            </label>
            <input
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.condition && (
              <p className="mt-2 text-sm text-red-600">{errors.condition}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Diagnosis *
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.diagnosis && (
              <p className="mt-2 text-sm text-red-600">{errors.diagnosis}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Treatment *
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.treatment && (
              <p className="mt-2 text-sm text-red-600">{errors.treatment}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Medications Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Medications</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Medication Name"
                value={medication.name}
                onChange={(e) => setMedication(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Dosage"
                value={medication.dosage}
                onChange={(e) => setMedication(prev => ({ ...prev, dosage: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Frequency"
                value={medication.frequency}
                onChange={(e) => setMedication(prev => ({ ...prev, frequency: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Button type="button" onClick={handleAddMedication}>
                Add
              </Button>
            </div>
          </div>

          {/* Medications List */}
          {formData.medications.length > 0 && (
            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.medications.map((med, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{med.dosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{med.frequency}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveMedication(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit">
            Save Medical Record
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MedicalHistoryForm;