import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from '../../context';

const ReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const reportModules = [
    // Main modules from web frontend menu (in order)
    { name: 'Project Details', icon: 'chart-bar', route: 'ProjectReports', screen: 'ProjectDashboard', implemented: true, category: 'Project' },
    
    // Collection submenu items as separate modules (3 modules)
    { name: 'Daily Collection', icon: 'cash', route: 'CollectionReports', screen: 'DailyCollection', implemented: true, category: 'Collection' },
    { name: 'Unit Wise Collection', icon: 'home-analytics', route: 'CollectionReports', screen: 'UnitWiseCollection', implemented: true, category: 'Collection' },
    { name: 'Customer Wise Collection', icon: 'account-cash', route: 'CollectionReports', screen: 'CustomerWiseCollection', implemented: true, category: 'Collection' },
    
    // Rest of main modules from web frontend
    { name: 'List of Customer Project wise', icon: 'account-details', route: 'CustomerReports', screen: 'CustomerProject', implemented: true, category: 'Customer' },
    { name: 'List of Customer Project wise (Fin. Year)', icon: 'calendar-clock', route: 'CustomerReports', screen: 'CustomerProjectYear', implemented: true, category: 'Customer' },
    { name: 'Master Reports', icon: 'file-document-multiple', route: 'MasterReports', screen: 'MasterReport', implemented: true, category: 'Master' },
    { name: 'Buyer Agreements', icon: 'file-document', route: 'BBAReports', screen: 'BBAAgreementReport', implemented: true, category: 'BBA' },
    { name: 'BBA Status', icon: 'file-document-check', route: 'BBAReports', screen: 'BBAStatusReport', implemented: true, category: 'BBA' },
    { name: 'Calling Details Between', icon: 'phone-log', route: 'CallingReports', screen: 'CallingFeedbackDashboard', implemented: true, category: 'Calling' },
    { name: 'Cust. Correspondence', icon: 'email', route: 'CorrespondenceReports', screen: 'CorrespondenceDashboard', implemented: true, category: 'Correspondence' },
    { name: 'Unit Transfers', icon: 'transfer', route: 'UnitTransferReports', screen: 'UnitTransferDashboard', implemented: true, category: 'Unit Transfer' },
    { name: 'Stock', icon: 'package-variant-closed', route: 'StockReports', screen: 'StockDashboard', implemented: true, category: 'Stock' },
    { name: 'Outstanding Report', icon: 'currency-usd', route: 'OutstandingReports', screen: 'OutstandingReport', implemented: true, category: 'Outstanding' },
    { name: 'Buy Back/Cancel Cases', icon: 'close-circle', route: 'BuyBackReports', screen: 'BuyBackCancelCases', implemented: true, category: 'Buy Back' },
    { name: 'Dues FinYrs', icon: 'calendar-clock', route: 'DuesReports', screen: 'DueInstallmentsDashboard', implemented: true, category: 'Dues' },
    // Customer Details removed - now accessible directly from Dashboard Customer Query Card
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
              <List.Icon icon={module.icon} color="#FFFFFF" style={styles.moduleIcon} />
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
