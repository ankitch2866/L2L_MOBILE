// Profile Screen - Mobile Appropriate
import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Avatar, List, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context';

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      title: 'Reset Password',
      description: 'Change your account password',
      icon: 'lock-reset',
      onPress: () => navigation.navigate('ResetPassword'),
    },
    {
      title: 'Settings',
      description: 'App preferences and display options',
      icon: 'cog',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: 'About',
      description: 'App information and version',
      icon: 'information',
      onPress: () => navigation.navigate('About'),
    },
  ];

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.userName}>
            {user?.name || 'User Name'}
          </Text>
          {user?.email && (
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user.email}
            </Text>
          )}
          <Text variant="bodyLarge" style={styles.userRole}>
            {user?.role || 'User'}
          </Text>
          {user?.id && (
            <Text variant="bodySmall" style={styles.userId}>
              ID: {user.id}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={item.title}
                description={item.description}
                left={(props) => (
                  <List.Icon {...props} icon={item.icon} color="#EF4444" />
                )}
                right={(props) => (
                  <List.Icon {...props} icon="chevron-right" />
                )}
                onPress={item.onPress}
                style={styles.menuItem}
              />
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Card style={styles.logoutCard}>
        <Card.Content>
          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={(props) => (
              <List.Icon {...props} icon="logout" color="#DC2626" />
            )}
            onPress={handleLogout}
            style={styles.logoutItem}
            titleStyle={styles.logoutText}
          />
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
    backgroundColor: theme.colors.card,
  },
  headerContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    backgroundColor: '#EF4444',
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  userRole: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  userId: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    opacity: 0.7,
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    backgroundColor: theme.colors.card,
  },
  menuItem: {
    paddingVertical: 8,
  },
  logoutCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    backgroundColor: theme.colors.card,
    borderColor: theme.dark ? '#7F1D1D' : '#FEE2E2',
    borderWidth: 1,
  },
  logoutItem: {
    paddingVertical: 8,
  },
  logoutText: {
    color: '#DC2626',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default ProfileScreen;
