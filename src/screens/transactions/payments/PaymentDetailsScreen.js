import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Text, Button, Divider, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchPaymentById, deletePayment, fetchPayments } from '../../../store/slices/paymentsSlice';

const PaymentDetailsScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: payment, loading } = useSelector(state => state.payments);

  useEffect(() => {
    dispatch(fetchPaymentById(paymentId));
  }, [dispatch, paymentId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePayment(paymentId)).unwrap();
              Alert.alert('Success', 'Payment deleted successfully');
              dispatch(fetchPayments());
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading || !payment) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title>Payment #{payment.payment_id || payment.id}</Title>
            <Chip icon="cash" mode="outlined">
              {(payment.payment_method || 'N/A').toUpperCase()}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{payment.customer_name || 'N/A'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <Text style={[styles.value, styles.amount, { color: theme.colors.primary }]}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Payment Date</Text>
            <Text style={styles.value}>
              {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>

          {payment.project_name && (
            <View style={styles.section}>
              <Text style={styles.label}>Project</Text>
              <Text style={styles.value}>{payment.project_name}</Text>
            </View>
          )}

          {payment.unit_name && (
            <View style={styles.section}>
              <Text style={styles.label}>Unit</Text>
              <Text style={styles.value}>{payment.unit_name}</Text>
            </View>
          )}

          {payment.transaction_id && (
            <View style={styles.section}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{payment.transaction_id}</Text>
            </View>
          )}

          {payment.cheque_number && (
            <View style={styles.section}>
              <Text style={styles.label}>Cheque Number</Text>
              <Text style={styles.value}>{payment.cheque_number}</Text>
            </View>
          )}

          {payment.bank_name && (
            <View style={styles.section}>
              <Text style={styles.label}>Bank</Text>
              <Text style={styles.value}>{payment.bank_name}</Text>
            </View>
          )}

          {payment.remarks && (
            <View style={styles.section}>
              <Text style={styles.label}>Remarks</Text>
              <Text style={styles.value}>{payment.remarks}</Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
            </Text>
          </View>

          {payment.updated_at && (
            <View style={styles.section}>
              <Text style={styles.label}>Last Updated</Text>
              <Text style={styles.value}>
                {new Date(payment.updated_at).toLocaleString()}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => navigation.navigate('EditPayment', { paymentId: payment.payment_id || payment.id })}
          style={styles.actionButton}
        >
          Edit
        </Button>
        <Button
          mode="contained"
          icon="delete"
          onPress={handleDelete}
          style={styles.actionButton}
          buttonColor={theme.colors.error}
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  divider: { marginVertical: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 16, fontWeight: '500' },
  amount: { fontSize: 24, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 12, padding: 16 },
  actionButton: { flex: 1 },
});

export default PaymentDetailsScreen;
