import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Text, Button, Chip, FAB, Searchbar, Menu, IconButton, DataTable, Portal, Modal, Dialog, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import { 
  fetchEmployees, 
  deleteEmployee, 
  toggleEmployeeStatus, 
  resetEmployeePassword,
  setSearchTerm,
  setSortOrder,
  setPage,
  setRowsPerPage,
  clearError,
  clearSuccess,
  filterEmployees
} from '../../../store/slices/employeesSlice';
import { formatDate } from '../../../utils/formatters';

const EmployeesDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { 
    employees, 
    filteredEmployees, 
    stats, 
    loading, 
    actionLoading, 
    error, 
    success, 
    searchTerm, 
    sortOrder, 
    page, 
    rowsPerPage 
  } = useSelector(state => state.employees);
  
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 10, padding: 8, marginTop: -12 }}
          >
            <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" />
          </TouchableOpacity>
        ),
      });
    }, [navigation])
  );

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    dispatch(filterEmployees());
  }, [searchTerm, sortOrder, employees, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      Alert.alert('Success', success);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchEmployees());
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    dispatch(setSearchTerm(query));
  };

  const handleSortToggle = () => {
    dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleStatusToggle = async (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    const action = employee?.status ? 'deactivate' : 'activate';
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} this employee?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => dispatch(toggleEmployeeStatus(employeeId))
        }
      ]
    );
  };

  const handleDeleteClick = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEmployeeToDelete(employee);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      dispatch(deleteEmployee(employeeToDelete.id));
      setDeleteDialogVisible(false);
      setEmployeeToDelete(null);
    }
  };

  const handleResetPassword = async (employeeId) => {
    Alert.alert(
      'Reset Password',
      'Are you sure you want to reset this employee\'s password?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => dispatch(resetEmployeePassword(employeeId))
        }
      ]
    );
  };

  const handleEditEmployee = (employee) => {
    navigation.navigate('EditEmployee', { employee });
  };

  const handleViewEmployee = (employee) => {
    navigation.navigate('EmployeeDetails', { employee });
  };

  const handleChangePage = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    dispatch(setRowsPerPage(newRowsPerPage));
  };

  if (loading && employees.length === 0) {
    return <LoadingIndicator />;
  }

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

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
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {stats.totalEmployees}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Total
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#10B981' }]}>
                {stats.activeEmployees}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Active
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#F59E0B' }]}>
                {stats.recentEmployees}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Recent
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Search and Sort */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search employees..."
            onChangeText={handleSearch}
            value={searchTerm}
            style={styles.searchBar}
          />
          <IconButton
            icon={sortOrder === 'asc' ? 'sort-ascending' : 'sort-descending'}
            onPress={handleSortToggle}
            iconColor={theme.colors.primary}
          />
        </View>

        {/* Employees List */}
        <View style={styles.listContainer}>
          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((employee) => (
              <Card key={employee.id} style={[styles.employeeCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.employeeHeader}>
                    <View style={styles.employeeInfo}>
                      <Text variant="titleMedium" style={[styles.employeeName, { color: theme.colors.onSurface }]}>
                        {employee.name || 'Unknown'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.employeeEmail, { color: theme.colors.onSurfaceVariant }]}>
                        {employee.email || 'No email'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.employeeId, { color: theme.colors.onSurfaceVariant }]}>
                        ID: {employee.userId || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.employeeActions}>
                      <Chip 
                        style={[
                          styles.statusChip, 
                          { backgroundColor: employee.status ? '#D1FAE5' : '#FEF3C7' }
                        ]}
                      >
                        <Text style={{ color: employee.status ? '#065F46' : '#92400E' }}>
                          {employee.status ? 'Active' : 'Inactive'}
                        </Text>
                      </Chip>
                      <Menu
                        visible={menuVisible && selectedEmployee?.id === employee.id}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                          <IconButton
                            icon="dots-vertical"
                            onPress={() => {
                              setSelectedEmployee(employee);
                              setMenuVisible(true);
                            }}
                            iconColor={theme.colors.onSurface}
                          />
                        }
                      >
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(false);
                            handleViewEmployee(employee);
                          }}
                          title="View Details"
                          leadingIcon="eye"
                        />
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(false);
                            handleEditEmployee(employee);
                          }}
                          title="Edit"
                          leadingIcon="pencil"
                        />
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(false);
                            handleStatusToggle(employee.id);
                          }}
                          title={employee.status ? 'Deactivate' : 'Activate'}
                          leadingIcon={employee.status ? 'account-off' : 'account-check'}
                        />
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(false);
                            handleResetPassword(employee.id);
                          }}
                          title="Reset Password"
                          leadingIcon="lock-reset"
                        />
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(false);
                            handleDeleteClick(employee.id);
                          }}
                          title="Delete"
                          leadingIcon="delete"
                          titleStyle={{ color: '#EF4444' }}
                        />
                      </Menu>
                    </View>
                  </View>

                  <View style={styles.employeeDetails}>
                    <Text variant="bodySmall" style={[styles.roleText, { color: theme.colors.onSurfaceVariant }]}>
                      Role: {employee.role || 'N/A'}
                    </Text>
                    <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                      Created: {formatDate(employee.createdAt)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No Employees Found"
              message="No employees match your search criteria."
              icon="account-group"
            />
          )}
        </View>

        {/* Pagination */}
        {filteredEmployees.length > rowsPerPage && (
          <View style={styles.paginationContainer}>
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(filteredEmployees.length / rowsPerPage)}
              onPageChange={handleChangePage}
              label={`${startIndex + 1}-${Math.min(endIndex, filteredEmployees.length)} of ${filteredEmployees.length}`}
              numberOfItemsPerPage={rowsPerPage}
              onItemsPerPageChange={handleChangeRowsPerPage}
              showFastPagination
              selectDropdown
            />
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddEmployee')}
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Employee</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete {employeeToDelete?.name}? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="#EF4444">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  employeeCard: {
    marginBottom: 12,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontWeight: 'bold',
  },
  employeeEmail: {
    marginTop: 2,
  },
  employeeId: {
    marginTop: 2,
  },
  employeeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    borderRadius: 12,
    marginRight: 8,
  },
  employeeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  roleText: {
    // Color will be set dynamically
  },
  dateText: {
    // Color will be set dynamically
  },
  paginationContainer: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default EmployeesDashboardScreen;
