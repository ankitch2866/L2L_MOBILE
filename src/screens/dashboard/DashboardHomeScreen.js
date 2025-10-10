// Dashboard Home Screen - Matches Web Frontend
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { getTimeBasedGreeting } from '../../utils/timeUtils';
import { useTheme } from '../../context';
import PropertyGridView from './PropertyGridView';
import CustomerQueryCard from '../../components/dashboard/CustomerQueryCard';

const DashboardHomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Set greeting on mount
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Just refresh the greeting
    setGreeting(getTimeBasedGreeting());
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const styles = getStyles(theme);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#EF4444']}
          tintColor="#EF4444"
        />
      }
    >
      {/* Header Section - Matches Web Frontend */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.greeting}>
          {greeting} {user?.name || 'User'}
        </Text>
        <Text variant="titleMedium" style={styles.welcome}>
          Welcome to HL Group
        </Text>
      </View>

      {/* Customer Query Card - Matches Web Frontend */}
      <CustomerQueryCard />

      {/* Property Grid - Matches Web Frontend */}
      <PropertyGridView navigation={navigation} />

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  greeting: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  welcome: {
    color: theme.colors.textSecondary,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default DashboardHomeScreen;
