import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
];

const ChairFormModal = ({ isOpen, onClose, initialData = null, onSubmit, loading = false }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || { name: '', status: 'available', location: '' },
  });

  React.useEffect(() => {
    reset(initialData || { name: '', status: 'available', location: '' });
  }, [initialData, isOpen, reset]);

  const submitHandler = async (data) => {
    if (!data.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (onSubmit) await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Chair' : 'Add Chair'} size="sm">
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
          name="status"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...field}
                className="w-full border px-3 py-2 rounded"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        />
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Input
              label="Location"
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

export default ChairFormModal; 