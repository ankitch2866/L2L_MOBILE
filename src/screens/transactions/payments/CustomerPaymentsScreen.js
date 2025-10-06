import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { Dropdown } from '../../../components/common';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchCustomerPayments } from '../../../store/slices/paymentsSlice';
import api from '../../../config/api';

const CustomerPaymentsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading } = useSelector(state => state.payments);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      dispatch(fetchCustomerPayments(selectedCustomer));
    }
  }, [dispatch, selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/master/customers');
      if (response.data?.success) {
        setCustomers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleRefresh = async () => {
    if (selectedCustomer) {
      setRefreshing(true);
      await dispatch(fetchCustomerPayments(selectedCustomer));
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalAmount = list.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Dropdown
          label="Select Customer"
          value={selectedCustomer}
          onValueChange={setSelectedCustomer}
          items={customers.map(c => ({ label: c.name, value: c.customer_id }))}
        />

        {selectedCustomer && list.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Payments</Text>
                  <Text style={styles.summaryValue}>{list.length}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                    {formatCurrency(totalAmount)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {loading && !refreshing ? (
        <LoadingIndicator />
      ) : !selectedCustomer ? (
        <EmptyState
          icon="account-search"
          title="Select Customer"
          message="Choose a customer to view their payment history"
        />
      ) : (
        <FlatList
          data={list}
          renderItem={({ item }) => (
            <Card
              style={styles.paymentCard}
              onPress={() => navigation.navigate('PaymentDetails', { paymentId: item.payment_id || item.id })}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.paymentId}>Payment #{item.payment_id || item.id}</Text>
                  <Chip icon="cash" mode="outlined" compact>
                    {(item.payment_method || 'N/A').toUpperCase()}
                  </Chip>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={[styles.amount, { color: theme.colors.primary }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>
                      {item.payment_date ? new Date(item.payment_date).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  {item.project_name && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Project:</Text>
                      <Text style={styles.value}>{item.project_name}</Text>
                    </View>
                  )}
                  {item.remarks && (
                    <Text style={styles.remarks} numberOfLines={2}>{item.remarks}</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
          keyExtractor={(item) => `payment-${item.payment_id || item.id || Math.random()}`}
          ListEmptyComponent={
            <EmptyState
              icon="cash-remove"
              title="No Payments"
              message="This customer has no payment records"
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  summaryCard: { marginTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: 'bold' },
  paymentCard: { margin: 8, marginHorizontal: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentId: { fontSize: 16, fontWeight: 'bold' },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, fontWeight: '500' },
  amount: { fontSize: 18, fontWeight: 'bold' },
  remarks: { fontSize: 12, color: '#6B7280', marginTop: 8, fontStyle: 'italic' },
});

export default CustomerPaymentsScreen;
