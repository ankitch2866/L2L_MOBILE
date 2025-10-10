import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const StatementOfAccountScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statement, setStatement] = useState({
    customer: null,
    project: null,
    unit: null,
    totalPrice: 0,
    totalPaid: 0,
    balance: 0,
    transactions: []
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    balance: 0,
    lastPaymentDate: null
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCustomers();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedCustomer && selectedProject) {
      fetchStatementOfAccount();
    }
  }, [selectedCustomer, selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProject(response.data.data[0].project_id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/master/customers/project/${selectedProject}`);
      if (response.data?.success) {
        setCustomers(response.data.data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    }
  };

  const fetchStatementOfAccount = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/transaction/customer/payment-details/${selectedCustomer}`);
      if (response.data?.success) {
        setStatement(response.data.data);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching statement of account:', error);
      Alert.alert('Error', 'Failed to load statement of account');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStatementOfAccount();
    setRefreshing(false);
  };

  const handleExportStatement = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handlePrintStatement = () => {
    Alert.alert('Print', 'Print functionality will be implemented');
  };

  const selectedProjectData = projects.find(p => p.project_id.toString() === selectedProject);
  const selectedCustomerData = customers.find(c => c.customer_id.toString() === selectedCustomer);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Statement of Account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Customer payment statement
        </Text>
      </View>

      {/* Project and Customer Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project & Customer
          </Text>
          
          <Text variant="bodyMedium" style={styles.label}>Project:</Text>
          <View style={styles.projectSelector}>
            {projects.map((project) => (
              <Chip
                key={project.project_id}
                selected={selectedProject === project.project_id.toString()}
                onPress={() => setSelectedProject(project.project_id.toString())}
                style={[
                  styles.projectChip,
                  selectedProject === project.project_id.toString() && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                {project.project_name}
              </Chip>
            ))}
          </View>

          {selectedProject && (
            <>
              <Text variant="bodyMedium" style={[styles.label, styles.customerLabel]}>Customer:</Text>
              <View style={styles.customerSelector}>
                {customers.map((customer) => (
                  <Chip
                    key={customer.customer_id}
                    selected={selectedCustomer === customer.customer_id.toString()}
                    onPress={() => setSelectedCustomer(customer.customer_id.toString())}
                    style={[
                      styles.customerChip,
                      selectedCustomer === customer.customer_id.toString() && styles.selectedChip
                    ]}
                    textStyle={styles.chipText}
                  >
                    {customer.name} ({customer.phone_no || 'No Phone'})
                  </Chip>
                ))}
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Customer & Project Info */}
      {statement.customer && statement.project && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customer & Project Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text variant="bodyLarge" style={styles.customerName}>
                {statement.customer.name}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Phone: {statement.customer.phone_no || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Email: {statement.customer.email || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.customerDetails}>
                Address: {statement.customer.address || 'N/A'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoSection}>
              <Text variant="bodyLarge" style={styles.projectName}>
                {statement.project.project_name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                Unit: {statement.unit?.unit_name || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                Total Price: {formatCurrency(statement.totalPrice)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Financial Summary */}
      {statement.customer && (
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Total Price
              </Text>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                {formatCurrency(statement.totalPrice)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Total Paid
              </Text>
              <Text variant="headlineMedium" style={[styles.summaryValue, styles.paidValue]}>
                {formatCurrency(statement.totalPaid)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Balance
              </Text>
              <Text variant="headlineMedium" style={[
                styles.summaryValue,
                statement.balance > 0 ? styles.balanceValue : styles.zeroBalanceValue
              ]}>
                {formatCurrency(statement.balance)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Actions */}
      {statement.customer && (
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleExportStatement}
            icon="download"
            style={styles.actionButton}
          >
            Export Statement
          </Button>
          <Button
            mode="outlined"
            onPress={handlePrintStatement}
            icon="printer"
            style={styles.actionButton}
          >
            Print Statement
          </Button>
        </View>
      )}

      {/* Transaction History */}
      {statement.customer && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tableHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Transaction History ({statement.transactions.length})
              </Text>
            </View>
            <Divider style={styles.divider} />
            
            {statement.transactions.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Date</DataTable.Title>
                    <DataTable.Title>Description</DataTable.Title>
                    <DataTable.Title>Amount</DataTable.Title>
                    <DataTable.Title>Method</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                    <DataTable.Title>Balance</DataTable.Title>
                  </DataTable.Header>
                  
                  {statement.transactions.map((transaction, index) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell>
                        <Text variant="bodySmall">
                          {formatDate(transaction.payment_date)}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {transaction.description || 'Payment'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" style={styles.amountText}>
                          {formatCurrency(transaction.amount)}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Chip
                          mode="outlined"
                          compact
                          style={styles.methodChip}
                        >
                          {transaction.payment_method}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Chip
                          mode="outlined"
                          compact
                          style={[
                            styles.statusChip,
                            transaction.status === 'completed' && styles.completedChip,
                            transaction.status === 'pending' && styles.pendingChip
                          ]}
                        >
                          {transaction.status}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text variant="bodyMedium" style={styles.balanceText}>
                          {formatCurrency(transaction.running_balance)}
                        </Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </ScrollView>
            ) : (
              <EmptyState
                title="No Transactions Found"
                description="No payment transactions found for this customer"
              />
            )}
          </Card.Content>
        </Card>
      )}

      {/* No Selection State */}
      {!statement.customer && (
        <Card style={styles.card}>
          <Card.Content>
            <EmptyState
              title="Select Customer"
              description="Please select a project and customer to view their statement of account"
            />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  label: {
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  customerLabel: {
    marginTop: 16,
  },
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectChip: {
    backgroundColor: '#F3F4F6',
  },
  customerChip: {
    backgroundColor: '#F3F4F6',
  },
  selectedChip: {
    backgroundColor: '#EF4444',
  },
  chipText: {
    color: '#374151',
  },
  divider: {
    marginVertical: 12,
  },
  infoSection: {
    gap: 4,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  customerDetails: {
    color: '#6B7280',
  },
  projectName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  projectDetails: {
    color: '#6B7280',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  summaryTitle: {
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paidValue: {
    color: '#059669',
  },
  balanceValue: {
    color: '#DC2626',
  },
  zeroBalanceValue: {
    color: '#059669',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
  balanceText: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  methodChip: {
    maxWidth: 80,
  },
  statusChip: {
    maxWidth: 80,
  },
  completedChip: {
    backgroundColor: '#D1FAE5',
  },
  pendingChip: {
    backgroundColor: '#FEF3C7',
  },
});

export default StatementOfAccountScreen;
