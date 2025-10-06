import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Searchbar, FAB, Text, Card, Chip, Button, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon as PaperIcon } from 'react-native-paper';
import { useTheme } from '../../context';
import { LoadingIndicator, EmptyState } from '../../components';
import { fetchAllPropertiesData, setSearchQuery, setSelectedProject } from '../../store/slices/propertiesSlice';

const PropertiesListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { projects, projectUnits, loading, error, searchQuery, selectedProject } = useSelector(state => state.properties);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuRenderKey, setMenuRenderKey] = useState(0); // Counter to prevent glitches

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllPropertiesData());
    }, [dispatch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllPropertiesData());
    setRefreshing(false);
  };

  const handleProjectSelect = (projectId) => {
    setMenuVisible(false);
    setMenuRenderKey(prev => prev + 1); // Force re-render
    dispatch(setSelectedProject(projectId));
  };

  const handleMenuOpen = () => {
    if (!menuVisible && !loading) {
      setMenuRenderKey(prev => prev + 1); // Force re-render before open
      setMenuVisible(true);
    }
  };

  const handleMenuDismiss = () => {
    setMenuVisible(false);
    setMenuRenderKey(prev => prev + 1); // Force re-render after close
  };

  // Filter projects and units based on search and selected project
  const filteredData = useMemo(() => {
    return projects
      .filter(project => {
        if (selectedProject && project.project_id.toString() !== selectedProject) {
          return false;
        }
        if (searchQuery) {
          const projectMatch = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
          const units = projectUnits[project.project_id] || [];
          const unitMatch = units.some(unit => 
            unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          return projectMatch || unitMatch;
        }
        return true;
      })
      .map(project => ({
        ...project,
        units: (projectUnits[project.project_id] || []).filter(unit => {
          if (searchQuery) {
            return unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return true;
        })
      }))
      .filter(project => project.units.length > 0 || !searchQuery);
  }, [projects, projectUnits, searchQuery, selectedProject]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'free':
        return '#10B981';
      case 'booked':
        return '#3B82F6';
      case 'sold':
        return '#EF4444';
      case 'reserved':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatUnitSize = (size) => {
    if (!size) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(size) + ' sq ft';
  };

  if (loading && projects.length === 0) {
    return <LoadingIndicator message="Loading properties..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filter Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search by project, unit name, or type..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
        />
        <View style={styles.filterRow}>
          <Menu
            key={`filter-${menuRenderKey}-${selectedProject || 'all'}`}
            visible={menuVisible}
            onDismiss={handleMenuDismiss}
            anchor={
              <Button 
                mode="outlined" 
                onPress={handleMenuOpen} 
                icon="filter-variant"
                style={styles.filterButton}
                disabled={loading}
              >
                {selectedProject ? 'Filtered' : 'All Projects'}
              </Button>
            }
            contentStyle={styles.menuContent}
          >
            <ScrollView style={styles.menuScrollView} nestedScrollEnabled={true}>
              <Menu.Item 
                onPress={() => handleProjectSelect('')} 
                title="All Projects" 
                leadingIcon="home-city"
                titleStyle={styles.menuItemTitle}
              />
              {projects.map(p => (
                <Menu.Item
                  key={p.project_id}
                  onPress={() => handleProjectSelect(p.project_id.toString())}
                  title={p.project_name}
                  leadingIcon="office-building"
                  titleStyle={styles.menuItemTitle}
                />
              ))}
            </ScrollView>
          </Menu>
          <Button 
            mode="contained" 
            onPress={handleRefresh}
            icon="refresh"
            style={styles.refreshButton}
            loading={refreshing}
            disabled={loading}
          >
            Refresh
          </Button>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <PaperIcon source="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={handleRefresh} buttonColor="#EF4444">
            Retry
          </Button>
        </View>
      )}

      {/* Properties List */}
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[theme.colors.primary]} 
          />
        }
      >
        {!loading && filteredData.length > 0 ? (
          <View style={styles.content}>
            {filteredData.map((project) => (
              <View key={project.project_id} style={styles.projectSection}>
                {/* Project Header */}
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleRow}>
                    <PaperIcon source="office-building" size={24} color={theme.colors.primary} />
                    <Text variant="titleLarge" style={[styles.projectTitle, { color: theme.colors.text }]}>
                      {project.project_name}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.projectSubtitle}>
                    {project.units.length} {project.units.length === 1 ? 'property' : 'properties'} available
                  </Text>
                </View>

                {/* Units Grid */}
                <View style={styles.unitsGrid}>
                  {project.units.map((unit) => (
                    <Card 
                      key={unit.unit_id} 
                      style={styles.unitCard}
                      onPress={() => navigation.navigate('PropertyDetails', { propertyId: unit.unit_id })}
                    >
                      <Card.Content style={styles.unitCardContent}>
                        {/* Unit Header */}
                        <View style={styles.unitHeader}>
                          <Text variant="titleMedium" style={styles.unitName} numberOfLines={1}>
                            {unit.unit_name || 'N/A'}
                          </Text>
                          <Chip 
                            mode="flat" 
                            compact
                            style={{ backgroundColor: getStatusColor(unit.status) + '20' }}
                            textStyle={{ color: getStatusColor(unit.status), fontSize: 10 }}
                          >
                            {unit.status || 'Available'}
                          </Chip>
                        </View>

                        {/* Unit Details */}
                        <View style={styles.unitDetails}>
                          <View style={styles.detailRow}>
                            <PaperIcon source="floor-plan" size={14} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailLabel}>Type:</Text>
                            <Text variant="bodySmall" style={styles.detailValue} numberOfLines={1}>
                              {unit.unit_type || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <PaperIcon source="stairs" size={14} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailLabel}>Floor:</Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {unit.floor ? `Floor ${unit.floor}` : 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <PaperIcon source="ruler-square" size={14} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailLabel}>Size:</Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {formatUnitSize(unit.unit_size)}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <PaperIcon source="currency-inr" size={14} color="#6B7280" />
                            <Text variant="bodySmall" style={styles.detailLabel}>Price:</Text>
                            <Text variant="bodySmall" style={styles.detailValue}>
                              {formatCurrency(unit.bsp)}
                            </Text>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.unitActions}>
                          <Button
                            mode="contained"
                            onPress={() => navigation.navigate('PropertyDetails', { propertyId: unit.unit_id })}
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            compact
                            icon="eye"
                          >
                            View
                          </Button>
                          <Button
                            mode="contained"
                            onPress={() => navigation.navigate('EditProperty', { propertyId: unit.unit_id })}
                            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                            compact
                            icon="pencil"
                          >
                            Edit
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : !loading && filteredData.length === 0 && !error ? (
          <EmptyState
            icon="home-city"
            title="No Properties Found"
            message={searchQuery || selectedProject ? "Try adjusting your search or filters" : "No properties have been added yet"}
            actionText="Add Property"
            onActionPress={() => navigation.navigate('AddProperty')}
          />
        ) : null}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddProperty')}
        label="Add Property"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    elevation: 2,
  },
  searchbar: { 
    elevation: 0, 
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    flex: 1,
  },
  refreshButton: {
    flex: 1,
  },
  menuContent: {
    maxHeight: 400,
    maxWidth: 300,
  },
  menuScrollView: {
    maxHeight: 360, // Show ~8 items (8 * 48px = 384px, minus padding)
  },
  menuItemTitle: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16 },
  projectSection: {
    marginBottom: 24,
  },
  projectHeader: {
    marginBottom: 16,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  projectTitle: {
    fontWeight: 'bold',
  },
  projectSubtitle: {
    color: '#6B7280',
    marginLeft: 32,
  },
  unitsGrid: {
    gap: 12,
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  unitCardContent: {
    padding: 12,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitName: {
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  unitDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    color: '#6B7280',
    minWidth: 40,
  },
  detailValue: {
    flex: 1,
    fontWeight: '500',
    color: '#111827',
  },
  unitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  fab: { 
    position: 'absolute', 
    margin: 16, 
    right: 0, 
    bottom: 0,
  },
});

export default PropertiesListScreen;
