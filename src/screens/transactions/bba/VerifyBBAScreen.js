import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Card, Text, Button, TextInput, Chip, Divider, Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchBBAById, verifyBBA } from '../../../store/slices/bbaSlice';

const VerifyBBAScreen = ({ route, navigation }) => {
  const { bbaId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading: fetchLoading } = useSelector(state => state.bba);
  
  const [verificationData, setVerificationData] = useState({
    isVerified: false,
    verifiedBy: '',
    verificationNotes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bbaId) {
      dispatch(fetchBBAById(bbaId));
    }
  }, [dispatch, bbaId]);

  useEffect(() => {
    if (current) {
      setVerificationData({
        isVerified: current.is_verified || false,
        verifiedBy: current.verified_by || '',
        verificationNotes: current.verification_notes || '',
      });
    }
  }, [current]);

  const handleVerify = async () => {
    if (!verificationData.isVerified) {
      Alert.alert('Info', 'Please toggle verification status to verify');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        is_verified: verificationData.isVerified,
        verified_by: verificationData.verifiedBy,
        verification_notes: verificationData.verificationNotes,
        verified_date: new Date().toISOString().split('T')[0],
      };

      await dispatch(verifyBBA({ id: bbaId, verificationData: payload })).unwrap();
      Alert.alert('Success', 'BBA verified successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to verify BBA');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
            <Text variant="titleLarge" style={styles.title}>Verify BBA #{current.bba_id || current.id}</Text>
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
            <Text variant="titleMedium" style={styles.sectionTitle}>BBA Information</Text>
            
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
              <Text style={styles.label}>Current Status:</Text>
              <Chip
                icon={current.is_verified ? 'check-circle' : 'close-circle'}
                mode="flat"
                style={[
                  styles.verifiedChip,
                  { backgroundColor: current.is_verified ? '#D1FAE5' : '#FEE2E2' }
                ]}
              >
                {current.is_verified ? 'Verified' : 'Not Verified'}
              </Chip>
            </View>

            {current.verified_date && (
              <View style={styles.row}>
                <Text style={styles.label}>Verified Date:</Text>
                <Text style={styles.value}>{current.verified_date}</Text>
              </View>
            )}

            {current.verified_by && (
              <View style={styles.row}>
                <Text style={styles.label}>Verified By:</Text>
                <Text style={styles.value}>{current.verified_by}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Verification Details</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mark as Verified</Text>
              <Switch
                value={verificationData.isVerified}
                onValueChange={(value) => 
                  setVerificationData({ ...verificationData, isVerified: value })
                }
                color={theme.colors.primary}
              />
            </View>

            <TextInput
              label="Verified By"
              value={verificationData.verifiedBy}
              onChangeText={(text) => 
                setVerificationData({ ...verificationData, verifiedBy: text })
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Verification Notes"
              value={verificationData.verificationNotes}
              onChangeText={(text) => 
                setVerificationData({ ...verificationData, verificationNotes: text })
              }
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={loading}
              disabled={loading || !verificationData.isVerified}
              style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
              icon="check-decagram"
            >
              Verify BBA
            </Button>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditBBA', { bbaId: current.bba_id || current.id })}
              style={styles.actionButton}
            >
              Edit BBA
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
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: { fontSize: 16, fontWeight: '500' },
  input: { marginBottom: 12 },
  verifyButton: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionButton: { flex: 1 },
});

export default VerifyBBAScreen;
