/**
 * Comprehensive list of medical services by specialty
 * This data is used as a fallback when no services are found in the database
 */
export const medicalServicesData = {
  'General Medicine': [
    'Regular Check-up',
    'Preventive Health Screening',
    'Vaccination',
    'Chronic Disease Management',
    'Health Certificate',
    'Travel Medicine Consultation'
  ],
  'Cardiology': [
    'Cardiac Evaluation',
    'ECG',
    'Echocardiogram',
    'Stress Test',
    'Holter Monitoring',
    'Pacemaker Check'
  ],
  'Dermatology': [
    'Skin Examination',
    'Acne Treatment',
    'Mole Evaluation',
    'Skin Biopsy',
    'Eczema Treatment',
    'Psoriasis Management'
  ],
  'Orthopedics': [
    'Joint Pain Consultation',
    'Fracture Treatment',
    'Sports Injury',
    'Arthritis Management',
    'Physical Therapy Referral',
    'Osteoporosis Screening'
  ],
  'Gynecology': [
    'Well-Woman Exam',
    'Prenatal Care',
    'Pap Smear',
    'Contraception Consultation',
    'Menopause Management',
    'Fertility Consultation'
  ],
  'Pediatrics': [
    'Well-Child Visit',
    'Child Vaccination',
    'Growth and Development Check',
    'School Physical',
    'Newborn Care',
    'Adolescent Medicine'
  ],
  'Ophthalmology': [
    'Eye Examination',
    'Vision Test',
    'Glaucoma Screening',
    'Cataract Evaluation',
    'Diabetic Eye Exam',
    'Contact Lens Fitting'
  ],
  'ENT (Ear, Nose, Throat)': [
    'Hearing Test',
    'Sinus Evaluation',
    'Tonsillitis Treatment',
    'Allergy Testing',
    'Voice Disorder Consultation',
    'Sleep Apnea Screening'
  ],
  'Neurology': [
    'Neurological Examination',
    'Headache Consultation',
    'Seizure Management',
    'Memory Disorder Evaluation',
    'Multiple Sclerosis Management',
    'Parkinson\'s Disease Treatment'
  ],
  'Urology': [
    'Prostate Examination',
    'Kidney Stone Treatment',
    'Urinary Tract Infection',
    'Erectile Dysfunction Consultation',
    'Incontinence Evaluation',
    'Vasectomy Consultation'
  ],
  'Gastroenterology': [
    'Digestive Health Consultation',
    'Colonoscopy',
    'Endoscopy',
    'IBS Management',
    'Hepatitis Treatment',
    'GERD Management'
  ],
  'Endocrinology': [
    'Diabetes Management',
    'Thyroid Disorder Treatment',
    'Hormone Imbalance',
    'Osteoporosis Management',
    'Adrenal Disorder',
    'Growth Disorder Evaluation'
  ],
  'Psychiatry': [
    'Mental Health Evaluation',
    'Depression Treatment',
    'Anxiety Management',
    'ADHD Consultation',
    'Bipolar Disorder Treatment',
    'Stress Management'
  ],
  'Dental': [
    'Dental Check-up',
    'Teeth Cleaning',
    'Filling',
    'Root Canal',
    'Extraction',
    'Crown/Bridge Work',
    'Dentures',
    'Orthodontic Consultation',
    'Teeth Whitening',
    'Gum Disease Treatment'
  ],
  'Diagnostic Services': [
    'Blood Test',
    'X-Ray',
    'Ultrasound',
    'MRI',
    'CT Scan',
    'Biopsy',
    'Allergy Testing',
    'EEG',
    'Bone Density Test'
  ],
  'Preventive Care': [
    'Annual Physical',
    'Immunizations',
    'Cancer Screening',
    'Cardiovascular Risk Assessment',
    'Smoking Cessation',
    'Weight Management',
    'Nutrition Counseling'
  ]
};

/**
 * Helper function to get a flattened list of all services
 * @returns {Array} Array of services in format "Category: Service"
 */
export const getFlattenedServices = () => {
  return Object.entries(medicalServicesData).reduce((acc, [category, services]) => {
    services.forEach(service => {
      acc.push(`${category}: ${service}`);
    });
    return acc;
  }, []);
};

/**
 * Helper function to get service duration in minutes
 * @param {string} serviceName - The name of the service
 * @returns {number} Duration in minutes
 */
export const getServiceDuration = (serviceName) => {
  // Default durations by service type (in minutes)
  const durationMap = {
    'Regular Check-up': 30,
    'Comprehensive Examination': 60,
    'Consultation': 45,
    'Follow-up': 20,
    'Vaccination': 15,
    'Screening': 30,
    'Dental Check-up': 40,
    'Teeth Cleaning': 60,
    'Colonoscopy': 90,
    'Endoscopy': 60,
    'MRI': 45,
    'CT Scan': 30,
    'X-Ray': 20,
    'Ultrasound': 30,
    'Therapy Session': 50,
  };

  // Try to match the service name with known durations
  for (const [key, duration] of Object.entries(durationMap)) {
    if (serviceName.includes(key)) {
      return duration;
    }
  }

  // Default duration if no match found
  return 30;
};
