import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const categoryOptions = [
  { value: 'General', label: 'General' },
  { value: 'Surgery', label: 'Surgery' },
  { value: 'Cosmetic', label: 'Cosmetic' },
  { value: 'Restorative', label: 'Restorative' },
  { value: 'Other', label: 'Other' },
];

const TreatmentFormModal = ({ isOpen, onClose, initialData = null, onSubmit, loading = false }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || { name: '', description: '', category: '', duration: '', price: '' },
  });

  React.useEffect(() => {
    reset(initialData || { name: '', description: '', category: '', duration: '', price: '' });
  }, [initialData, isOpen, reset]);

  const submitHandler = async (data) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Treatment' : 'Add Treatment'} size="sm">
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
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Description"
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
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select category</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        />
        <Controller
          name="duration"
          control={control}
          render={({ field }) => (
            <Input
              label="Duration (minutes)"
              type="number"
              {...field}
            />
          )}
        />
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              label="Price (₹)"
              type="number"
              {...field}
            />
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

export default TreatmentFormModal; 