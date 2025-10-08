import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchCreditPaymentById } from '../../../store/slices/paymentsSlice';
import { LoadingIndicator } from '../../../components/common';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const CreditPaymentDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { creditId } = route.params;
  const { currentCreditPayment, loading } = useSelector(state => state.payments);
  
  const [payment, setPayment] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={{ marginLeft: -8 }}
            textColor="#007AFF"
          >
            Back
          </Button>
        ),
      });
    }, [navigation])
  );

  useEffect(() => {
    if (creditId) {
      dispatch(fetchCreditPaymentById(creditId));
    }
  }, [dispatch, creditId]);

  useEffect(() => {
    if (currentCreditPayment) {
      setPayment(currentCreditPayment);
    }
  }, [currentCreditPayment]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'adjustment': return '#3B82F6';
      case 'refund': return '#10B981';
      case 'discount': return '#F59E0B';
      case 'waiver': return '#8B5CF6';
      case 'other': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'approved': return '#059669';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'adjustment': return 'Balance Adjustment';
      case 'refund': return 'Refund';
      case 'discount': return 'Discount';
      case 'waiver': return 'Waiver';
      case 'other': return 'Other';
      default: return type;
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!payment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.errorTitle}>Credit Payment Not Found</Text>
            <Text variant="bodyMedium" style={styles.errorText}>
              The requested credit payment could not be found.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.customerInfo}>
              <Text variant="headlineSmall" style={styles.customerName}>
                {payment.customer_name || 'Unknown Customer'}
              </Text>
              <Text variant="bodyMedium" style={styles.projectName}>
                {payment.project_name || 'No Project'}
              </Text>
            </View>
            <View style={styles.amountContainer}>
              <Text variant="headlineSmall" style={styles.amount}>
                {formatCurrency(payment.amount)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Basic Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Credit Type:</Text>
            <Chip
              style={[styles.typeChip, { backgroundColor: getTypeColor(payment.credit_type) + '20' }]}
              textStyle={{ color: getTypeColor(payment.credit_type) }}
            >
              {getTypeLabel(payment.credit_type)}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(payment.status) + '20' }]}
              textStyle={{ color: getStatusColor(payment.status) }}
            >
              {payment.status || 'Unknown'}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created Date:</Text>
            <Text style={styles.value}>{formatDate(payment.created_at)}</Text>
          </View>

          {payment.updated_at && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Updated:</Text>
              <Text style={styles.value}>{formatDate(payment.updated_at)}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Reason and Details */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Reason & Details</Text>
          
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{payment.reason || 'No reason provided'}</Text>
          </View>

          {payment.reference_payment_id && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceLabel}>Reference Payment ID:</Text>
              <Text style={styles.referenceValue}>#{payment.reference_payment_id}</Text>
            </View>
          )}

          {payment.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Additional Remarks:</Text>
              <Text style={styles.remarksText}>{payment.remarks}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Customer Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer ID:</Text>
            <Text style={styles.value}>#{payment.customer_id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact Number:</Text>
            <Text style={styles.value}>{payment.contact_number || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{payment.customer_address || 'N/A'}</Text>
          </View>

          {payment.unit_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Unit:</Text>
              <Text style={styles.value}>{payment.unit_name}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Transaction Details */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.amountDetailsContainer}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Credit Amount:</Text>
              <Text style={styles.amountValue}>{formatCurrency(payment.amount)}</Text>
            </View>
            
            {payment.previous_balance && (
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Previous Balance:</Text>
                <Text style={styles.amountValue}>{formatCurrency(payment.previous_balance)}</Text>
              </View>
            )}
            
            {payment.new_balance && (
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>New Balance:</Text>
                <Text style={[styles.amountValue, styles.newBalanceValue]}>
                  {formatCurrency(payment.new_balance)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created By:</Text>
            <Text style={styles.value}>{payment.created_by || 'Unknown'}</Text>
          </View>

          {payment.approved_by && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Approved By:</Text>
              <Text style={styles.value}>{payment.approved_by}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('EditCreditPayment', { creditId: payment.credit_id })}
          style={styles.actionButton}
        >
          Edit Payment
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Close
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  projectName: {
    color: '#6B7280',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    color: '#059669',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
  },
  typeChip: {
    borderRadius: 12,
  },
  statusChip: {
    borderRadius: 12,
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  referenceContainer: {
    marginBottom: 16,
  },
  referenceLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  referenceValue: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  remarksContainer: {
    marginBottom: 16,
  },
  remarksLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  remarksText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  amountDetailsContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  newBalanceValue: {
    color: '#059669',
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#FEF2F2',
  },
  errorTitle: {
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#7F1D1D',
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
  },
});

export default CreditPaymentDetailsScreen;
