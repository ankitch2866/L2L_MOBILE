import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Text, Button, Chip, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchChequeById, sendToBank, updateFeedback } from '../../../store/slices/chequesSlice';

const ChequeDetailsScreen = ({ route, navigation }) => {
  const { chequeId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: cheque, loading } = useSelector(state => state.cheques);

  useEffect(() => {
    if (chequeId) {
      dispatch(fetchChequeById(chequeId));
    }
  }, [chequeId, dispatch]);

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'cleared': return '#10B981';
      case 'bounced':
      case 'bounce': return '#EF4444';
      case 'submitted':
      case 'sent to bank': return '#F59E0B';
      case 'cancelled': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const handleSendToBank = () => {
    Alert.alert(
      'Send to Bank',
      'Are you sure you want to send this cheque to the bank?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await dispatch(sendToBank(chequeId)).unwrap();
              Alert.alert('Success', 'Cheque sent to bank successfully');
              dispatch(fetchChequeById(chequeId));
            } catch (error) {
              Alert.alert('Error', error || 'Failed to send cheque to bank');
            }
          }
        }
      ]
    );
  };

  const handleMarkCleared = () => {
    Alert.alert(
      'Mark as Cleared',
      'Are you sure you want to mark this cheque as cleared?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Cleared',
          onPress: async () => {
            try {
              await dispatch(updateFeedback({ 
                id: chequeId, 
                feedback: { status: 'cleared' } 
              })).unwrap();
              Alert.alert('Success', 'Cheque marked as cleared');
              dispatch(fetchChequeById(chequeId));
            } catch (error) {
              Alert.alert('Error', error || 'Failed to update cheque status');
            }
          }
        }
      ]
    );
  };

  const handleMarkBounced = () => {
    Alert.alert(
      'Mark as Bounced',
      'Are you sure you want to mark this cheque as bounced?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Bounced',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(updateFeedback({ 
                id: chequeId, 
                feedback: { status: 'bounced' } 
              })).unwrap();
              Alert.alert('Success', 'Cheque marked as bounced');
              dispatch(fetchChequeById(chequeId));
            } catch (error) {
              Alert.alert('Error', error || 'Failed to update cheque status');
            }
          }
        }
      ]
    );
  };

  if (loading || !cheque) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Title>Cheque #{cheque.cheque_no}</Title>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(cheque.cheque_status) }]}
                textStyle={styles.statusText}
              >
                {cheque.cheque_status || 'Pending'}
              </Chip>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                {formatCurrency(cheque.amount)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Cheque Information</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cheque Number:</Text>
              <Text style={styles.value}>{cheque.cheque_no || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bank:</Text>
              <Text style={styles.value}>{cheque.bank_name || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{cheque.customer_name || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cheque Date:</Text>
              <Text style={styles.value}>{formatDate(cheque.cheque_date)}</Text>
            </View>
            
            
            {cheque.clearance_date && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Clearance Date:</Text>
                <Text style={styles.value}>{formatDate(cheque.clearance_date)}</Text>
              </View>
            )}
            
            {cheque.remarks && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Remarks:</Text>
                <Text style={styles.value}>{cheque.remarks}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Actions</Title>
            <View style={styles.actionsContainer}>
              {cheque.cheque_status?.toLowerCase() === 'pending' && (
                <Button
                  mode="contained"
                  icon="bank-transfer"
                  onPress={handleSendToBank}
                  style={styles.actionButton}
                >
                  Send to Bank
                </Button>
              )}
              
              {(cheque.cheque_status?.toLowerCase() === 'submitted' || 
                cheque.cheque_status?.toLowerCase() === 'sent to bank') && (
                <>
                  <Button
                    mode="contained"
                    icon="check-circle"
                    onPress={handleMarkCleared}
                    style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  >
                    Mark as Cleared
                  </Button>
                  <Button
                    mode="contained"
                    icon="close-circle"
                    onPress={handleMarkBounced}
                    style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                  >
                    Mark as Bounced
                  </Button>
                </>
              )}
              
              <Button
                mode="outlined"
                icon="pencil"
                onPress={() => navigation.navigate('EditCheque', { chequeId })}
                style={styles.actionButton}
              >
                Edit Cheque
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 4, minHeight: 24 },
  statusText: { color: '#FFF', fontWeight: '600', textAlign: 'center' },
  amountContainer: { alignItems: 'center', paddingVertical: 16 },
  amountLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  amountValue: { fontSize: 32, fontWeight: 'bold' },
  divider: { marginVertical: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14, color: '#6B7280', flex: 1 },
  value: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
  actionsContainer: { marginTop: 16, gap: 12 },
  actionButton: { marginBottom: 8 },
});

export default ChequeDetailsScreen;
