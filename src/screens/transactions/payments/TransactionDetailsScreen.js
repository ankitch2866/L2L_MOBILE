import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Divider, Chip, DataTable } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchPaymentById } from '../../../store/slices/paymentsSlice';

const TransactionDetailsScreen = ({ route }) => {
  const { paymentId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: payment, loading } = useSelector(state => state.payments);

  useEffect(() => {
    dispatch(fetchPaymentById(paymentId));
  }, [dispatch, paymentId]);

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading || !payment) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title>Transaction Details</Title>
            <Chip icon="check-circle" mode="flat" style={{ backgroundColor: '#D1FAE5' }}>
              Completed
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Transaction ID</DataTable.Cell>
              <DataTable.Cell numeric>
                {payment.payment_id || payment.id}
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Customer</DataTable.Cell>
              <DataTable.Cell numeric>
                {payment.customer_name || 'N/A'}
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Amount</DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={[styles.amount, { color: theme.colors.primary }]}>
                  {formatCurrency(payment.amount)}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Payment Method</DataTable.Cell>
              <DataTable.Cell numeric>
                {(payment.payment_method || 'N/A').toUpperCase()}
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Payment Date</DataTable.Cell>
              <DataTable.Cell numeric>
                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
              </DataTable.Cell>
            </DataTable.Row>

            {payment.transaction_id && (
              <DataTable.Row>
                <DataTable.Cell>Reference ID</DataTable.Cell>
                <DataTable.Cell numeric>
                  {payment.transaction_id}
                </DataTable.Cell>
              </DataTable.Row>
            )}

            {payment.cheque_number && (
              <DataTable.Row>
                <DataTable.Cell>Cheque Number</DataTable.Cell>
                <DataTable.Cell numeric>
                  {payment.cheque_number}
                </DataTable.Cell>
              </DataTable.Row>
            )}

            {payment.bank_name && (
              <DataTable.Row>
                <DataTable.Cell>Bank</DataTable.Cell>
                <DataTable.Cell numeric>
                  {payment.bank_name}
                </DataTable.Cell>
              </DataTable.Row>
            )}

            {payment.project_name && (
              <DataTable.Row>
                <DataTable.Cell>Project</DataTable.Cell>
                <DataTable.Cell numeric>
                  {payment.project_name}
                </DataTable.Cell>
              </DataTable.Row>
            )}

            {payment.unit_name && (
              <DataTable.Row>
                <DataTable.Cell>Unit</DataTable.Cell>
                <DataTable.Cell numeric>
                  {payment.unit_name}
                </DataTable.Cell>
              </DataTable.Row>
            )}

            <DataTable.Row>
              <DataTable.Cell>Transaction Time</DataTable.Cell>
              <DataTable.Cell numeric>
                {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>

          {payment.remarks && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.remarksSection}>
                <Text style={styles.remarksLabel}>Remarks</Text>
                <Text style={styles.remarksText}>{payment.remarks}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Audit Trail</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.auditItem}>
            <Text style={styles.auditLabel}>Created At</Text>
            <Text style={styles.auditValue}>
              {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
            </Text>
          </View>

          {payment.updated_at && (
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>Last Updated</Text>
              <Text style={styles.auditValue}>
                {new Date(payment.updated_at).toLocaleString()}
              </Text>
            </View>
          )}

          {payment.created_by && (
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>Created By</Text>
              <Text style={styles.auditValue}>User #{payment.created_by}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  divider: { marginVertical: 16 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  remarksSection: { marginTop: 8 },
  remarksLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' },
  remarksText: { fontSize: 14, lineHeight: 20 },
  auditItem: { marginBottom: 12 },
  auditLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  auditValue: { fontSize: 14, fontWeight: '500' },
});

export default TransactionDetailsScreen;
