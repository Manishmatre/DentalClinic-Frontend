import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Text,
  Select,
  Button,
  HStack,
  useToast,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

import billService from '../../api/billing/billService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BillingDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBills: 0,
    summary: {
      totalBilled: 0,
      totalPaid: 0,
      totalPending: 0,
      totalInsuranceCoverage: 0,
      averageBillAmount: 0
    },
    statusDistribution: [],
    monthlyTrend: [],
    paymentMethodDistribution: []
  });
  
  // Filter state
  const [timeRange, setTimeRange] = useState('6months');
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    fetchBillingStats();
  }, [timeRange]);
  
  const fetchBillingStats = async () => {
    setLoading(true);
    try {
      // Calculate date range based on selected timeRange
      let startDate, endDate;
      const now = new Date();
      
      switch (timeRange) {
        case '30days':
          startDate = subMonths(now, 1);
          endDate = now;
          break;
        case '3months':
          startDate = subMonths(now, 3);
          endDate = now;
          break;
        case '6months':
          startDate = subMonths(now, 6);
          endDate = now;
          break;
        case '12months':
          startDate = subMonths(now, 12);
          endDate = now;
          break;
        case 'ytd':
          startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
          endDate = now;
          break;
        default:
          startDate = subMonths(now, 6);
          endDate = now;
      }
      
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await billService.getBillingStats(formattedStartDate, formattedEndDate);
      setStats(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch billing statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare and format data for charts
  const formatStatusData = () => {
    if (!stats.statusDistribution || !Array.isArray(stats.statusDistribution)) return [];
    return stats.statusDistribution.map(item => ({
      name: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Unknown',
      value: item.amount || 0
    }));
  };
  
  const formatMonthlyTrendData = () => {
    if (!stats.monthlyTrend || !Array.isArray(stats.monthlyTrend)) return [];
    return stats.monthlyTrend.map(item => ({
      month: `${item.month || '?'}/${item.year || '?'}`,
      billed: item.totalBilled || 0,
      paid: item.totalPaid || 0,
      count: item.count || 0
    }));
  };
  
  const formatPaymentMethodData = () => {
    if (!stats.paymentMethodDistribution || !Array.isArray(stats.paymentMethodDistribution)) return [];
    return stats.paymentMethodDistribution.map(item => ({
      name: item.method ? (item.method.replace('_', ' ').charAt(0).toUpperCase() + item.method.replace('_', ' ').slice(1)) : 'Unknown',
      value: item.amount || 0
    }));
  };
  
  const calculateCollectionRate = () => {
    if (!stats.summary || !stats.summary.totalBilled) return 0;
    return (stats.summary.totalPaid / stats.summary.totalBilled) * 100;
  };
  
  if (loading || !stats.summary) {
    return <LoadingSpinner />;
  }
  
  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Billing Dashboard</Heading>
        <HStack>
          <Select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            width="200px"
          >
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="ytd">Year to Date</option>
          </Select>
          <Button 
            colorScheme="blue" 
            onClick={fetchBillingStats}
            isLoading={loading}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>
      
      {/* Key Financial Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Billed</StatLabel>
              <StatNumber>{billService.formatCurrency(stats.summary.totalBilled)}</StatNumber>
              <StatHelpText>From {stats.totalBills} bills</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Collected</StatLabel>
              <StatNumber>{billService.formatCurrency(stats.summary.totalPaid)}</StatNumber>
              <StatHelpText>Collection Rate: {calculateCollectionRate().toFixed(1)}%</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Outstanding Balance</StatLabel>
              <StatNumber>{billService.formatCurrency(stats.summary.totalPending)}</StatNumber>
              <StatHelpText>Awaiting payment</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Average Bill Amount</StatLabel>
              <StatNumber>{billService.formatCurrency(stats.summary.averageBillAmount)}</StatNumber>
              <StatHelpText>Per bill</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Charts Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <Heading size="md">Monthly Revenue Trend</Heading>
          </CardHeader>
          <CardBody height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatMonthlyTrendData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => billService.formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="billed" stroke="#8884d8" name="Billed Amount" />
                <Line type="monotone" dataKey="paid" stroke="#82ca9d" name="Collected Amount" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        
        {/* Bill Status Distribution */}
        <Card>
          <CardHeader>
            <Heading size="md">Bill Status Distribution</Heading>
          </CardHeader>
          <CardBody height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {formatStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => billService.formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Second Row of Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <Heading size="md">Payment Methods</Heading>
          </CardHeader>
          <CardBody height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatPaymentMethodData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => billService.formatCurrency(value)} />
                <Bar dataKey="value" fill="#82ca9d" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        
        {/* Insurance Coverage */}
        <Card>
          <CardHeader>
            <Heading size="md">Insurance Coverage</Heading>
          </CardHeader>
          <CardBody height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Covered by Insurance', value: stats.summary?.totalInsuranceCoverage || 0 },
                    { 
                      name: 'Patient Responsibility', 
                      value: Math.max(0, (stats.summary?.totalBilled || 0) - (stats.summary?.totalInsuranceCoverage || 0))
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip formatter={(value) => billService.formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default BillingDashboard;
