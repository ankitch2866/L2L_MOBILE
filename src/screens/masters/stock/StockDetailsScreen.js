import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchStockById } from '../../../store/slices/stocksSlice';

const StockDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.stocks);

  useEffect(() => {
    dispatch(fetchStockById(id));
  }, [dispatch, id]);

  if (loading || !current) return <LoadingIndicator />;

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.label}>{label}:</Text>
      <Text variant="bodyMedium" style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'free':
        return theme.colors.success || '#10B981';
      case 'hold':
        return theme.colors.warning || '#F59E0B';
      case 'booked':
        return theme.colors.info || '#3B82F6';
      case 'allotted':
        return theme.colors.error || '#EF4444';
      default:
        return theme.colors.outline || '#6B7280';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.header}>
            {current.unit_name}
          </Text>
          <Text variant="bodyMedium" style={styles.subheader}>
            Stock ID: {current.stock_id}
          </Text>
          
          <View style={styles.chipRow}>
            <Chip 
              style={[styles.chip, { backgroundColor: getStatusColor(current.unit_status) }]}
              textStyle={styles.chipText}
            >
              {current.unit_status?.toUpperCase() || 'N/A'}
            </Chip>
            {current.hold_till_date && (
              <Chip 
                icon="clock"
                style={[styles.chip, { backgroundColor: theme.colors.errorContainer }]}
                textStyle={{ color: theme.colors.error }}
              >
                Hold
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Project Information" />
        <Card.Content>
          <InfoRow label="Project Name" value={current.project_name} />
          <InfoRow label="Project ID" value={current.project_id} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Unit Information" />
        <Card.Content>
          <InfoRow label="Unit Name" value={current.unit_name} />
          <InfoRow label="Unit Type" value={current.unit_type} />
          <InfoRow label="Unit Size" value={current.unit_size ? `${current.unit_size} sq.ft` : 'N/A'} />
          <InfoRow label="BSP" value={formatCurrency(current.bsp)} />
          <InfoRow label="Status" value={current.unit_status} />
          {current.unit_desc && (
            <InfoRow label="Description" value={current.unit_desc} />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Stock Information" />
        <Card.Content>
          <InfoRow label="Broker" value={current.broker_name} />
          <InfoRow label="Stock Date" value={formatDate(current.stock_date)} />
          {current.hold_till_date && (
            <InfoRow label="Hold Till Date" value={formatDate(current.hold_till_date)} />
          )}
          {current.remarks && (
            <View style={styles.remarksContainer}>
              <Text variant="bodyMedium" style={styles.label}>Remarks:</Text>
              <Text variant="bodyMedium" style={styles.remarksText}>
                {current.remarks}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Timestamps" />
        <Card.Content>
          <InfoRow label="Created At" value={formatDate(current.created_at)} />
          <InfoRow label="Updated At" value={formatDate(current.updated_at)} />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditStock', { id: current.stock_id })}
          style={styles.button}
        >
          Edit Stock
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, marginBottom: 8 },
  header: { fontWeight: 'bold', marginBottom: 4 },
  subheader: { color: '#6B7280', marginBottom: 12 },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    height: 32,
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { width: 140, color: '#6B7280' },
  value: { flex: 1, fontWeight: '500' },
  remarksContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  remarksText: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  actions: { padding: 16 },
  button: { marginBottom: 16 },
});

export default StockDetailsScreen;
