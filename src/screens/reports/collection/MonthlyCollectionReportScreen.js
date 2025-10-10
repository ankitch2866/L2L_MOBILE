import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const MonthlyCollectionReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    dailyBreakdown: [],
    projectBreakdown: [],
    paymentMethodBreakdown: []
  });
  const [dailyData, setDailyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMonthlyCollection();
  }, [selectedMonth]);

  const fetchMonthlyCollection = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/transaction/monthly-collection?month=${selectedMonth}`);
      if (response.data?.success) {
        setSummary(response.data.data.summary || {});
        setDailyData(response.data.data.dailyData || []);
      }
    } catch (error) {
      console.error('Error fetching monthly collection:', error);
      Alert.alert('Error', 'Failed to load monthly collection data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMonthlyCollection();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewDailyDetails = (date) => {
    navigation.navigate('Reports', { 
      screen: 'DailyCollectionReport',
      params: { date: date }
    });
  };

  const getMonthName = (monthString) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Monthly Collection Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {getMonthName(selectedMonth)}
        </Text>
      </View>

      {/* Month Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Month
          </Text>
          <TextInput
            mode="outlined"
            label="Month"
            value={selectedMonth}
            onChangeText={setSelectedMonth}
            style={styles.monthInput}
            keyboardType="numeric"
            placeholder="YYYY-MM"
          />
        </Card.Content>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Collection
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {formatCurrency(summary.totalAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              {summary.totalTransactions} transactions
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Average Daily
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(summary.totalAmount / 30)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Per day average
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Payment Methods Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Payment Methods Breakdown
          </Text>
          <Divider style={styles.divider} />
          
          {summary.paymentMethodBreakdown?.map((method, index) => (
            <View key={index} style={styles.breakdownItem}>
              <Text variant="bodyLarge">{method.method}</Text>
              <View style={styles.breakdownRight}>
                <Text variant="titleMedium" style={styles.breakdownAmount}>
                  {formatCurrency(method.amount)}
                </Text>
                <Text variant="bodyMedium" style={styles.breakdownCount}>
                  {method.count} transactions
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Project Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Project-wise Collection
          </Text>
          <Divider style={styles.divider} />
          
          {summary.projectBreakdown?.map((project, index) => (
            <View key={index} style={styles.breakdownItem}>
              <Text variant="bodyLarge" numberOfLines={1}>
                {project.project_name}
              </Text>
              <View style={styles.breakdownRight}>
                <Text variant="titleMedium" style={styles.breakdownAmount}>
                  {formatCurrency(project.amount)}
                </Text>
                <Text variant="bodyMedium" style={styles.breakdownCount}>
                  {project.count} transactions
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleExportReport}
          icon="download"
          style={styles.actionButton}
        >
          Export Report
        </Button>
      </View>

      {/* Daily Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Daily Breakdown
          </Text>
          <Divider style={styles.divider} />
          
          {dailyData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title>Amount</DataTable.Title>
                  <DataTable.Title>Transactions</DataTable.Title>
                  <DataTable.Title>Action</DataTable.Title>
                </DataTable.Header>
                
                {dailyData.map((day, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {formatDate(day.date)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.amountText}>
                        {formatCurrency(day.amount)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {day.count}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewDailyDetails(day.date)}
                      >
                        View
                      </Button>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          ) : (
            <EmptyState
              title="No Data Available"
              description="No collection data found for the selected month"
            />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  monthInput: {
    marginTop: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  summaryTitle: {
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summarySubtext: {
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownAmount: {
    fontWeight: 'bold',
    color: '#059669',
  },
  breakdownCount: {
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
});

export default MonthlyCollectionReportScreen;
