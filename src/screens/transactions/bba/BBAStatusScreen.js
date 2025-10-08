import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchBBAById, updateStatus } from '../../../store/slices/bbaSlice';
import { Dropdown } from '../../../components/common';

const BBAStatusScreen = ({ route, navigation }) => {
  const { bbaId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.bba);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (bbaId) {
      dispatch(fetchBBAById(bbaId));
    }
  }, [dispatch, bbaId]);

  useEffect(() => {
    if (current) {
      setNewStatus(current.status || 'pending');
    }
  }, [current]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === current?.status) {
      Alert.alert('Info', 'Please select a different status');
      return;
    }

    setUpdating(true);
    try {
      await dispatch(updateStatus({ id: bbaId, status: newStatus })).unwrap();
      Alert.alert('Success', 'BBA status updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update BBA status');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!current) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text>BBA record not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>BBA #{current.bba_id || current.id}</Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    current.status === 'completed'
                      ? '#D1FAE5'
                      : current.status === 'pending'
                      ? '#FEF3C7'
                      : '#E0E7FF',
                },
              ]}
            >
              {current.status || 'N/A'}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>BBA Details</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{current.customer_name || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Project:</Text>
              <Text style={styles.value}>{current.project_name || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Unit:</Text>
              <Text style={styles.value}>{current.unit_no || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>BBA Date:</Text>
              <Text style={styles.value}>{current.bba_date || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Verified:</Text>
              <Chip
                icon={current.is_verified ? 'check-circle' : 'close-circle'}
                mode="flat"
                style={[
                  styles.verifiedChip,
                  { backgroundColor: current.is_verified ? '#D1FAE5' : '#FEE2E2' }
                ]}
              >
                {current.is_verified ? 'Yes' : 'No'}
              </Chip>
            </View>

            {current.verified_date && (
              <View style={styles.row}>
                <Text style={styles.label}>Verified Date:</Text>
                <Text style={styles.value}>{current.verified_date}</Text>
              </View>
            )}

            {current.remarks && (
              <View style={styles.row}>
                <Text style={styles.label}>Remarks:</Text>
                <Text style={styles.value}>{current.remarks}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Update Status</Text>
            
            <Dropdown
              label="New Status"
              value={newStatus}
              onValueChange={setNewStatus}
              items={statusOptions}
            />

            <Button
              mode="contained"
              onPress={handleUpdateStatus}
              loading={updating}
              disabled={updating || newStatus === current.status}
              style={[styles.updateButton, { backgroundColor: theme.colors.primary }]}
            >
              Update Status
            </Button>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditBBA', { bbaId: current.bba_id || current.id })}
              style={styles.actionButton}
            >
              Edit BBA
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('VerifyBBA', { bbaId: current.bba_id || current.id })}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            >
              Verify BBA
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  card: { margin: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 'bold', flex: 1 },
  statusChip: { marginLeft: 8 },
  divider: { marginVertical: 16 },
  section: { marginBottom: 8 },
  sectionTitle: { fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  label: { fontWeight: '600', width: 120 },
  value: { flex: 1 },
  verifiedChip: { flex: 0 },
  updateButton: { marginTop: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionButton: { flex: 1 },
});

export default BBAStatusScreen;
