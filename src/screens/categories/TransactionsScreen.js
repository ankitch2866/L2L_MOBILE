import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useTheme } from '../../context';

const TransactionsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const transactionModules = [
    { name: 'Booking', icon: 'book-open-variant', route: 'Bookings', screen: 'BookingsList', implemented: true },
    { name: 'Unit Allotment', icon: 'home-group', route: 'Allotments', screen: 'AllotmentsList', implemented: true },
    { name: 'Payment', icon: 'credit-card', route: 'Payments', screen: 'PaymentsDashboard', implemented: true },
    { name: 'Cheque Management', icon: 'checkbook', route: 'Cheques', screen: 'ChequesDashboard', implemented: true },
    { name: 'Payment Query', icon: 'help-circle', route: 'PaymentQueries', screen: 'PaymentQueriesList', implemented: true },
    { name: 'Raise Payment', icon: 'chart-line', route: 'PaymentRaises', screen: 'PaymentRaisesList', implemented: true },
    { name: 'Unit Transfer', icon: 'swap-horizontal', route: 'UnitTransfers', screen: 'UnitTransfersList', implemented: true },
    { name: 'BBA', icon: 'file-document', route: 'BBA', screen: 'BBADashboard', implemented: true },
    { name: 'Dispatch', icon: 'truck-delivery', route: 'Dispatches', screen: 'DispatchesList', implemented: true },
    { name: 'Calling Feedback', icon: 'phone-in-talk', route: 'CallingFeedback', screen: 'CallingFeedbackDashboard', implemented: true },
    { name: 'Credit Payment', icon: 'cash-plus', route: 'Payments', screen: 'CreditPaymentDashboard', implemented: true },
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
          Transactions
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage all transaction modules
        </Text>
      </View>

      <View style={styles.grid}>
        {transactionModules.map((module, index) => (
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

export default TransactionsScreen;
