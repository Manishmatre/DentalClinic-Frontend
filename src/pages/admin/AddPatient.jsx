import React from 'react';
import { useParams } from 'react-router-dom';
import PatientForm from './PatientForm';
import Card from '../../components/ui/Card';

const AddPatient = () => {
  const { id } = useParams();
  
  return (
    <div className="p-4">
      <PatientForm />
    </div>
  );
};

export default AddPatient;