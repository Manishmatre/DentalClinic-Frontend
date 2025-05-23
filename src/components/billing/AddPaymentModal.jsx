import React, { useState } from 'react';
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
  useToast
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import billService from '../../api/billing/billService';

const AddPaymentModal = ({ isOpen, onClose, bill, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  // Validation schema
  const validationSchema = Yup.object({
    amount: Yup.number()
      .positive('Amount must be positive')
      .max(bill?.balanceAmount || 0, 'Amount cannot exceed the remaining balance')
      .required('Amount is required'),
    paymentMethod: Yup.string().required('Payment method is required')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      amount: bill?.balanceAmount || 0,
      paymentMethod: 'cash',
      transactionId: '',
      notes: ''
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });
  
  async function handleSubmit(values) {
    setLoading(true);
    try {
      const response = await billService.addPayment(bill._id, values);
      if (response && !response.error) {
        toast({
          title: 'Success',
          description: 'Payment added successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onSuccess();
      } else {
        throw new Error(response.error || 'Failed to add payment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Payment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {bill && (
            <Box mb={4}>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">Bill Number:</Text>
                <Text>{bill.billNumber}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">Patient:</Text>
                <Text>{bill.patientId?.name || 'N/A'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">Total Amount:</Text>
                <Text>{billService.formatCurrency(bill.totalAmount)}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">Amount Paid:</Text>
                <Text>{billService.formatCurrency(bill.paidAmount)}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">Balance Due:</Text>
                <Text color="red.500" fontWeight="bold">
                  {billService.formatCurrency(bill.balanceAmount)}
                </Text>
              </Flex>
              <Divider my={4} />
            </Box>
          )}
          
          <form onSubmit={formik.handleSubmit}>
            <FormControl 
              isRequired 
              isInvalid={formik.touched.amount && formik.errors.amount}
              mb={4}
            >
              <FormLabel>Payment Amount</FormLabel>
              <NumberInput
                value={formik.values.amount}
                onChange={(value) => formik.setFieldValue('amount', value)}
                max={bill?.balanceAmount || 0}
                min={0}
                precision={2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
            </FormControl>
            
            <FormControl 
              isRequired 
              isInvalid={formik.touched.paymentMethod && formik.errors.paymentMethod}
              mb={4}
            >
              <FormLabel>Payment Method</FormLabel>
              <Select
                value={formik.values.paymentMethod}
                onChange={formik.handleChange}
                name="paymentMethod"
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="insurance">Insurance</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online Payment</option>
                <option value="other">Other</option>
              </Select>
              <FormErrorMessage>{formik.errors.paymentMethod}</FormErrorMessage>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Transaction ID</FormLabel>
              <Input
                value={formik.values.transactionId}
                onChange={formik.handleChange}
                name="transactionId"
                placeholder="For card payments, transfers, etc."
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={formik.values.notes}
                onChange={formik.handleChange}
                name="notes"
                placeholder="Any additional information about this payment"
                rows={3}
              />
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={formik.handleSubmit}
            isLoading={loading}
            isDisabled={!bill || bill.balanceAmount <= 0}
          >
            Add Payment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPaymentModal;
