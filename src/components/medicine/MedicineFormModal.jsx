import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

const MedicineFormModal = ({ isOpen, onClose, initialData = null, onSubmit, loading = false }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      name: '',
      category: '',
      description: '',
      defaultDosage: '',
      defaultFrequency: '',
      defaultDuration: '',
      isActive: true,
    },
  });

  React.useEffect(() => {
    reset(initialData || {
      name: '',
      category: '',
      description: '',
      defaultDosage: '',
      defaultFrequency: '',
      defaultDuration: '',
      isActive: true,
    });
  }, [initialData, isOpen, reset]);

  const submitHandler = async (data) => {
    if (!data.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (onSubmit) await onSubmit(data);
  };

  const frequencyOptions = [
    '0-0-1',
    '0-1-0',
    '0-1-1',
    '1-0-1',
    '1-1-0',
    '1-1-1',
    'Other',
  ];
  const categoryOptions = [
    'Antibiotic',
    'Painkiller',
    'Antiseptic',
    'Mouthwash',
    'Topical',
    'Other',
  ];
  const dosageOptions = [
    '250mg',
    '500mg',
    '1g',
    '5ml',
    '10ml',
    'Other',
  ];
  const durationOptions = [
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    'Ongoing',
    'Other',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Medicine' : 'Add Medicine'} size="sm">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <Input
              label="Name"
              required
              error={errors.name?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...field}
                value={categoryOptions.includes(field.value) ? field.value : 'Other'}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Other') field.onChange('');
                  else field.onChange(val);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {field.value && !categoryOptions.includes(field.value) && (
                <input
                  type="text"
                  className="mt-2 w-full border px-3 py-2 rounded"
                  placeholder="Enter custom category"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                />
              )}
            </div>
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              label="Description"
              {...field}
            />
          )}
        />
        <Controller
          name="defaultDosage"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Dosage</label>
              <select
                {...field}
                value={dosageOptions.includes(field.value) ? field.value : 'Other'}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Other') field.onChange('');
                  else field.onChange(val);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                {dosageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {field.value && !dosageOptions.includes(field.value) && (
                <input
                  type="text"
                  className="mt-2 w-full border px-3 py-2 rounded"
                  placeholder="Enter custom dosage"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                />
              )}
            </div>
          )}
        />
        <Controller
          name="defaultFrequency"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Frequency</label>
              <select
                {...field}
                value={frequencyOptions.includes(field.value) ? field.value : 'Other'}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Other') field.onChange('');
                  else field.onChange(val);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                {frequencyOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {field.value && !frequencyOptions.includes(field.value) && (
                <input
                  type="text"
                  className="mt-2 w-full border px-3 py-2 rounded"
                  placeholder="Enter custom frequency"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                />
              )}
            </div>
          )}
        />
        <Controller
          name="defaultDuration"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Duration</label>
              <select
                {...field}
                value={durationOptions.includes(field.value) ? field.value : 'Other'}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Other') field.onChange('');
                  else field.onChange(val);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                {durationOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {field.value && !durationOptions.includes(field.value) && (
                <input
                  type="text"
                  className="mt-2 w-full border px-3 py-2 rounded"
                  placeholder="Enter custom duration"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                />
              )}
            </div>
          )}
        />
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={field.value}
                onChange={e => field.onChange(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
          )}
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading || isSubmitting}>Cancel</Button>
          <Button type="submit" loading={loading || isSubmitting} disabled={loading || isSubmitting}>
            {initialData ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MedicineFormModal; 