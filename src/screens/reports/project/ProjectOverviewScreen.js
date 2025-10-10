import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ProjectOverviewScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalUnits: 0,
    totalCollection: 0,
    totalCustomers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjectsOverview();
  }, [statusFilter]);

  const fetchProjectsOverview = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await api.get(`/api/master/projects?${params}`);
      if (response.data?.success) {
        setProjects(response.data.data.projects || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching projects overview:', error);
      Alert.alert('Error', 'Failed to load projects overview');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjectsOverview();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const handleViewProject = (projectId) => {
    navigation.navigate('Projects', { 
      screen: 'ProjectDetails', 
      params: { projectId: projectId } 
    });
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    return project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.status?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          Project Overview Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          All projects summary and analysis
        </Text>
      </View>

      {/* Summary Cards - First Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Projects
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalProjects}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All projects
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Active
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.activeValue]}>
              {summary.activeProjects}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Active projects
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Summary Cards - Second Row */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Completed
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.completedValue]}>
              {summary.completedProjects}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Completed projects
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Units
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalUnits}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All units
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Financial Summary */}
      <View style={styles.financialContainer}>
        <Card style={styles.financialCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Collection
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.collectionValue]}>
              {formatCurrency(summary.totalCollection)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              From all projects
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.financialCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Customers
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalCustomers}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              All customers
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Filters */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Filters
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search by project name, company, or status"
          />
          <View style={styles.statusFilter}>
            <Text variant="bodyMedium" style={styles.filterLabel}>Status:</Text>
            <View style={styles.statusChips}>
              {['all', 'active', 'completed', 'cancelled'].map((status) => (
                <Chip
                  key={status}
                  selected={statusFilter === status}
                  onPress={() => setStatusFilter(status)}
                  style={[
                    styles.statusChip,
                    statusFilter === status && styles.selectedStatusChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>
          </View>
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

      {/* Projects Table */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Projects ({filteredProjects.length})
            </Text>
          </View>
          <Divider style={styles.divider} />
          
          {filteredProjects.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Project</DataTable.Title>
                  <DataTable.Title>Company</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Units</DataTable.Title>
                  <DataTable.Title>Collection</DataTable.Title>
                  <DataTable.Title>Start Date</DataTable.Title>
                  <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                
                {filteredProjects.map((project, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {project.project_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {project.company_name}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          project.status === 'active' && styles.activeChip,
                          project.status === 'completed' && styles.completedChip,
                          project.status === 'cancelled' && styles.cancelledChip
                        ]}
                      >
                        {project.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">
                        {project.total_units || 0}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" style={styles.collectionText}>
                        {formatCurrency(project.total_collection || 0)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">
                        {formatDate(project.start_date)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewProject(project.project_id)}
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
              title="No Projects Found"
              description="No projects found for the selected filters"
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
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
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
  activeValue: {
    color: '#059669',
  },
  completedValue: {
    color: '#3B82F6',
  },
  financialContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  financialCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  collectionValue: {
    color: '#059669',
  },
  searchInput: {
    marginTop: 8,
  },
  statusFilter: {
    marginTop: 16,
  },
  filterLabel: {
    marginBottom: 8,
    color: '#374151',
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    backgroundColor: '#F3F4F6',
  },
  selectedStatusChip: {
    backgroundColor: '#EF4444',
  },
  activeChip: {
    backgroundColor: '#D1FAE5',
  },
  completedChip: {
    backgroundColor: '#DBEAFE',
  },
  cancelledChip: {
    backgroundColor: '#FEE2E2',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  collectionText: {
    fontWeight: 'bold',
    color: '#059669',
  },
});

export default ProjectOverviewScreen;
