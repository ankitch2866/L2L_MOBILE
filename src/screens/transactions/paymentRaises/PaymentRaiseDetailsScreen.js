import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Divider, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchRaiseById, deleteRaise, clearCurrentRaise, updateRaiseStatus } from '../../../store/slices/paymentRaisesSlice';

const PaymentRaiseDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.paymentRaises);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchRaiseById(id));
    
    return () => {
      dispatch(clearCurrentRaise());
    };
  }, [dispatch, id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchRaiseById(id));
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment Raise',
      'Are you sure you want to delete this payment raise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteRaise(id)).unwrap();
              Alert.alert('Success', 'Payment raise deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete payment raise');
            }
          },
        },
      ]
    );
  };

  const handleStatusUpdate = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(updateRaiseStatus({ id, status: newStatus })).unwrap();
              Alert.alert('Success', 'Status updated successfully');
              dispatch(fetchRaiseById(id));
            } catch (error) {
              Alert.alert('Error', error || 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'paid':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  if (loading && !current) return <LoadingIndicator />;
  if (!current) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Raise Information</Title>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Raise ID:</Text>
              <Text style={styles.value}>#{current.id}</Text>
            </View>

            {current.customer_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Customer:</Text>
                <Text style={styles.value}>{current.customer_name}</Text>
              </View>
            )}

            {current.project_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Project:</Text>
                <Text style={styles.value}>{current.project_name}</Text>
              </View>
            )}

            {current.amount && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Amount:</Text>
                <Text style={[styles.value, styles.amount]}>
                  ₹{parseFloat(current.amount).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {current.due_date && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Due Date:</Text>
                <Text style={styles.value}>
                  {new Date(current.due_date).toLocaleDateString('en-IN')}
                </Text>
              </View>
            )}

            {current.status && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status:</Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(current.status) }]}
                  textStyle={styles.statusText}
                >
                  {current.status}
                </Chip>
              </View>
            )}

            {current.remarks && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Remarks:</Text>
                <Text style={styles.value}>{current.remarks}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {current.payment_query_id && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Payment Query Details</Title>
              <Divider style={styles.divider} />

              {current.query_description && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{current.query_description}</Text>
                </View>
              )}

              {current.installment_name && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Installment:</Text>
                  <Text style={styles.value}>{current.installment_name}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Title>Additional Information</Title>
            <Divider style={styles.divider} />

            {current.created_by_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Created By:</Text>
                <Chip icon="account" size={20}>
                  {current.created_by_name}
                </Chip>
              </View>
            )}

            {current.created_at && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Created At:</Text>
                <Text style={styles.value}>
                  {new Date(current.created_at).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {current.updated_at && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Updated At:</Text>
                <Text style={styles.value}>
                  {new Date(current.updated_at).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {current.status?.toLowerCase() === 'pending' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Quick Actions</Title>
              <Divider style={styles.divider} />
              <View style={styles.statusButtonContainer}>
                <Button
                  mode="contained"
                  icon="check"
                  onPress={() => handleStatusUpdate('approved')}
                  style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
                >
                  Approve
                </Button>
                <Button
                  mode="contained"
                  icon="close"
                  onPress={() => handleStatusUpdate('rejected')}
                  style={[styles.statusButton, { backgroundColor: '#F44336' }]}
                >
                  Reject
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('EditPaymentRaise', { id: current.id })}
            style={styles.button}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={handleDelete}
            style={styles.button}
            textColor={theme.colors.error}
          >
            Delete
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  statusButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

export default PaymentRaiseDetailsScreen;
