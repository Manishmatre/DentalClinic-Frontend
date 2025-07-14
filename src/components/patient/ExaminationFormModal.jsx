import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import staffService from '../../api/staff/staffService';
import { medicalServicesData, getFlattenedServices } from '../../data/medicalServices';

const DIAGNOSIS_OPTIONS = [
  'Hypertension',
  'Diabetes Mellitus',
  'Acute Respiratory Infection',
  'Gastritis',
  'Migraine',
  'Dental Caries',
  'Periodontitis',
  'Anemia',
  'Asthma',
  'Other'
];

const chiefComplaintOptions = getFlattenedServices();

const ExaminationFormModal = ({ isOpen, onClose, initialData = null, onSubmit, loading = false }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      doctor: '',
      chiefComplaint: '',
      diagnosis: '',
      notes: ''
    },
  });

  const [doctors, setDoctors] = React.useState([]);
  const [doctorsLoading, setDoctorsLoading] = React.useState(false);

  React.useEffect(() => {
    reset(initialData || {
      doctor: '',
      chiefComplaint: '',
      diagnosis: '',
      notes: ''
    });
  }, [initialData, isOpen, reset]);

  React.useEffect(() => {
    if (isOpen) {
      setDoctorsLoading(true);
      staffService.getStaff({ role: 'Doctor', status: 'Active', limit: 100 }).then(res => {
        setDoctors(res.data || []);
        setDoctorsLoading(false);
      });
    }
  }, [isOpen]);

  const submitHandler = async (data) => {
    if (!data.doctor || !data.chiefComplaint.trim()) {
      return;
    }
    if (onSubmit) await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Examination' : 'Add Examination'} size="md">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <Controller
          name="doctor"
          control={control}
          rules={{ required: 'Doctor is required' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor (Examined By) <span className="text-red-500">*</span></label>
              <select
                {...field}
                className="w-full border px-3 py-2 rounded"
                disabled={doctorsLoading}
              >
                <option value="">{doctorsLoading ? 'Loading doctors...' : 'Select Doctor'}</option>
                {doctors.map(doc => (
                  <option key={doc._id || doc.id || doc.name} value={doc.name}>{doc.name}</option>
                ))}
              </select>
              {errors.doctor && <div className="text-red-500 text-xs mt-1">{errors.doctor.message}</div>}
            </div>
          )}
        />
        <Controller
          name="chiefComplaint"
          control={control}
          rules={{ required: 'Chief Complaint is required' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint <span className="text-red-500">*</span></label>
              <select {...field} className="w-full border px-3 py-2 rounded">
                <option value="">Select Chief Complaint</option>
                {chiefComplaintOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.chiefComplaint && <div className="text-red-500 text-xs mt-1">{errors.chiefComplaint.message}</div>}
            </div>
          )}
        />
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input label="Notes" textarea {...field} />
          )}
        />
        <Controller
          name="diagnosis"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <select {...field} className="w-full border px-3 py-2 rounded">
                <option value="">Select Diagnosis</option>
                {DIAGNOSIS_OPTIONS.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
        />
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <></>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller name="vitals.temperature" control={control} render={({ field }) => <></>} />
          <Controller name="vitals.pulse" control={control} render={({ field }) => <></>} />
          <Controller name="vitals.bloodPressure" control={control} render={({ field }) => <></>} />
          <Controller name="vitals.weight" control={control} render={({ field }) => <></>} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="submit" variant="primary" loading={loading || isSubmitting}>{initialData ? 'Update' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExaminationFormModal; 