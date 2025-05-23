export const validateMedicalRecord = (data) => {
  const errors = {};

  if (!data.date) {
    errors.date = 'Date is required';
  }

  if (!data.condition) {
    errors.condition = 'Condition is required';
  }

  if (!data.diagnosis) {
    errors.diagnosis = 'Diagnosis is required';
  }

  if (!data.treatment) {
    errors.treatment = 'Treatment is required';
  }

  if (data.medications) {
    const medicationErrors = data.medications.map(med => {
      const medErrors = {};
      if (!med.name) medErrors.name = 'Medication name is required';
      if (!med.dosage) medErrors.dosage = 'Dosage is required';
      if (!med.frequency) medErrors.frequency = 'Frequency is required';
      return Object.keys(medErrors).length > 0 ? medErrors : null;
    }).filter(Boolean);

    if (medicationErrors.length > 0) {
      errors.medications = medicationErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateDocumentUpload = (files) => {
  const errors = [];
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`${file.name}: File type not supported. Allowed types: JPG, PNG, GIF, PDF, DOC, DOCX`);
    }
    if (file.size > maxSize) {
      errors.push(`${file.name}: File size exceeds 5MB limit`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};