import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Divider, DataTable } from 'react-native-paper';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ProjectReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [summary, setSummary] = useState({
    totalUnits: 0,
    bookedUnits: 0,
    availableUnits: 0,
    totalCustomers: 0,
    totalCollection: 0,
    pendingAmount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectReport();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/master/projects');
      if (response.data?.success) {
        setProjects(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProject(response.data.data[0].project_id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    }
  };

  const fetchProjectReport = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/master/project/${selectedProject}`);
      if (response.data?.success) {
        setProjectData(response.data.data.project);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching project report:', error);
      Alert.alert('Error', 'Failed to load project report');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjectReport();
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
          Project Report
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Comprehensive project analysis
        </Text>
      </View>

      {/* Project Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Select Project
          </Text>
          <View style={styles.projectSelector}>
            {projects.map((project) => (
              <Chip
                key={project.project_id}
                selected={selectedProject === project.project_id.toString()}
                onPress={() => setSelectedProject(project.project_id.toString())}
                style={[
                  styles.projectChip,
                  selectedProject === project.project_id.toString() && styles.selectedChip
                ]}
                textStyle={styles.chipText}
              >
                {project.project_name}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Project Information */}
      {projectData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Project Information
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.projectInfo}>
              <Text variant="bodyLarge" style={styles.projectName}>
                {projectData.project_name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                Company: {projectData.company_name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                Address: {projectData.address}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                Status: {projectData.status}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                Start Date: {formatDate(projectData.start_date)}
              </Text>
              <Text variant="bodyMedium" style={styles.projectDetails}>
                End Date: {formatDate(projectData.end_date)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
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

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Booked Units
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.bookedValue]}>
              {summary.bookedUnits}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              {Math.round((summary.bookedUnits / summary.totalUnits) * 100)}% booked
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Available Units
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.availableValue]}>
              {summary.availableUnits}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Available for booking
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Total Customers
            </Text>
            <Text variant="headlineMedium" style={styles.summaryValue}>
              {summary.totalCustomers}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Active customers
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
              From all customers
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.financialCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Pending Amount
            </Text>
            <Text variant="headlineMedium" style={[styles.summaryValue, styles.pendingValue]}>
              {formatCurrency(summary.pendingAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.summarySubtext}>
              Outstanding payments
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Search */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Search
          </Text>
          <TextInput
            mode="outlined"
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            placeholder="Search project details"
          />
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
        <Button
          mode="outlined"
          onPress={() => handleViewProject(selectedProject)}
          icon="information"
          style={styles.actionButton}
        >
          View Project
        </Button>
      </View>

      {/* Project Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Project Statistics
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.statisticsContainer}>
            <View style={styles.statisticItem}>
              <Text variant="bodyMedium" style={styles.statisticLabel}>
                Booking Rate
              </Text>
              <Text variant="headlineSmall" style={styles.statisticValue}>
                {Math.round((summary.bookedUnits / summary.totalUnits) * 100)}%
              </Text>
            </View>
            
            <View style={styles.statisticItem}>
              <Text variant="bodyMedium" style={styles.statisticLabel}>
                Average Collection per Unit
              </Text>
              <Text variant="headlineSmall" style={styles.statisticValue}>
                {formatCurrency(summary.totalCollection / summary.bookedUnits || 0)}
              </Text>
            </View>
            
            <View style={styles.statisticItem}>
              <Text variant="bodyMedium" style={styles.statisticLabel}>
                Collection Rate
              </Text>
              <Text variant="headlineSmall" style={styles.statisticValue}>
                {Math.round((summary.totalCollection / (summary.totalCollection + summary.pendingAmount)) * 100)}%
              </Text>
            </View>
          </View>
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
  projectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  projectChip: {
    backgroundColor: '#F3F4F6',
  },
  selectedChip: {
    backgroundColor: '#EF4444',
  },
  chipText: {
    color: '#374151',
  },
  divider: {
    marginVertical: 12,
  },
  projectInfo: {
    gap: 4,
  },
  projectName: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  projectDetails: {
    color: '#6B7280',
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
  bookedValue: {
    color: '#059669',
  },
  availableValue: {
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
  pendingValue: {
    color: '#DC2626',
  },
  searchInput: {
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  statisticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statisticItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statisticLabel: {
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statisticValue: {
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default ProjectReportScreen;
