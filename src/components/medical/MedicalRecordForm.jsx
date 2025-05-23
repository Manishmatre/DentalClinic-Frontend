import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// Zod schema for validation
const medicalRecordSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  symptoms: z.string().min(1, 'Symptoms are required'),
  treatment: z.string().min(1, 'Treatment is required'),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

const MedicalRecordForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  error = null,
  patientId,
  appointmentId = null
}) => {
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: initialData || {
      diagnosis: '',
      symptoms: '',
      treatment: '',
      notes: '',
      followUpDate: '',
      attachments: []
    }
  });

  const handleFormSubmit = async (data) => {
    // Add patient and appointment context to the medical record data
    const medicalRecordData = {
      ...data,
      patientId,
      appointmentId,
      attachments: files
    };
    onSubmit(medicalRecordData);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <Alert variant="error" title="Error" message={error} />}

      {/* Diagnosis */}
      <Input
        id="diagnosis"
        label="Diagnosis"
        type="text"
        {...register('diagnosis')}
        error={errors.diagnosis?.message}
        required
      />

      {/* Symptoms */}
      <div>
        <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
        <textarea
          id="symptoms"
          {...register('symptoms')}
          rows={3}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.symptoms ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />
        {errors.symptoms && <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>}
      </div>

      {/* Treatment */}
      <div>
        <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
        <textarea
          id="treatment"
          {...register('treatment')}
          rows={3}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.treatment ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />
        {errors.treatment && <p className="mt-1 text-sm text-red-600">{errors.treatment.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.notes ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* Follow-up Date */}
      <Input
        id="followUpDate"
        label="Follow-up Date"
        type="date"
        {...register('followUpDate')}
        error={errors.followUpDate?.message}
      />

      {/* Attachments */}
      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
        <input
          id="attachments"
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Selected files:</p>
            <ul className="list-disc pl-5 text-sm text-gray-500">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update Record' : 'Save Record'}
        </Button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
