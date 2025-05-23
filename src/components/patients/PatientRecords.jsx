// c:\Users\Pc\...\Frontend\src\components\patients\PatientRecords.jsx
import { useEffect, useState } from 'react';
import { patientService } from '../../api/patients/patientService';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await patientService.getPatients();
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    loadPatients();
  }, []);

  return (
    <div className="patient-records">
      <h2>Patient Records</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.patientId}</td>
              <td>{`${patient.firstName} ${patient.lastName}`}</td>
              <td>{new Date(patient.dob).toLocaleDateString()}</td>
              <td>{patient.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientRecords;