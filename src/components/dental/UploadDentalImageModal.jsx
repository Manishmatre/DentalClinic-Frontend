import React, { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

const IMAGE_TYPES = [
  { value: 'panoramic', label: 'Panoramic X-Ray' },
  { value: 'periapical', label: 'Periapical X-Ray' },
  { value: 'bitewing', label: 'Bitewing X-Ray' },
  { value: 'cbct', label: 'CBCT Scan' },
  { value: 'intraoral', label: 'Intraoral Photo' },
  { value: 'extraoral', label: 'Extraoral Photo' }
];

const UploadDentalImageModal = ({ isOpen, onClose, initialData = null, onSubmit, loading = false, patientId }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [toothInput, setToothInput] = useState('');
  // Normalize initialData.toothNumbers for edit mode
  let initialTeeth = initialData?.toothNumbers;
  if (typeof initialTeeth === 'string') {
    try {
      initialTeeth = JSON.parse(initialTeeth);
    } catch {
      initialTeeth = [];
    }
  }
  if (!Array.isArray(initialTeeth)) initialTeeth = [];
  // DEMO: Remove this fallback in production
  // if (!initialTeeth.length) initialTeeth = [11, 12, 13];
  const [toothNumbers, setToothNumbers] = useState(initialTeeth);

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      image: null,
      type: '',
      description: '',
      notes: '',
      toothNumbers: [],
    },
  });

  useEffect(() => {
    // Normalize again on modal open
    let teeth = initialData?.toothNumbers;
    if (typeof teeth === 'string') {
      try {
        teeth = JSON.parse(teeth);
      } catch {
        teeth = [];
      }
    }
    if (!Array.isArray(teeth)) teeth = [];
    // DEMO: Remove this fallback in production
    // if (!teeth.length) teeth = [11, 12, 13];
    reset(initialData || {
      image: null,
      type: '',
      description: '',
      notes: '',
      toothNumbers: [],
    });
    setToothNumbers(teeth);
    setPreview(null);
  }, [initialData, isOpen, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setValue('image', file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddTooth = () => {
    const tooth = parseInt(toothInput);
    if (isNaN(tooth) || tooth < 1 || tooth > 32) {
      toast.error('Please enter a valid tooth number (1-32)');
      return;
    }
    if (toothNumbers.includes(tooth)) {
      toast.error('This tooth number is already added');
      return;
    }
    const updated = [...toothNumbers, tooth];
    setToothNumbers(updated);
    setValue('toothNumbers', updated);
    setToothInput('');
  };

  const handleRemoveTooth = (tooth) => {
    const updated = toothNumbers.filter(t => t !== tooth);
    setToothNumbers(updated);
    setValue('toothNumbers', updated);
  };

  const submitHandler = async (data) => {
    if (!data.image) {
      toast.error('Image file is required');
      return;
    }
    if (!data.type) {
      toast.error('Image type is required');
      return;
    }
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('type', data.type);
    formData.append('description', data.description || '');
    formData.append('notes', data.notes || '');
    formData.append('toothNumbers', JSON.stringify(toothNumbers));
    formData.append('patientId', patientId);
    if (onSubmit) await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Dental Image' : 'Upload Dental Image'} size="md">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        {/* Image File */}
        <Controller
          name="image"
          control={control}
          rules={{ required: 'Image file is required' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image File *</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto mb-2" />
                ) : (
                  <div className="text-gray-500">
                    <span className="block mb-2">Click to select an image</span>
                    <span className="text-xs">Supported: JPEG, PNG, DICOM</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,.dcm"
                  onChange={handleFileChange}
                />
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            </div>
          )}
        />
        {/* Image Type */}
        <Controller
          name="type"
          control={control}
          rules={{ required: 'Image type is required' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Type *</label>
              <select
                {...field}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Image Type</option>
                {IMAGE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>
          )}
        />
        {/* Description */}
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
        {/* Teeth Involved */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teeth Involved</label>
          <div className="flex">
            <input
              type="number"
              min="1"
              max="32"
              className="w-full p-2 border rounded-l"
              value={toothInput}
              onChange={e => setToothInput(e.target.value)}
              placeholder="Enter tooth number (1-32)"
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded-r"
              onClick={handleAddTooth}
            >
              Add
            </button>
          </div>
          {toothNumbers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {toothNumbers.sort((a, b) => a - b).map(tooth => (
                <span
                  key={tooth}
                  className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center cursor-pointer"
                  onClick={() => handleRemoveTooth(tooth)}
                >
                  Tooth #{tooth}
                  <span className="ml-1 text-red-500">&times;</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Notes */}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input
              label="Clinical Notes"
              {...field}
            />
          )}
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading || isSubmitting}>Cancel</Button>
          <Button type="submit" loading={loading || isSubmitting} disabled={loading || isSubmitting}>
            {initialData ? 'Update' : 'Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadDentalImageModal; 