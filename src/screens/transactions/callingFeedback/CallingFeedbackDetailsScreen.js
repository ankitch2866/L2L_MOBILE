import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { fetchFeedbackById } from '../../../store/slices/callingFeedbackSlice';
import { LoadingIndicator } from '../../../components/common';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const CallingFeedbackDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { feedbackId } = route.params;
  const { currentFeedback, loading } = useSelector(state => state.callingFeedback);
  
  const [feedback, setFeedback] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={{ marginLeft: -8 }}
            textColor="#007AFF"
          >
            Back
          </Button>
        ),
      });
    }, [navigation])
  );

  useEffect(() => {
    if (feedbackId) {
      dispatch(fetchFeedbackById(feedbackId));
    }
  }, [dispatch, feedbackId]);

  useEffect(() => {
    if (currentFeedback) {
      setFeedback(currentFeedback);
    }
  }, [currentFeedback]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Follow-up': return '#3B82F6';
      case 'Payment Reminder': return '#F59E0B';
      case 'Issue Resolution': return '#EF4444';
      case 'General Inquiry': return '#10B981';
      case 'Complaint': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!feedback) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.errorTitle}>Feedback Not Found</Text>
            <Text variant="bodyMedium" style={styles.errorText}>
              The requested calling feedback could not be found.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.customerInfo}>
              <Text variant="headlineSmall" style={styles.customerName}>
                {feedback.customer_name || 'Unknown Customer'}
              </Text>
              <Text variant="bodyMedium" style={styles.projectName}>
                {feedback.project_name || 'No Project'}
              </Text>
            </View>
            <Chip
              style={[styles.typeChip, { backgroundColor: getTypeColor(feedback.calling_type) + '20' }]}
              textStyle={{ color: getTypeColor(feedback.calling_type) }}
            >
              {feedback.calling_type || 'Unknown Type'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Basic Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Calling Date:</Text>
            <Text style={styles.value}>{formatDate(feedback.calling_date)}</Text>
          </View>

          {feedback.next_calling_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Next Calling Date:</Text>
              <Text style={[styles.value, styles.nextCallDate]}>
                {formatDate(feedback.next_calling_date)}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(feedback.status) + '20' }]}
              textStyle={{ color: getStatusColor(feedback.status) }}
            >
              {feedback.status || 'Unknown'}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDate(feedback.created_at)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Call Purpose */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Call Purpose</Text>
          
          <View style={styles.purposeContainer}>
            <View style={styles.purposeItem}>
              <Text style={styles.purposeLabel}>Payment Related:</Text>
              <Chip
                style={[styles.purposeChip, { 
                  backgroundColor: feedback.is_payment ? '#10B98120' : '#6B728020' 
                }]}
                textStyle={{ 
                  color: feedback.is_payment ? '#10B981' : '#6B7280' 
                }}
              >
                {feedback.is_payment ? 'Yes' : 'No'}
              </Chip>
            </View>

            <View style={styles.purposeItem}>
              <Text style={styles.purposeLabel}>Loan Related:</Text>
              <Chip
                style={[styles.purposeChip, { 
                  backgroundColor: feedback.is_loan ? '#10B98120' : '#6B728020' 
                }]}
                textStyle={{ 
                  color: feedback.is_loan ? '#10B981' : '#6B7280' 
                }}
              >
                {feedback.is_loan ? 'Yes' : 'No'}
              </Chip>
            </View>

            <View style={styles.purposeItem}>
              <Text style={styles.purposeLabel}>Promise to Pay:</Text>
              <Chip
                style={[styles.purposeChip, { 
                  backgroundColor: feedback.promise_to_pay ? '#10B98120' : '#6B728020' 
                }]}
                textStyle={{ 
                  color: feedback.promise_to_pay ? '#10B981' : '#6B7280' 
                }}
              >
                {feedback.promise_to_pay ? 'Yes' : 'No'}
              </Chip>
            </View>
          </View>

          {feedback.amount_committed_to_pay && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount Committed to Pay:</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(feedback.amount_committed_to_pay)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
          
          {feedback.todays_description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Today's Description:</Text>
              <Text style={styles.descriptionText}>{feedback.todays_description}</Text>
            </View>
          )}

          {feedback.issues_description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Issues Description:</Text>
              <Text style={styles.descriptionText}>{feedback.issues_description}</Text>
            </View>
          )}

          {feedback.remarks_note && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Additional Remarks:</Text>
              <Text style={styles.descriptionText}>{feedback.remarks_note}</Text>
            </View>
          )}

          {!feedback.todays_description && !feedback.issues_description && !feedback.remarks_note && (
            <Text style={styles.noDescription}>No description available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('EditCallingFeedback', { feedbackId: feedback.feedback_id })}
          style={styles.actionButton}
        >
          Edit Feedback
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Close
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  projectName: {
    color: '#6B7280',
    marginTop: 4,
  },
  typeChip: {
    borderRadius: 12,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
  },
  nextCallDate: {
    color: '#059669',
    fontWeight: '500',
  },
  statusChip: {
    borderRadius: 12,
  },
  purposeContainer: {
    marginBottom: 16,
  },
  purposeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purposeLabel: {
    fontSize: 16,
    color: '#374151',
  },
  purposeChip: {
    borderRadius: 12,
  },
  amountContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  noDescription: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#FEF2F2',
  },
  errorTitle: {
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#7F1D1D',
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
  },
});

export default CallingFeedbackDetailsScreen;
