// Drawer Navigator Component
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Divider, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const DrawerContent = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      title: 'Masters',
      icon: 'database',
      items: [
        { title: 'Projects', icon: 'home-city', route: 'Projects' },
        { title: 'Properties', icon: 'home', route: 'Properties' },
        { title: 'Customers', icon: 'account-group', route: 'Customers' },
        { title: 'Brokers', icon: 'account-tie', route: 'Brokers' },
        { title: 'Payment Plans', icon: 'credit-card', route: 'PaymentPlans' },
      ],
    },
    {
      title: 'Transactions',
      icon: 'swap-horizontal',
      items: [
        { title: 'Bookings', icon: 'calendar-check', route: 'Bookings' },
        { title: 'Payments', icon: 'currency-inr', route: 'Payments' },
        { title: 'Installments', icon: 'calendar-clock', route: 'Installments' },
        { title: 'Collections', icon: 'cash', route: 'Collections' },
      ],
    },
    {
      title: 'Reports',
      icon: 'chart-bar',
      items: [
        { title: 'Sales Report', icon: 'chart-line', route: 'SalesReport' },
        { title: 'Payment Report', icon: 'file-chart', route: 'PaymentReport' },
        { title: 'Customer Report', icon: 'account-details', route: 'CustomerReport' },
        { title: 'Log Reports', icon: 'file-document', route: 'LogReports' },
      ],
    },
    {
      title: 'Utilities',
      icon: 'tools',
      items: [
        { title: 'Settings', icon: 'cog', route: 'Settings' },
        { title: 'Backup', icon: 'backup-restore', route: 'Backup' },
        { title: 'Import/Export', icon: 'import', route: 'ImportExport' },
      ],
    },
  ];

  const handleMenuPress = (route) => {
    console.log('Navigate to:', route);
    // navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Text
          size={64}
          label={user?.name?.charAt(0) || 'U'}
          style={styles.avatar}
        />
        <Text variant="titleLarge" style={styles.userName}>
          {user?.name || 'User'}
        </Text>
        <Text variant="bodyMedium" style={styles.userRole}>
          {user?.role || 'User'}
        </Text>
      </View>

      <Divider />

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((section, index) => (
          <List.Section key={index}>
            <List.Subheader>{section.title}</List.Subheader>
            {section.items.map((item, itemIndex) => (
              <List.Item
                key={itemIndex}
                title={item.title}
                left={(props) => <List.Icon {...props} icon={item.icon} />}
                onPress={() => handleMenuPress(item.route)}
                style={styles.menuItem}
              />
            ))}
          </List.Section>
        ))}
      </ScrollView>

      <Divider />

      {/* Footer */}
      <View style={styles.footer}>
        <List.Item
          title="Logout"
          left={(props) => <List.Icon {...props} icon="logout" />}
          onPress={handleLogout}
          style={styles.logoutItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    paddingLeft: 16,
  },
  footer: {
    paddingBottom: 20,
  },
  logoutItem: {
    paddingLeft: 16,
  },
});

export default DrawerContent;
