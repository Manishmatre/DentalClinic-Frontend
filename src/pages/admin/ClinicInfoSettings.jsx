import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import clinicService from '../../api/clinic/clinicService';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Schema for clinic info validation
const clinicSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipcode: z.string().min(1, 'ZIP code is required'),
  contact: z.string().min(1, 'Contact number is required').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  clinicContact: z.string().min(1, 'Clinic contact is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  email: z.string().email('Invalid email address'),
  about: z.string().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  taxId: z.string().min(1, 'Tax ID is required'),
  logo: z.any().optional(),
  socialLinks: z.object({
    facebook: z.string().url('Invalid Facebook URL').or(z.literal('')).optional(),
    twitter: z.string().url('Invalid Twitter URL').or(z.literal('')).optional(),
    instagram: z.string().url('Invalid Instagram URL').or(z.literal('')).optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
  }).optional(),
  operatingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string(),
  })).optional(),
  specialties: z.array(z.string()).optional(),
});

const ClinicInfoSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [clinicId, setClinicId] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      contact: '',
      clinicContact: '',
      doctorName: '',
      email: '',
      about: '',
      website: '',
      taxId: '',
      logo: null,
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
      },
      operatingHours: [
        { day: 'Monday', open: '09:00', close: '17:00' },
        { day: 'Tuesday', open: '09:00', close: '17:00' },
        { day: 'Wednesday', open: '09:00', close: '17:00' },
        { day: 'Thursday', open: '09:00', close: '17:00' },
        { day: 'Friday', open: '09:00', close: '17:00' },
        { day: 'Saturday', open: '09:00', close: '17:00' },
        { day: 'Sunday', open: '09:00', close: '17:00' },
      ],
      specialties: [],
    },
  });

  const getClinicIdFromStorage = () => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        if (parsed.clinicId) return typeof parsed.clinicId === 'object' ? parsed.clinicId._id || parsed.clinicId.id : parsed.clinicId;
      } catch {}
    }
    return null;
  };

  useEffect(() => {
    const fetchClinicInfo = async () => {
      try {
        const id = getClinicIdFromStorage();
        if (!id) {
          setError('No clinic ID found');
          setLoading(false);
          return;
        }
        setClinicId(id);
        const clinic = await clinicService.getClinic(id);
        setValue('name', clinic.name);
        setValue('address1', clinic.address1);
        setValue('address2', clinic.address2);
        setValue('city', clinic.city);
        setValue('state', clinic.state);
        setValue('country', clinic.country);
        setValue('zipcode', clinic.zipcode);
        setValue('contact', clinic.contact);
        setValue('clinicContact', clinic.clinicContact);
        setValue('doctorName', clinic.doctorName);
        setValue('email', clinic.email);
        setValue('about', clinic.about);
        setValue('website', clinic.website);
        setValue('taxId', clinic.taxId);
        setValue('socialLinks', clinic.socialLinks);
        setValue('operatingHours', clinic.operatingHours);
        setValue('specialties', clinic.specialties);
        if (clinic.logo) {
          setLogoPreview(clinic.logo);
        }
      } catch (err) {
        setError('Failed to fetch clinic information');
      } finally {
        setLoading(false);
      }
    };
    fetchClinicInfo();
  }, [setValue]);

  const handleLogoUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
      setValue('logo', file);
    } else {
      setLogoPreview(null);
      setValue('logo', null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError('');
      const form = { ...data };
      await clinicService.updateClinicSettings(clinicId, form);
      toast.success('Clinic information updated!');
    } catch (err) {
      setError('Failed to save clinic info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Clinic Information</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter clinic name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('contact')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('address1')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.address1 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Street Address"
              />
              {errors.address1 && (
                <p className="text-red-500 text-sm mt-1">{errors.address1.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('city')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="City"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('state')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="State/Province"
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('country')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Country"
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('zipcode')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.zipcode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ZIP/Postal Code"
              />
              {errors.zipcode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipcode.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                {...register('doctorName')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.doctorName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doctor's name"
              />
              {errors.doctorName && (
                <p className="text-red-500 text-sm mt-1">{errors.doctorName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinic Contact
              </label>
              <input
                type="tel"
                {...register('clinicContact')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.clinicContact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Clinic contact number"
              />
              {errors.clinicContact && (
                <p className="text-red-500 text-sm mt-1">{errors.clinicContact.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                {...register('taxId')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.taxId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tax ID"
              />
              {errors.taxId && (
                <p className="text-red-500 text-sm mt-1">{errors.taxId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                {...register('website')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Website URL"
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Clinic
              </label>
              <textarea
                {...register('about')}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.about ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="4"
                placeholder="Tell us about your clinic..."
              />
              {errors.about && (
                <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Links
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    {...register('socialLinks.facebook')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.socialLinks?.facebook ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Facebook URL"
                  />
                  {errors.socialLinks?.facebook && (
                    <p className="text-red-500 text-sm mt-1">{errors.socialLinks.facebook.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    {...register('socialLinks.twitter')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.socialLinks?.twitter ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Twitter URL"
                  />
                  {errors.socialLinks?.twitter && (
                    <p className="text-red-500 text-sm mt-1">{errors.socialLinks.twitter.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    {...register('socialLinks.instagram')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.socialLinks?.instagram ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Instagram URL"
                  />
                  {errors.socialLinks?.instagram && (
                    <p className="text-red-500 text-sm mt-1">{errors.socialLinks.instagram.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    {...register('socialLinks.linkedin')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.socialLinks?.linkedin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="LinkedIn URL"
                  />
                  {errors.socialLinks?.linkedin && (
                    <p className="text-red-500 text-sm mt-1">{errors.socialLinks.linkedin.message}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours
              </label>
              <div className="grid grid-cols-2 gap-4">
                {getValues('operatingHours').map((hour, index) => {
                  const currentHours = getValues('operatingHours');
                  return (
                    <div key={index} className="flex items-center gap-4 mb-2">
                      <span className="w-24">{hour.day}</span>
                      <input
                        type="time"
                        value={hour.open}
                        onChange={(e) => {
                          const newHours = [...currentHours];
                          newHours[index] = { ...newHours[index], open: e.target.value };
                          setValue('operatingHours', newHours);
                        }}
                        className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.operatingHours?.[index]?.open ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="mx-2">-</span>
                      <input
                        type="time"
                        value={hour.close}
                        onChange={(e) => {
                          const newHours = [...currentHours];
                          newHours[index] = { ...newHours[index], close: e.target.value };
                          setValue('operatingHours', newHours);
                        }}
                        className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.operatingHours?.[index]?.close ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialties
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Dentistry', 'Orthodontics', 'Pediatric Dentistry', 'Cosmetic Dentistry', 'Endodontics', 'Periodontics', 'Oral Surgery', 'Prosthodontics'].map((specialty) => {
                  const isChecked = getValues('specialties').includes(specialty);
                  return (
                    <div key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        id={specialty}
                        checked={isChecked}
                        onChange={(e) => {
                          const currentSpecialties = getValues('specialties');
                          setValue('specialties', 
                            e.target.checked 
                              ? [...currentSpecialties, specialty] 
                              : currentSpecialties.filter(s => s !== specialty)
                          );
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={specialty} className="text-sm">
                        {specialty}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              {saving ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2 inline-block" />
                  Saving...
                </>
              ) : (
                'Save Clinic Information'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicInfoSettings;
