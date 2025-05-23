import { useState } from 'react';

export const useForm = (initialState = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  };

  const resetForm = () => {
    setValues(initialState);
    setErrors({});
  };

  const setFormValues = (newValues) => {
    setValues(newValues);
  };

  return {
    values,
    errors,
    setErrors,
    handleChange,
    resetForm,
    setFormValues
  };
};