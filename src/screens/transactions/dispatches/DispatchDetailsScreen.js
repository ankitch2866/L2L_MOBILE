import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Divider, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchDispatchById, deleteDispatch, clearCurrentDispatch } from '../../../store/slices/dispatchesSlice';

const DispatchDetailsScreen = ({ route, navigation }) => {
  const { dispatchId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: dispatchData, loading } = useSelector(state => state.dispatches);

  useEffect(() => {
    dispatch(fetchDispatchById(dispatchId));
    return () => {
      dispatch(clearCurrentDispatch());
    };
  }, [dispatch, dispatchId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return 'Invalid Date';
    }
    return 'Invalid Date';
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dispatch',
      'Are you sure you want to delete this dispatch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteDispatch(dispatchId)).unwrap();
              Alert.alert('Success', 'Dispatch deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete dispatch');
            }
          },
        },
      ]
    );
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'BY_COURIER':
        return '#3B82F6';
      case 'BY_HAND':
        return '#10B981';
      case 'BY_POST':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'INDIVIDUAL':
        return '#8B5CF6';
      case 'COMPANY':
        return '#EC4899';
      case 'PARTNERSHIP':
        return '#14B8A6';
      case 'PROPRIETORSHIP':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  if (loading || !dispatchData) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Dispatch #{dispatchData.id}
            </Text>
            <View style={styles.chipContainer}>
              <Chip
                icon="account"
                style={[styles.chip, { backgroundColor: getCustomerTypeColor(dispatchData.customerType) }]}
                textStyle={styles.chipText}
              >
                {dispatchData.customerType}
              </Chip>
              {dispatchData.modeOfLetterSending && (
                <Chip
                  icon="truck-delivery"
                  style={[styles.chip, { backgroundColor: getModeColor(dispatchData.modeOfLetterSending) }]}
                  textStyle={styles.chipText}
                >
                  {dispatchData.modeOfLetterSending.replace('BY_', '')}
                </Chip>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Letter Type:</Text>
              <Text style={styles.value}>{dispatchData.letterType || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Dispatch Date:</Text>
              <Text style={styles.value}>{formatDate(dispatchData.dispatchDate)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{dispatchData.customer_name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer Type:</Text>
              <Text style={styles.value}>{dispatchData.customerType || 'N/A'}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Property Details</Text>
            
            {dispatchData.unitNo && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Unit:</Text>
                <Text style={styles.value}>{dispatchData.unitNo}</Text>
              </View>
            )}

            {dispatchData.project_name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Project:</Text>
                <Text style={styles.value}>{dispatchData.project_name}</Text>
              </View>
            )}

            {dispatchData.location && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{dispatchData.location}</Text>
              </View>
            )}

            {!dispatchData.unitNo && !dispatchData.project_name && !dispatchData.location && (
              <Text style={styles.noData}>No property details available</Text>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mode:</Text>
              <Text style={styles.value}>
                {dispatchData.modeOfLetterSending?.replace('BY_', '') || 'N/A'}
              </Text>
            </View>

            {dispatchData.modeOfLetterSending === 'BY_COURIER' && (
              <>
                {dispatchData.courierCompany && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Courier Company:</Text>
                    <Text style={styles.value}>{dispatchData.courierCompany}</Text>
                  </View>
                )}

                {dispatchData.consignmentNo && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Consignment No:</Text>
                    <Text style={styles.value}>{dispatchData.consignmentNo}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {dispatchData.remarks && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Remarks</Text>
                <Text style={styles.remarks}>{dispatchData.remarks}</Text>
              </View>
            </>
          )}

          {(dispatchData.created_at || dispatchData.updatedAt) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Timestamps</Text>
                
                {dispatchData.created_at && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Created:</Text>
                    <Text style={styles.value}>{formatDate(dispatchData.created_at)}</Text>
                  </View>
                )}

                {dispatchData.updatedAt && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Last Updated:</Text>
                    <Text style={styles.value}>{formatDate(dispatchData.updatedAt)}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditDispatch', { dispatchId })}
          style={styles.button}
          icon="pencil"
        >
          Edit
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.button}
          buttonColor="#FEE2E2"
          textColor="#EF4444"
          icon="delete"
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, elevation: 2 },
  header: { marginBottom: 16 },
  title: { fontWeight: 'bold', marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 28 },
  chipText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  divider: { marginVertical: 16 },
  section: { marginBottom: 8 },
  sectionTitle: { fontWeight: '600', marginBottom: 12, color: '#1F2937' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 140, color: '#6B7280', fontSize: 14 },
  value: { flex: 1, color: '#1F2937', fontSize: 14, fontWeight: '500' },
  remarks: { color: '#1F2937', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  noData: { color: '#9CA3AF', fontSize: 14, fontStyle: 'italic' },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  button: { flex: 1 },
});

export default DispatchDetailsScreen;
