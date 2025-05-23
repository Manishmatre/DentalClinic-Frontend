export const exportPatientData = (patient, medicalHistory, appointments) => {
  const data = {
    patientInfo: {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address
    },
    medicalHistory: medicalHistory.map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      condition: record.condition,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications,
      notes: record.notes
    })),
    appointments: appointments.map(appointment => ({
      date: new Date(appointment.date).toLocaleDateString(),
      time: new Date(appointment.date).toLocaleTimeString(),
      status: appointment.status,
      doctor: appointment.doctor?.name || 'N/A'
    }))
  };

  // Create Blob and download
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `patient_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};