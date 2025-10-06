import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context';

const ReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const reportModules = [
    { name: 'Project Details', icon: 'chart-bar', route: null, screen: null, implemented: false },
    { name: 'Daily Collection', icon: 'cash', route: null, screen: null, implemented: false },
    { name: 'Unit Wise Collection', icon: 'home-analytics', route: null, screen: null, implemented: false },
    { name: 'Customer Wise Collection', icon: 'account-cash', route: null, screen: null, implemented: false },
    { name: 'Customer List', icon: 'format-list-bulleted', route: null, screen: null, implemented: false },
    { name: 'Master Reports', icon: 'file-chart', route: null, screen: null, implemented: false },
    { name: 'BBA Report', icon: 'file-document-outline', route: null, screen: null, implemented: false },
    { name: 'BBA Status', icon: 'check-circle', route: null, screen: null, implemented: false },
    { name: 'Calling Details', icon: 'phone-log', route: null, screen: null, implemented: false },
    { name: 'Correspondence', icon: 'email-outline', route: null, screen: null, implemented: false },
    { name: 'Unit Transfers', icon: 'transfer', route: null, screen: null, implemented: false },
    { name: 'Stock Report', icon: 'package-variant-closed', route: null, screen: null, implemented: false },
    { name: 'Outstanding', icon: 'currency-usd', route: null, screen: null, implemented: false },
    { name: 'Buy Back/Cancel', icon: 'close-circle', route: null, screen: null, implemented: false },
    { name: 'Dues FinYrs', icon: 'calendar-clock', route: null, screen: null, implemented: false },
    { name: 'Customer Details', icon: 'account-details', route: null, screen: null, implemented: false },
  ];

  const handleModulePress = (module) => {
    if (module.implemented && module.route && module.screen) {
      navigation.navigate(module.route, { screen: module.screen });
    } else {
      Alert.alert('Coming Soon', `${module.name} report is under development.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Reports
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          View all reports and analytics
        </Text>
      </View>

      <View style={styles.grid}>
        {reportModules.map((module, index) => (
          <TouchableOpacity
            key={index}
            style={styles.moduleButton}
            onPress={() => handleModulePress(module)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Icon name={module.icon} size={36} color="#FFFFFF" style={styles.moduleIcon} />
              <Text style={styles.moduleText}>{module.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  moduleButton: {
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
  moduleIcon: {
    marginBottom: 8,
  },
  moduleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ReportsScreen;
