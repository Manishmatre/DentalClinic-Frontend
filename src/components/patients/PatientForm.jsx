import React from 'react';
import { useForm } from '../../hooks/useForm';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const PatientForm = ({ 
  onSubmit, 
  initialData = null, 
  isLoading = false,
  error = null 
}) => {
  const { formData, handleChange, handleSubmit, errors } = useForm({
    initialData: initialData || {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      bloodGroup: '',
      allergies: '',
      medicalConditions: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    onSubmit: (data) => {
      onSubmit(data);
    },
    validate: (data) => {
      const errors = {};
      
      if (!data.name) errors.name = 'Name is required';
      if (!data.email) errors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email is invalid';
      if (!data.phone) errors.phone = 'Phone number is required';
      if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!data.gender) errors.gender = 'Gender is required';
      
      // Emergency contact validation
      if (data.emergencyContact) {
        if (!data.emergencyContact.name) {
          errors['emergencyContact.name'] = 'Emergency contact name is required';
        }
        if (!data.emergencyContact.phone) {
          errors['emergencyContact.phone'] = 'Emergency contact phone is required';
        }
        if (!data.emergencyContact.relationship) {
          errors['emergencyContact.relationship'] = 'Relationship is required';
        }
      }

      return errors;
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error" title="Error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              errors.gender ? 'border-red-500' : ''
            }`}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        <Input
          label="Blood Group"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          error={errors.bloodGroup}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
            errors.address ? 'border-red-500' : ''
          }`}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
        <textarea
          name="medicalConditions"
          value={formData.medicalConditions}
          onChange={handleChange}
          rows={3}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Allergies</label>
        <textarea
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          rows={2}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Contact Name"
            name="emergencyContact.name"
            value={formData.emergencyContact.name}
            onChange={handleChange}
            error={errors['emergencyContact.name']}
            required
          />

          <Input
            label="Contact Phone"
            name="emergencyContact.phone"
            value={formData.emergencyContact.phone}
            onChange={handleChange}
            error={errors['emergencyContact.phone']}
            required
          />

          <Input
            label="Relationship"
            name="emergencyContact.relationship"
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
            error={errors['emergencyContact.relationship']}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {initialData ? 'Update Patient' : 'Create Patient'}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;