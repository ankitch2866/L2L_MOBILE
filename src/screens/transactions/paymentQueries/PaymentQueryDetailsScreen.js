import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Divider, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchQueryById, deleteQuery, clearCurrentQuery } from '../../../store/slices/paymentQueriesSlice';

const PaymentQueryDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.paymentQueries);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchQueryById(id));
    
    return () => {
      dispatch(clearCurrentQuery());
    };
  }, [dispatch, id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchQueryById(id));
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment Query',
      'Are you sure you want to delete this payment query?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteQuery(id)).unwrap();
              Alert.alert('Success', 'Payment query deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete payment query');
            }
          },
        },
      ]
    );
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
            <Title>Query Information</Title>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Query ID:</Text>
              <Text style={styles.value}>#{current.id}</Text>
            </View>

            {current.description && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{current.description}</Text>
              </View>
            )}

            {current.project_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Project:</Text>
                <Text style={styles.value}>{current.project_name}</Text>
              </View>
            )}

            {current.date && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>
                  {new Date(current.date).toLocaleDateString('en-IN')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Installment Details</Title>
            <Divider style={styles.divider} />

            {current.installment_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Installment:</Text>
                <Text style={styles.value}>{current.installment_name}</Text>
              </View>
            )}

            {current.plan_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Payment Plan:</Text>
                <Text style={styles.value}>{current.plan_name}</Text>
              </View>
            )}

            {current.due_days !== null && current.due_days !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Due Days:</Text>
                <Text style={styles.value}>{current.due_days} days</Text>
              </View>
            )}

            {current.value && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Value:</Text>
                <Text style={[styles.value, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {current.is_percentage 
                    ? `${current.value}%` 
                    : `₹${parseFloat(current.value).toLocaleString('en-IN')}`}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {current.created_by_name && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Additional Information</Title>
              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>Created By:</Text>
                <Chip icon="account" size={20}>
                  {current.created_by_name}
                </Chip>
              </View>

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
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('EditPaymentQuery', { id: current.id })}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

export default PaymentQueryDetailsScreen;
