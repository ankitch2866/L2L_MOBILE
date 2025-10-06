// Dashboard Home Screen - Matches Web Frontend
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { getTimeBasedGreeting } from '../../utils/timeUtils';
import { useTheme } from '../../context';
import PropertyGridView from './PropertyGridView';

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

      {/* Quick Access to Masters - New Modules */}
      <View style={styles.quickAccessSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Master Data
        </Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CoApplicants', { screen: 'CoApplicantsList' })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quickActionText}>👥</Text>
              <Text style={styles.quickActionText}>Co-Applicants</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Brokers', { screen: 'BrokersList' })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quickActionText}>🤝</Text>
              <Text style={styles.quickActionText}>Brokers</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PaymentPlans', { screen: 'PaymentPlansList' })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quickActionText}>📋</Text>
              <Text style={styles.quickActionText}>Plans</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PLC', { screen: 'PLCList' })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quickActionText}>💰</Text>
              <Text style={styles.quickActionText}>PLC</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Banks', { screen: 'BanksList' })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quickActionText}>🏦</Text>
              <Text style={styles.quickActionText}>Banks</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Stock', { screen: 'StockList' })}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quickActionText}>📦</Text>
              <Text style={styles.quickActionText}>Stock</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
  quickAccessSection: {
    padding: 20,
    backgroundColor: theme.colors.card,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  quickActionButton: {
    width: '29%',
    aspectRatio: 1,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default DashboardHomeScreen;
