import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchAllotmentById, deleteAllotment, generateLetter } from '../../../store/slices/allotmentsSlice';
import { Icon as PaperIcon } from 'react-native-paper';

const AllotmentDetailsScreen = ({ navigation, route }) => {
  const { allotmentId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: allotment, loading } = useSelector(state => state.allotments);
  const [generatingLetter, setGeneratingLetter] = useState(false);

  useEffect(() => {
    dispatch(fetchAllotmentById(allotmentId));
  }, [dispatch, allotmentId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Allotment',
      'Are you sure you want to delete this allotment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAllotment(allotmentId)).unwrap();
              Alert.alert('Success', 'Allotment deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete allotment');
            }
          },
        },
      ]
    );
  };

  const handleGenerateLetter = async () => {
    setGeneratingLetter(true);
    try {
      await dispatch(generateLetter(allotmentId)).unwrap();
      navigation.navigate('AllotmentLetter', { allotmentId });
    } catch (error) {
      Alert.alert('Error', error || 'Failed to generate letter');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (e) {
      return 'N/A';
    }
    return dateString;
  };

  if (loading || !allotment) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Allotment Details
            </Text>
            <Chip icon="file-document" style={styles.chip}>
              {allotment.allotment_number || `#${allotment.id}`}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              <PaperIcon source="office-building" size={20} /> Project Information
            </Text>
            <DetailRow label="Project" value={allotment.project_name} />
            <DetailRow label="Unit" value={allotment.unit_name} />
            <DetailRow label="Unit Size" value={`${allotment.unit_size || 'N/A'} sq ft`} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              <PaperIcon source="account" size={20} /> Customer Information
            </Text>
            <DetailRow label="Customer" value={allotment.customer_name} />
            <DetailRow label="Father's Name" value={allotment.father_name} />
            <DetailRow label="Address" value={allotment.address} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              <PaperIcon source="calendar" size={20} /> Allotment Information
            </Text>
            <DetailRow label="Allotment Date" value={formatDate(allotment.allotment_date)} />
            <DetailRow label="Status" value={allotment.status || 'Active'} />
            {allotment.remarks && <DetailRow label="Remarks" value={allotment.remarks} />}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              <PaperIcon source="clock" size={20} /> Timestamps
            </Text>
            <DetailRow label="Created At" value={formatDate(allotment.created_at)} />
            <DetailRow label="Updated At" value={formatDate(allotment.updated_at)} />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleGenerateLetter}
          loading={generatingLetter}
          disabled={generatingLetter}
          icon="file-document"
          style={styles.button}
        >
          Generate Letter
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('EditAllotment', { allotmentId })}
          icon="pencil"
          style={styles.button}
        >
          Edit
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          icon="delete"
          textColor="#EF4444"
          style={styles.button}
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text variant="bodyMedium" style={styles.label}>{label}:</Text>
    <Text variant="bodyMedium" style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 'bold', flex: 1 },
  chip: { marginLeft: 8 },
  divider: { marginVertical: 16 },
  section: { marginBottom: 8 },
  sectionTitle: { fontWeight: '600', marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  detailRow: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  label: { fontWeight: '600', minWidth: 120, color: '#6B7280' },
  value: { flex: 1, color: '#111827' },
  buttonContainer: { padding: 16, gap: 12, marginBottom: 32 },
  button: { width: '100%' },
});

export default AllotmentDetailsScreen;
