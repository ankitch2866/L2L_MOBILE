import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from '../../context';

const UtilitiesScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const utilityModules = [
    { name: 'Manage Employees', icon: 'account-tie', route: 'Employees', screen: 'EmployeesDashboard', implemented: true },
    { name: 'Allotment Letter', icon: 'file-certificate', route: 'AllotmentLetter', screen: 'AllotmentLetter', implemented: true },
    { name: 'Log Reports', icon: 'text-box-check', route: 'LogReports', screen: 'LogReports', implemented: true },
    { name: 'Upcoming Birthdays', icon: 'cake-variant', route: 'Birthdays', screen: 'Birthdays', implemented: true },
  ];

  const handleModulePress = (module) => {
    if (module.implemented && module.route && module.screen) {
      navigation.navigate(module.route, { screen: module.screen });
    } else {
      Alert.alert('Coming Soon', `${module.name} utility is under development.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Utilities
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Access utility tools and features
        </Text>
      </View>

      <View style={styles.grid}>
        {utilityModules.map((module, index) => (
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

export default UtilitiesScreen;
