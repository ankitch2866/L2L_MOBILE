import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, Chip, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchFeedbacks } from '../../../store/slices/callingFeedbackSlice';

const CallingFeedbackDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { feedbacks, loading, stats } = useSelector(state => state.callingFeedback);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchFeedbacks());
    // DISABLED: fetchFeedbackStats doesn't exist in backend
    // dispatch(fetchFeedbackStats());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchFeedbacks()),
      // DISABLED: fetchFeedbackStats doesn't exist in backend
      // dispatch(fetchFeedbackStats())
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>{stats?.total || 0}</Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>Total</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#10B981' }]}>{stats?.completed || 0}</Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>Completed</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#F59E0B' }]}>{stats?.pending || 0}</Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>Pending</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Feedbacks List */}
        <View style={styles.listContainer}>
          {feedbacks && feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <Card key={feedback.feedback_id} style={[styles.feedbackCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.customerInfo}>
                      <Text variant="titleMedium" style={[styles.customerName, { color: theme.colors.onSurface }]}>
                        {feedback.customer_name || 'Unknown Customer'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.projectName, { color: theme.colors.onSurfaceVariant }]}>
                        {feedback.project_name || 'No Project'}
                      </Text>
                    </View>
                    <Chip style={[styles.typeChip, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Text style={{ color: theme.colors.onPrimaryContainer }}>{feedback.calling_type || 'Unknown'}</Text>
                    </Chip>
                  </View>

                  <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurface }]}>
                    {feedback.todays_description || feedback.issues_description || 'No description available'}
                  </Text>

                  {feedback.next_calling_date && (
                    <View style={styles.nextCallContainer}>
                      <Text variant="bodySmall" style={[styles.nextCallLabel, { color: theme.colors.onSurfaceVariant }]}>Next Call:</Text>
                      <Text variant="bodySmall" style={[styles.nextCallDate, { color: theme.colors.primary }]}>
                        {formatDate(feedback.next_calling_date)}
                      </Text>
                    </View>
                  )}

                  {feedback.amount_committed_to_pay && (
                    <View style={styles.amountContainer}>
                      <Text variant="bodySmall" style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}>Amount Committed:</Text>
                      <Text variant="bodySmall" style={[styles.amountValue, { color: '#10B981' }]}>
                        {formatCurrency(feedback.amount_committed_to_pay)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.metaInfo}>
                    <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(feedback.created_at)}
                    </Text>
                    <Text variant="bodySmall" style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                      Status: {feedback.status || 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('CallingFeedbackDetails', { feedbackId: feedback.feedback_id })}
                      style={styles.actionButton}
                      compact
                    >
                      View
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('EditCallingFeedback', { feedbackId: feedback.feedback_id })}
                      style={styles.actionButton}
                      compact
                    >
                      Edit
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyContent}>
                <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No Feedbacks</Text>
                <Text variant="bodyMedium" style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
                  No calling feedbacks found. Start by adding a new feedback.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('AddCallingFeedback')}
                  style={styles.emptyButton}
                  buttonColor={theme.colors.primary}
                >
                  Add Feedback
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddCallingFeedback')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    minHeight: 100,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  feedbackCard: {
    marginBottom: 12,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
  },
  projectName: {
    marginTop: 2,
  },
  typeChip: {
    borderRadius: 12,
  },
  description: {
    marginBottom: 8,
    lineHeight: 20,
  },
  nextCallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextCallLabel: {
    marginRight: 8,
  },
  nextCallDate: {
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountLabel: {
    marginRight: 8,
  },
  amountValue: {
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dateText: {
    // Color will be set dynamically
  },
  statusText: {
    // Color will be set dynamically
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default CallingFeedbackDashboardScreen;