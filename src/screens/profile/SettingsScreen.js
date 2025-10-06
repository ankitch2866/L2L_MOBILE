// Settings Screen with Functional Dark Mode
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Switch, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { showSuccess, ToastComponent } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      pushEnabled: true,
      emailEnabled: true,
    },
    display: {
      compactView: false,
      showImages: true,
    },
  });

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      showSuccess('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (category, key) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key],
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleDarkModeToggle = () => {
    toggleTheme();
    showSuccess(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  const styles = getStyles(theme);

  return (
    <>
      <ToastComponent />
      <ScrollView style={styles.container}>
        {/* Display Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Display
            </Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Dark Mode"
              description={isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
              left={(props) => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={handleDarkModeToggle}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Compact View"
              description="Show more content in less space"
              left={(props) => <List.Icon {...props} icon="view-compact" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.display.compactView}
                  onValueChange={() => handleToggle('display', 'compactView')}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Show Images"
              description="Display property images"
              left={(props) => <List.Icon {...props} icon="image" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.display.showImages}
                  onValueChange={() => handleToggle('display', 'showImages')}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Notifications Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Notifications
            </Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Push Notifications"
              description="Receive push notifications"
              left={(props) => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.notifications.pushEnabled}
                  onValueChange={() => handleToggle('notifications', 'pushEnabled')}
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title="Email Notifications"
              description="Receive notifications via email"
              left={(props) => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.notifications.emailEnabled}
                  onValueChange={() => handleToggle('notifications', 'emailEnabled')}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: theme.colors.card,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 8,
    backgroundColor: theme.colors.border,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default SettingsScreen;
