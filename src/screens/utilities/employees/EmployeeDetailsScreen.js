import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, Chip, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context';
import { formatDate } from '../../../utils/formatters';

const EmployeeDetailsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { employee } = route.params;

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

  const handleEdit = () => {
    navigation.navigate('EditEmployee', { employee });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Employee Header */}
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={[styles.employeeName, { color: theme.colors.onSurface }]}>
                {employee.name || 'Unknown'}
              </Text>
              <Text variant="bodyMedium" style={[styles.employeeEmail, { color: theme.colors.onSurfaceVariant }]}>
                {employee.email || 'No email'}
              </Text>
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
            </View>
            <Button
              mode="contained"
              onPress={handleEdit}
              style={styles.editButton}
              icon="pencil"
            >
              Edit
            </Button>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Basic Information
            </Title>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                User ID:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {employee.userId || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Role:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {employee.role || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Email:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {employee.email || 'N/A'}
              </Text>
            </View>

            {employee.phone && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Phone:
                </Text>
                <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {employee.phone}
                </Text>
              </View>
            )}

            {employee.address && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Address:
                </Text>
                <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {employee.address}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Account Information
            </Title>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Created:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {formatDate(employee.createdAt)}
              </Text>
            </View>

            {employee.updatedAt && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Last Updated:
                </Text>
                <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {formatDate(employee.updatedAt)}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Status:
              </Text>
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
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  employeeEmail: {
    marginBottom: 8,
  },
  statusChip: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editButton: {
    marginLeft: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    flex: 2,
    textAlign: 'right',
  },
});

export default EmployeeDetailsScreen;
