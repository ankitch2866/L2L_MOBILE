import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Text, Button, Chip, FAB, Searchbar, Menu, IconButton, DataTable, Portal, Modal, Dialog, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context';
import { LoadingIndicator, EmptyState } from '../../../components';
import api from '../../../config/api';
import { formatDate } from '../../../utils/formatters';

const LogReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useSelector(state => state.auth);
  
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 25,
    offset: 0
  });
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

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
    if (user) {
      fetchLogs();
    }
  }, [user]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm]);

  const fetchLogs = async (offset = 0, limit = 25) => {
    try {
      setLoading(true);
      setError('');
      
      const endpoint = (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') 
        ? '/api/logs'
        : `/api/logs/user/${user?.id}`;

      const params = {
        limit,
        offset
      };

      const response = await api.get(endpoint, { params });

      let logsData = [];
      let paginationData = { total: 0, limit: 25, offset: 0 };
      
      if (response.data?.success && response.data?.data) {
        logsData = response.data.data.logs || [];
        paginationData = response.data.data.pagination || paginationData;
      } else if (response.data?.data) {
        logsData = response.data.data.logs || [];
        paginationData = response.data.data.pagination || paginationData;
      } else if (Array.isArray(response.data)) {
        logsData = response.data;
      }

      if (offset === 0) {
        setLogs(logsData);
      } else {
        setLogs(prev => [...prev, ...logsData]);
      }
      
      setPagination(paginationData);
      setHasMore(logsData.length === paginationData.limit);
    } catch (error) {
      console.error('Error fetching logs:', error);
      let errorMessage = 'Failed to fetch logs';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    if (!logs.length) {
      setFilteredLogs([]);
      return;
    }
    
    const filtered = logs.filter(log => {
      if (!log) return false;

      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        (log.user?.userIdentifier?.toLowerCase()?.includes(searchLower)) ||
        (log.user?.name?.toLowerCase()?.includes(searchLower)) ||
        (log.details?.toLowerCase()?.includes(searchLower)) ||
        (log.action?.toLowerCase()?.includes(searchLower)) ||
        (log.status?.toLowerCase()?.includes(searchLower)) ||
        (log.ipAddress?.toLowerCase()?.includes(searchLower)) ||
        (log.httpMethod?.toLowerCase()?.includes(searchLower)) ||
        (log.path?.toLowerCase()?.includes(searchLower));
      
      return matchesSearch;
    });

    setFilteredLogs(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs(0, 25);
    setPage(0);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const newOffset = (page + 1) * pagination.limit;
      fetchLogs(newOffset, pagination.limit);
      setPage(prev => prev + 1);
    }
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return '#10B981';
      case 'POST':
        return '#3B82F6';
      case 'PUT':
        return '#F59E0B';
      case 'DELETE':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (loading && logs.length === 0) {
    return <LoadingIndicator />;
  }

  const startIndex = page * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

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
                {pagination.total}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Total Logs
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#10B981' }]}>
                {filteredLogs.filter(log => log.status?.toLowerCase() === 'success').length}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Success
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: '#EF4444' }]}>
                {filteredLogs.filter(log => log.status?.toLowerCase() === 'error').length}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                Errors
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search logs..."
            onChangeText={handleSearch}
            value={searchTerm}
            style={styles.searchBar}
          />
        </View>

        {/* Logs List */}
        <View style={styles.listContainer}>
          {paginatedLogs.length > 0 ? (
            paginatedLogs.map((log, index) => (
              <Card key={`${log.id || index}`} style={[styles.logCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.logHeader}>
                    <View style={styles.logInfo}>
                      <Text variant="titleSmall" style={[styles.logAction, { color: theme.colors.onSurface }]}>
                        {log.action || 'Unknown Action'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.logUser, { color: theme.colors.onSurfaceVariant }]}>
                        {log.user?.name || log.user?.userIdentifier || 'Unknown User'}
                      </Text>
                    </View>
                    <View style={styles.logBadges}>
                      <Chip 
                        style={[styles.statusChip, { backgroundColor: getStatusColor(log.status) + '20' }]}
                        textStyle={{ color: getStatusColor(log.status) }}
                      >
                        {log.status || 'Unknown'}
                      </Chip>
                      {log.httpMethod && (
                        <Chip 
                          style={[styles.methodChip, { backgroundColor: getMethodColor(log.httpMethod) + '20' }]}
                          textStyle={{ color: getMethodColor(log.httpMethod) }}
                        >
                          {log.httpMethod}
                        </Chip>
                      )}
                    </View>
                  </View>

                  <View style={styles.logDetails}>
                    <Text variant="bodySmall" style={[styles.logTime, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(log.createdAt)}
                    </Text>
                    {log.path && (
                      <Text variant="bodySmall" style={[styles.logPath, { color: theme.colors.onSurfaceVariant }]}>
                        {log.path}
                      </Text>
                    )}
                  </View>

                  {log.details && (
                    <View style={styles.logDescription}>
                      <Text variant="bodySmall" style={[styles.logDetailsText, { color: theme.colors.onSurface }]}>
                        {log.details}
                      </Text>
                    </View>
                  )}

                  <View style={styles.logFooter}>
                    {log.ipAddress && (
                      <Text variant="bodySmall" style={[styles.logIp, { color: theme.colors.onSurfaceVariant }]}>
                        IP: {log.ipAddress}
                      </Text>
                    )}
                    <Button
                      mode="text"
                      onPress={() => toggleLogExpansion(log.id || index)}
                      compact
                      icon={expandedLog === (log.id || index) ? 'chevron-up' : 'chevron-down'}
                    >
                      {expandedLog === (log.id || index) ? 'Less' : 'More'}
                    </Button>
                  </View>

                  {expandedLog === (log.id || index) && (
                    <View style={styles.expandedDetails}>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          User ID:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {log.user?.userIdentifier || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          HTTP Method:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {log.httpMethod || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Path:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {log.path || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          IP Address:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {log.ipAddress || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodySmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Created At:
                        </Text>
                        <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                          {formatDate(log.createdAt)}
                        </Text>
                      </View>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No Logs Found"
              message="No logs match your search criteria."
              icon="text-box-search"
            />
          )}
        </View>

        {/* Load More Button */}
        {hasMore && paginatedLogs.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <Button
              mode="outlined"
              onPress={handleLoadMore}
              loading={loading}
              disabled={loading}
              style={styles.loadMoreButton}
            >
              Load More
            </Button>
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
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logCard: {
    marginBottom: 12,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logUser: {
    marginBottom: 4,
  },
  logBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    borderRadius: 12,
  },
  methodChip: {
    borderRadius: 12,
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTime: {
    // Color will be set dynamically
  },
  logPath: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  logDescription: {
    marginBottom: 8,
  },
  logDetailsText: {
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logIp: {
    // Color will be set dynamically
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  detailLabel: {
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    minWidth: 120,
  },
});

export default LogReportsScreen;
