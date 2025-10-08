import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Text, Button, Chip, FAB, Searchbar, Menu, IconButton, DataTable } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatDate } from '../../../utils/formatters';

const BirthdaysScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [birthdays, setBirthdays] = useState([]);
  const [filteredBirthdays, setFilteredBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [birthdaysPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending',
  });
  const [filter, setFilter] = useState('all'); // 'today', 'month', 'upcoming', 'all'

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
    fetchBirthdays();
  }, [filter]);

  useEffect(() => {
    if (birthdays.length > 0) {
      let filtered = [...birthdays];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (person) =>
            person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.role?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply client-side filtering for 'upcoming' since no API endpoint exists
      if (filter === 'upcoming') {
        filtered = filtered.filter((person) =>
          isUpcomingBirthday(new Date(person.dob), 30)
        );
      }

      setFilteredBirthdays(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } else {
      setFilteredBirthdays([]);
    }
  }, [searchQuery, birthdays, filter]);

  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      setError('');

      let url;
      switch (filter) {
        case 'today':
          url = '/api/birthdays/today';
          break;
        case 'month':
          const currentMonth = new Date().getMonth() + 1; // API expects 1-12
          url = `/api/birthdays/month/${currentMonth}`;
          break;
        case 'upcoming':
        case 'all':
        default:
          url = '/api/birthdays';
          break;
      }

      const response = await api.get(url);
      
      if (response.data?.success) {
        setBirthdays(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch birthdays');
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      setError(error.message || 'Failed to load birthdays. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const isToday = (dob) => {
    const today = new Date();
    return (
      dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()
    );
  };

  const isUpcomingBirthday = (dob, withinDays) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Create date for this year's birthday
    const nextBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());

    // If birthday already passed this year, set to next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1);
    }

    // Calculate difference in days
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= withinDays;
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBirthdays = useMemo(() => {
    let sortableBirthdays = [...filteredBirthdays];
    if (sortConfig.key) {
      sortableBirthdays.sort((a, b) => {
        // Special handling for dates
        if (sortConfig.key === 'dob') {
          const dateA = new Date(a.dob).setFullYear(2000); // Use same year for comparison
          const dateB = new Date(b.dob).setFullYear(2000);
          return sortConfig.direction === 'ascending'
            ? dateA - dateB
            : dateB - dateA;
        }

        // Default comparison for other fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBirthdays;
  }, [filteredBirthdays, sortConfig]);

  // Calculate pagination
  const indexOfLastBirthday = currentPage * birthdaysPerPage;
  const indexOfFirstBirthday = indexOfLastBirthday - birthdaysPerPage;
  const currentBirthdays = sortedBirthdays.slice(
    indexOfFirstBirthday,
    indexOfLastBirthday
  );
  const totalPages = Math.ceil(sortedBirthdays.length / birthdaysPerPage);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getDaysUntilBirthday = (dob) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const nextBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());

    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1);
    }

    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBirthdays();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSendWishes = (person) => {
    Alert.alert(
      'Send Birthday Wishes',
      `Send birthday wishes to ${person.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => navigation.navigate('SendWishes', { person })
        }
      ]
    );
  };

  const getFilterChipColor = (filterValue) => {
    return filter === filterValue ? theme.colors.primary : theme.colors.outline;
  };

  if (loading && birthdays.length === 0) {
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
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {filteredBirthdays.length}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Total
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#10B981' }]}>
                {filteredBirthdays.filter(person => isToday(new Date(person.dob))).length}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Today
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#F59E0B' }]}>
                {filteredBirthdays.filter(person => isUpcomingBirthday(new Date(person.dob), 7)).length}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                This Week
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search birthdays..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'month', label: 'This Month' },
              { key: 'upcoming', label: 'Upcoming' },
            ].map((filterOption) => (
              <Chip
                key={filterOption.key}
                selected={filter === filterOption.key}
                onPress={() => handleFilterChange(filterOption.key)}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: filter === filterOption.key 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: theme.colors.outline
                  }
                ]}
                textStyle={{
                  color: filter === filterOption.key 
                    ? '#FFFFFF' 
                    : theme.colors.onSurface
                }}
              >
                {filterOption.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Birthdays List */}
        <View style={styles.listContainer}>
          {currentBirthdays.length > 0 ? (
            currentBirthdays.map((person, index) => {
              const isTodayBirthday = isToday(new Date(person.dob));
              const daysUntil = getDaysUntilBirthday(new Date(person.dob));
              const age = calculateAge(person.dob);

              return (
                <Card key={`${person.id || index}`} style={[styles.birthdayCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content>
                    <View style={styles.birthdayHeader}>
                      <View style={styles.birthdayInfo}>
                        <Text variant="titleMedium" style={[styles.personName, { color: theme.colors.onSurface }]}>
                          {person.name || 'Unknown'}
                        </Text>
                        <Text variant="bodySmall" style={[styles.personEmail, { color: theme.colors.onSurfaceVariant }]}>
                          {person.email || 'No email'}
                        </Text>
                        <Text variant="bodySmall" style={[styles.personRole, { color: theme.colors.onSurfaceVariant }]}>
                          {person.role || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.birthdayBadges}>
                        {isTodayBirthday && (
                          <Chip 
                            style={[styles.todayChip, { backgroundColor: '#10B981' }]}
                            textStyle={{ color: '#FFFFFF' }}
                          >
                            Today!
                          </Chip>
                        )}
                        <Chip 
                          style={[
                            styles.ageChip, 
                            { backgroundColor: theme.colors.primaryContainer }
                          ]}
                          textStyle={{ color: theme.colors.onPrimaryContainer }}
                        >
                          {age} years
                        </Chip>
                      </View>
                    </View>

                    <View style={styles.birthdayDetails}>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Birthday:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {formatDate(person.dob)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Days Until:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.birthdayActions}>
                      <Button
                        mode="outlined"
                        onPress={() => handleSendWishes(person)}
                        style={styles.wishButton}
                        icon="gift"
                      >
                        Send Wishes
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          ) : (
            <EmptyState
              title="No Birthdays Found"
              message="No birthdays match your search criteria."
              icon="cake-variant"
            />
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <DataTable.Pagination
              page={currentPage - 1}
              numberOfPages={totalPages}
              onPageChange={(page) => setCurrentPage(page + 1)}
              label={`${indexOfFirstBirthday + 1}-${Math.min(indexOfLastBirthday, filteredBirthdays.length)} of ${filteredBirthdays.length}`}
              numberOfItemsPerPage={birthdaysPerPage}
              onItemsPerPageChange={() => {}} // Not implemented for simplicity
              showFastPagination
            />
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    borderWidth: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  birthdayCard: {
    marginBottom: 12,
    elevation: 2,
  },
  birthdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  birthdayInfo: {
    flex: 1,
  },
  personName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  personEmail: {
    marginBottom: 2,
  },
  personRole: {
    marginBottom: 4,
  },
  birthdayBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  todayChip: {
    borderRadius: 12,
  },
  ageChip: {
    borderRadius: 12,
  },
  birthdayDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 2,
  },
  detailLabel: {
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  birthdayActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  wishButton: {
    // Styles will be applied dynamically
  },
  paginationContainer: {
    padding: 16,
  },
});

export default BirthdaysScreen;
