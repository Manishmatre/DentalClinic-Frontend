import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Divider,
  Flex,
  Text,
  VStack,
  HStack,
  useToast
} from '@chakra-ui/react';
import billService from '../../api/billing/billService';
import patientService from '../../api/patients/patientService';
import staffService from '../../api/staff/staffService';
import serviceService from '../../api/services/serviceService';

const AddBillModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    dueDate: '',
    notes: '',
    items: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setForm({ patientId: '', doctorId: '', dueDate: '', notes: '', items: [] });
      setItems([]);
      setErrors({});
    }
  }, [isOpen]);

  const fetchData = async () => {
    const [patientsRes, doctorsRes, servicesRes] = await Promise.all([
      patientService.getPatients(),
      staffService.getDoctors(),
      serviceService.getServices()
    ]);
    setPatients(patientsRes || []);
    setDoctors(doctorsRes || []);
    setServices(servicesRes || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }]);
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'tax' ? Number(value) : value;
    setItems(updated);
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.patientId) errs.patientId = 'Patient is required';
    if (items.length === 0) errs.items = 'At least one item is required';
    items.forEach((item, idx) => {
      if (!item.name) errs[`item_${idx}_name`] = 'Name required';
      if (item.quantity <= 0) errs[`item_${idx}_quantity`] = 'Quantity > 0';
      if (item.unitPrice < 0) errs[`item_${idx}_unitPrice`] = 'Unit price >= 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const dueDate = form.dueDate ? new Date(form.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const processedItems = items.map(item => ({
        ...item,
        totalAmount: (item.quantity * item.unitPrice) + (item.tax || 0) - (item.discount || 0)
      }));
      const billData = {
        patientId: form.patientId,
        doctorId: form.doctorId || undefined,
        dueDate,
        notes: form.notes,
        items: processedItems
      };
      const res = await billService.createBill(billData);
      if (res && !res.error) {
        toast({ title: 'Bill created', status: 'success', duration: 3000, isClosable: true });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.error || 'Failed to create bill');
      }
    } catch (e) {
      toast({ title: 'Error', description: e.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Bill</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            <Flex gap={6}>
              <FormControl isRequired isInvalid={!!errors.patientId} flex={1}>
                <FormLabel>Patient</FormLabel>
                <Select name="patientId" value={form.patientId} onChange={handleChange} placeholder="Select patient">
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </Select>
                <FormErrorMessage>{errors.patientId}</FormErrorMessage>
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Doctor</FormLabel>
                <Select name="doctorId" value={form.doctorId} onChange={handleChange} placeholder="Select doctor (optional)">
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </Select>
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Due Date</FormLabel>
                <Input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
              </FormControl>
            </Flex>
            <FormControl isInvalid={!!errors.items}>
              <FormLabel>Bill Items</FormLabel>
              <VStack align="stretch" spacing={2}>
                {items.map((item, idx) => (
                  <Flex key={idx} gap={2} align="center">
                    <Select placeholder="Service/Item" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} w="30%">
                      {services.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </Select>
                    <NumberInput min={1} value={item.quantity} onChange={(_, v) => handleItemChange(idx, 'quantity', v)} w="15%">
                      <NumberInputField placeholder="Qty" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <NumberInput min={0} value={item.unitPrice} onChange={(_, v) => handleItemChange(idx, 'unitPrice', v)} w="20%">
                      <NumberInputField placeholder="Unit Price" />
                    </NumberInput>
                    <NumberInput min={0} value={item.discount} onChange={(_, v) => handleItemChange(idx, 'discount', v)} w="15%">
                      <NumberInputField placeholder="Discount" />
                    </NumberInput>
                    <NumberInput min={0} value={item.tax} onChange={(_, v) => handleItemChange(idx, 'tax', v)} w="15%">
                      <NumberInputField placeholder="Tax" />
                    </NumberInput>
                    <Button colorScheme="red" size="sm" onClick={() => handleRemoveItem(idx)}>Remove</Button>
                  </Flex>
                ))}
                <Button colorScheme="blue" variant="outline" onClick={handleAddItem}>Add Item</Button>
              </VStack>
              <FormErrorMessage>{errors.items}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">Cancel</Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>Create Bill</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddBillModal; 