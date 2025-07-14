import client from '../client';

// Mock data for development
const MOCK_PRESCRIPTIONS = [
  {
    id: 'p1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    doctorName: 'Dr. Sarah Johnson',
    date: '2025-05-20',
    diagnosis: 'Dental caries',
    notes: 'Patient reported sensitivity to cold foods',
    medications: [
      {
        id: 'm1',
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Every 8 hours',
        duration: '7 days',
        instructions: 'Take with food',
        quantity: 21
      },
      {
        id: 'm2',
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Every 6 hours as needed',
        duration: '3 days',
        instructions: 'Take after meals',
        quantity: 12
      }
    ],
    status: 'active'
  },
  {
    id: 'p2',
    patientId: 'patient1',
    doctorId: 'doctor2',
    doctorName: 'Dr. Michael Chen',
    date: '2025-04-15',
    diagnosis: 'Gingivitis',
    notes: 'Recommended improved oral hygiene routine',
    medications: [
      {
        id: 'm3',
        name: 'Chlorhexidine Gluconate Mouthwash',
        dosage: '15ml',
        frequency: 'Twice daily',
        duration: '14 days',
        instructions: 'Rinse for 30 seconds and spit out. Do not eat or drink for 30 minutes after use.',
        quantity: 1
      }
    ],
    status: 'completed'
  },
  {
    id: 'p3',
    patientId: 'patient2',
    doctorId: 'doctor1',
    doctorName: 'Dr. Sarah Johnson',
    date: '2025-05-22',
    diagnosis: 'Pericoronitis',
    notes: 'Wisdom tooth extraction recommended',
    medications: [
      {
        id: 'm4',
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Every 8 hours',
        duration: '7 days',
        instructions: 'Take with food',
        quantity: 21
      },
      {
        id: 'm5',
        name: 'Acetaminophen with Codeine',
        dosage: '1-2 tablets',
        frequency: 'Every 4-6 hours as needed for pain',
        duration: '3 days',
        instructions: 'Do not drive or operate machinery. May cause drowsiness.',
        quantity: 12
      }
    ],
    status: 'active'
  }
];

// Common dental medications for quick selection
export const COMMON_DENTAL_MEDICATIONS = [
  {
    category: 'Antibiotics',
    medications: [
      { name: 'Amoxicillin', defaultDosage: '500mg', defaultFrequency: 'Every 8 hours', defaultDuration: '7 days' },
      { name: 'Clindamycin', defaultDosage: '300mg', defaultFrequency: 'Every 6 hours', defaultDuration: '7 days' },
      { name: 'Metronidazole', defaultDosage: '500mg', defaultFrequency: 'Every 8 hours', defaultDuration: '7 days' },
      { name: 'Azithromycin', defaultDosage: '500mg', defaultFrequency: 'Once daily', defaultDuration: '3 days' },
      { name: 'Penicillin VK', defaultDosage: '500mg', defaultFrequency: 'Every 6 hours', defaultDuration: '7-10 days' }
    ]
  },
  {
    category: 'Pain Management',
    medications: [
      { name: 'Ibuprofen', defaultDosage: '400mg', defaultFrequency: 'Every 4-6 hours as needed', defaultDuration: '3-5 days' },
      { name: 'Acetaminophen', defaultDosage: '500mg', defaultFrequency: 'Every 4-6 hours as needed', defaultDuration: '3-5 days' },
      { name: 'Naproxen Sodium', defaultDosage: '550mg', defaultFrequency: 'Every 12 hours as needed', defaultDuration: '3-5 days' },
      { name: 'Acetaminophen with Codeine', defaultDosage: '1-2 tablets', defaultFrequency: 'Every 4-6 hours as needed', defaultDuration: '2-3 days' },
      { name: 'Tramadol', defaultDosage: '50mg', defaultFrequency: 'Every 4-6 hours as needed', defaultDuration: '2-3 days' }
    ]
  },
  {
    category: 'Oral Rinses',
    medications: [
      { name: 'Chlorhexidine Gluconate Mouthwash', defaultDosage: '15ml', defaultFrequency: 'Twice daily', defaultDuration: '14 days' },
      { name: 'Hydrogen Peroxide Rinse', defaultDosage: '15ml (diluted)', defaultFrequency: 'Three times daily', defaultDuration: '7 days' },
      { name: 'Sodium Fluoride Rinse', defaultDosage: '10ml', defaultFrequency: 'Once daily', defaultDuration: 'Ongoing' }
    ]
  },
  {
    category: 'Topical Agents',
    medications: [
      { name: 'Benzocaine Gel', defaultDosage: 'Apply small amount', defaultFrequency: 'As needed for pain', defaultDuration: '3-5 days' },
      { name: 'Triamcinolone Dental Paste', defaultDosage: 'Apply small amount', defaultFrequency: 'Three times daily', defaultDuration: '7 days' },
      { name: 'Fluoride Gel', defaultDosage: 'Apply as directed', defaultFrequency: 'Once daily', defaultDuration: '4 weeks' }
    ]
  }
];

// Common dental diagnoses for quick selection
export const COMMON_DENTAL_DIAGNOSES = [
  'Dental caries',
  'Gingivitis',
  'Periodontitis',
  'Pericoronitis',
  'Pulpitis',
  'Dental abscess',
  'Cracked tooth',
  'Dental trauma',
  'Temporomandibular joint disorder (TMJ)',
  'Bruxism',
  'Malocclusion',
  'Oral candidiasis',
  'Lichen planus',
  'Leukoplakia',
  'Oral cancer',
  'Xerostomia (dry mouth)',
  'Halitosis',
  'Post-extraction complication',
  'Post-operative pain',
  'Dental hypersensitivity'
];

const prescriptionService = {
  // Get all prescriptions for a patient
  getPatientPrescriptions: async (patientId) => {
    try {
      const response = await client.get(`/prescriptions/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.log('Error fetching prescriptions or API not available, using mock data');
      // Return mock data for development
      return MOCK_PRESCRIPTIONS.filter(p => p.patientId === patientId);
    }
  },

  // Get a specific prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await client.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.log('Error fetching prescription or API not available, using mock data');
      // Return mock data for development
      return MOCK_PRESCRIPTIONS.find(p => p.id === prescriptionId);
    }
  },

  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await client.post(`/prescriptions`, prescriptionData);
      return response.data;
    } catch (error) {
      console.log('Error creating prescription or API not available, using mock data');
      // Simulate creating a prescription with mock data
      const newPrescription = {
        id: `p${MOCK_PRESCRIPTIONS.length + 1}`,
        ...prescriptionData,
        date: prescriptionData.date || new Date().toISOString().split('T')[0],
        status: 'active'
      };
      MOCK_PRESCRIPTIONS.push(newPrescription);
      return newPrescription;
    }
  },

  // Update an existing prescription
  updatePrescription: async (prescriptionId, prescriptionData) => {
    try {
      const response = await client.put(`/prescriptions/${prescriptionId}`, prescriptionData);
      return response.data;
    } catch (error) {
      console.log('Error updating prescription or API not available, using mock data');
      // Simulate updating a prescription with mock data
      const index = MOCK_PRESCRIPTIONS.findIndex(p => p.id === prescriptionId);
      if (index !== -1) {
        MOCK_PRESCRIPTIONS[index] = {
          ...MOCK_PRESCRIPTIONS[index],
          ...prescriptionData
        };
        return MOCK_PRESCRIPTIONS[index];
      }
      throw new Error('Prescription not found');
    }
  },

  // Delete a prescription
  deletePrescription: async (prescriptionId) => {
    try {
      await client.delete(`/prescriptions/${prescriptionId}`);
      return { success: true };
    } catch (error) {
      console.log('Error deleting prescription or API not available, using mock data');
      // Simulate deleting a prescription with mock data
      const index = MOCK_PRESCRIPTIONS.findIndex(p => p.id === prescriptionId);
      if (index !== -1) {
        MOCK_PRESCRIPTIONS.splice(index, 1);
        return { success: true };
      }
      throw new Error('Prescription not found');
    }
  },

  // Get prescription statistics
  getPrescriptionStats: async (doctorId = null) => {
    try {
      const params = doctorId ? { doctorId } : {};
      const response = await client.get('/prescriptions/stats', { params });
      return response.data;
    } catch (error) {
      console.log('Error fetching prescription stats or API not available, using mock data');
      // Generate mock stats
      return {
        total: MOCK_PRESCRIPTIONS.length,
        active: MOCK_PRESCRIPTIONS.filter(p => p.status === 'active').length,
        completed: MOCK_PRESCRIPTIONS.filter(p => p.status === 'completed').length,
        mostPrescribedMedications: [
          { name: 'Amoxicillin', count: 2 },
          { name: 'Ibuprofen', count: 1 },
          { name: 'Chlorhexidine Gluconate Mouthwash', count: 1 }
        ]
      };
    }
  }
};

export default prescriptionService;
