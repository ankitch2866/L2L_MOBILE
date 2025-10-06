import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchAllotmentById } from '../../../store/slices/allotmentsSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AllotmentLetterScreen = ({ navigation, route }) => {
  const { allotmentId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current: allotment, loading } = useSelector(state => state.allotments);

  useEffect(() => {
    dispatch(fetchAllotmentById(allotmentId));
  }, [dispatch, allotmentId]);

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

  const handleShare = async () => {
    try {
      const letterContent = generateLetterText();
      await Share.share({
        message: letterContent,
        title: 'Allotment Letter',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share letter');
    }
  };

  const generateLetterText = () => {
    if (!allotment) return '';
    
    return `
ALLOTMENT LETTER

Date: ${formatDate(new Date())}
Allotment Number: ${allotment.allotment_number || allotment.id}

To,
${allotment.customer_name}
${allotment.address || ''}

Dear ${allotment.customer_name},

Subject: Allotment of Unit in ${allotment.project_name}

We are pleased to inform you that the following unit has been allotted to you:

Project: ${allotment.project_name}
Unit: ${allotment.unit_name}
Unit Size: ${allotment.unit_size || 'N/A'} sq ft
Allotment Date: ${formatDate(allotment.allotment_date)}

This allotment is subject to the terms and conditions as per the agreement.

${allotment.remarks ? `\nRemarks: ${allotment.remarks}` : ''}

Please contact us for further details and documentation.

Thank you for choosing us.

Sincerely,
Management Team
    `.trim();
  };

  if (loading || !allotment) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
        <Card.Content>
          <View style={styles.letterHeader}>
            <Text variant="headlineMedium" style={styles.letterTitle}>
              ALLOTMENT LETTER
            </Text>
            <Text variant="bodyMedium" style={styles.date}>
              Date: {formatDate(new Date())}
            </Text>
            <Text variant="bodyMedium" style={styles.allotmentNumber}>
              Allotment No: {allotment.allotment_number || allotment.id}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.toLabel}>To,</Text>
            <Text variant="titleMedium" style={styles.customerName}>
              {allotment.customer_name}
            </Text>
            {allotment.address && (
              <Text variant="bodyMedium" style={styles.address}>
                {allotment.address}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.greeting}>
              Dear {allotment.customer_name},
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.subject}>
              Subject: Allotment of Unit in {allotment.project_name}
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.bodyText}>
              We are pleased to inform you that the following unit has been allotted to you:
            </Text>
          </View>

          <View style={[styles.section, styles.detailsBox]}>
            <DetailRow label="Project" value={allotment.project_name} />
            <DetailRow label="Unit" value={allotment.unit_name} />
            <DetailRow label="Unit Size" value={`${allotment.unit_size || 'N/A'} sq ft`} />
            <DetailRow label="Allotment Date" value={formatDate(allotment.allotment_date)} />
          </View>

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.bodyText}>
              This allotment is subject to the terms and conditions as per the agreement.
            </Text>
          </View>

          {allotment.remarks && (
            <View style={styles.section}>
              <Text variant="bodyMedium" style={styles.remarksLabel}>Remarks:</Text>
              <Text variant="bodyMedium" style={styles.remarks}>
                {allotment.remarks}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Please contact us for further details and documentation.
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Thank you for choosing us.
            </Text>
          </View>

          <View style={styles.signature}>
            <Text variant="bodyMedium" style={styles.signatureText}>
              Sincerely,
            </Text>
            <Text variant="bodyMedium" style={styles.signatureText}>
              Management Team
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          icon="share-variant"
          style={styles.button}
        >
          Share Letter
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
          style={styles.button}
        >
          Back
        </Button>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text variant="bodyMedium" style={styles.detailLabel}>{label}:</Text>
    <Text variant="bodyMedium" style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  letterHeader: { alignItems: 'center', marginBottom: 16 },
  letterTitle: { fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  date: { color: '#6B7280', marginBottom: 4 },
  allotmentNumber: { color: '#6B7280', fontWeight: '600' },
  divider: { marginVertical: 16 },
  section: { marginBottom: 16 },
  toLabel: { color: '#6B7280', marginBottom: 4 },
  customerName: { fontWeight: '600', color: '#111827' },
  address: { color: '#6B7280', marginTop: 4 },
  greeting: { color: '#111827' },
  subject: { fontWeight: '600', color: '#111827', textDecorationLine: 'underline' },
  bodyText: { color: '#111827', lineHeight: 22 },
  detailsBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontWeight: '600', minWidth: 120, color: '#6B7280' },
  detailValue: { flex: 1, color: '#111827' },
  remarksLabel: { fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  remarks: { color: '#111827', fontStyle: 'italic' },
  signature: { marginTop: 32, alignItems: 'flex-end' },
  signatureText: { color: '#111827', marginBottom: 4 },
  buttonContainer: { padding: 16, gap: 12, marginBottom: 32 },
  button: { width: '100%' },
});

export default AllotmentLetterScreen;
