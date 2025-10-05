import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchCoApplicantById } from '../../../store/slices/coApplicantsSlice';

const CoApplicantDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.coApplicants);

  useEffect(() => {
    dispatch(fetchCoApplicantById(id));
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
            CA-{current.co_applicant_id}
          </Text>
          
          {current.is_co_applicant && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelMedium" style={styles.badgeText}>Co-Applicant</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Personal Information" />
        <Card.Content>
          <InfoRow label="Guardian Relation" value={current.guardian_relation} />
          <InfoRow label="Guardian Name" value={current.guardian_name} />
          <InfoRow label="Date of Birth" value={current.dob ? new Date(current.dob).toLocaleDateString() : 'N/A'} />
          <InfoRow label="Nationality" value={current.nationality} />
          <InfoRow label="Address" value={current.address} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Contact Information" />
        <Card.Content>
          <InfoRow label="Mobile" value={current.mobile} />
          <InfoRow label="Phone" value={current.phone} />
          <InfoRow label="Email" value={current.email} />
          <InfoRow label="Fax" value={current.fax} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Professional Details" />
        <Card.Content>
          <InfoRow label="Occupation" value={current.occupation} />
          <InfoRow label="PAN No." value={current.pan_no} />
          <InfoRow label="Income Tax Ward No." value={current.income_tax_ward_no} />
          <InfoRow label="District No." value={current.dist_no} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Agreement Details" />
        <Card.Content>
          <InfoRow 
            label="Date of Agreement" 
            value={current.date_of_agreement ? new Date(current.date_of_agreement).toLocaleDateString() : 'N/A'} 
          />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditCoApplicant', { id: current.co_applicant_id })}
          style={styles.button}
        >
          Edit Co-Applicant
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold' },
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

export default CoApplicantDetailsScreen;
