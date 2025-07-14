import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PatientList from './PatientList';
import * as patientService from '../../api/patients/patientService';

jest.mock('../../api/patients/patientService');

describe('PatientList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner initially', () => {
    patientService.getPatients.mockResolvedValue({ data: [] });
    render(<PatientList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders patient list after fetching data', async () => {
    const mockPatients = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', status: 'active', lastVisit: '2024-01-01' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', status: 'inactive', lastVisit: '2024-02-01' }
    ];
    patientService.getPatients.mockResolvedValue({ data: mockPatients, pagination: { totalPages: 1 } });
    render(<PatientList />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('shows error toast on fetch failure', async () => {
    patientService.getPatients.mockRejectedValue(new Error('Failed to fetch'));
    render(<PatientList />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch patients/i)).toBeInTheDocument();
    });
  });
});
