import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context';

const MastersScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const masterModules = [
    { name: 'Payment Plans', icon: 'file-document-outline', route: 'PaymentPlans', screen: 'PaymentPlansList', implemented: true },
    { name: 'Projects', icon: 'office-building', route: 'ProjectsStack', screen: 'ProjectsList', implemented: true },
    { name: 'Properties', icon: 'home-city', route: 'PropertiesStack', screen: 'PropertiesList', implemented: true },
    { name: 'PLC', icon: 'cash-multiple', route: 'PLC', screen: 'PLCList', implemented: true },
    { name: 'Stock', icon: 'package-variant', route: 'Stock', screen: 'StockList', implemented: true },
    { name: 'Brokers', icon: 'handshake', route: 'Brokers', screen: 'BrokersList', implemented: true },
    { name: 'Customers', icon: 'account-group', route: 'CustomersStack', screen: 'CustomersList', implemented: true },
    { name: 'Co-Applicants', icon: 'account-multiple', route: 'CoApplicants', screen: 'CoApplicantsList', implemented: true },
    { name: 'Banks', icon: 'bank', route: 'Banks', screen: 'BanksList', implemented: true },
    { name: 'Project Sizes', icon: 'ruler', route: 'ProjectSizes', screen: 'ProjectSizesList', implemented: true },
  ];

  const handleModulePress = (module) => {
    if (module.implemented && module.route && module.screen) {
      navigation.navigate(module.route, { screen: module.screen });
    } else {
      Alert.alert('Coming Soon', `${module.name} module is under development.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Master Data
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage all master data modules
        </Text>
      </View>

      <View style={styles.grid}>
        {masterModules.map((module, index) => (
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

export default MastersScreen;
