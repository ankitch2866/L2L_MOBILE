import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchBankById } from '../../../store/slices/banksSlice';

const BankDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.banks);

  useEffect(() => {
    dispatch(fetchBankById(id));
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
            {current.bank_name}
          </Text>
          <Text variant="bodyMedium" style={styles.subheader}>
            Bank ID: {current.bank_id}
          </Text>
          
          <Chip 
            icon="bank" 
            style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ color: theme.colors.primary }}
          >
            {current.branch_name}
          </Chip>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Bank Information" />
        <Card.Content>
          <InfoRow label="Branch Name" value={current.branch_name} />
          <InfoRow label="IFSC Code" value={current.ifsc_code} />
          <InfoRow label="Address" value={current.address} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Contact Information" />
        <Card.Content>
          <InfoRow label="Contact Person" value={current.contact_person} />
          <InfoRow label="Contact Number" value={current.contact_number} />
          <InfoRow label="Email" value={current.email} />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditBank', { id: current.bank_id })}
          style={styles.button}
        >
          Edit Bank
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

export default BankDetailsScreen;
