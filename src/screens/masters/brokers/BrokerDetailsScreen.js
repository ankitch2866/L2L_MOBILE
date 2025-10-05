import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchBrokerById } from '../../../store/slices/brokersSlice';

const BrokerDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.brokers);

  useEffect(() => {
    dispatch(fetchBrokerById(id));
  }, [dispatch, id]);

  if (loading || !current) return <LoadingIndicator />;

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={styles.label}>{label}:</Text>
      <Text variant="bodyMedium" style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.header}>
            {current.name}
          </Text>
          <Text variant="bodyMedium" style={styles.subheader}>
            Broker ID: {current.broker_id}
          </Text>
          
          {current.net_commission_rate && (
            <Chip 
              icon="percent" 
              style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: theme.colors.primary }}
            >
              Commission Rate: {current.net_commission_rate}%
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Contact Information" />
        <Card.Content>
          <InfoRow label="Mobile" value={current.mobile} />
          <InfoRow label="Phone" value={current.phone} />
          <InfoRow label="Email" value={current.email} />
          <InfoRow label="Fax" value={current.fax} />
          <InfoRow label="Address" value={current.address} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Tax & Legal Information" />
        <Card.Content>
          <InfoRow label="PAN No." value={current.pan_no} />
          <InfoRow label="Income Tax Ward No." value={current.income_tax_ward_no} />
          <InfoRow label="District No." value={current.dist_no} />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditBroker', { id: current.broker_id })}
          style={styles.button}
        >
          Edit Broker
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
  chip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: { width: 140, color: '#6B7280' },
  value: { flex: 1, fontWeight: '500' },
  actions: { padding: 16 },
  button: { marginBottom: 16 },
});

export default BrokerDetailsScreen;
