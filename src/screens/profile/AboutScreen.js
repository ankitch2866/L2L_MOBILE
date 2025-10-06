// About Screen
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';
import { useTheme } from '../../context';

const AboutScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const appInfo = [
    { label: 'App Name', value: 'HL Group ERP', icon: 'application' },
    { label: 'Version', value: '2.0.0', icon: 'information' },
    { label: 'Build', value: '2025.01.04', icon: 'package-variant' },
    { label: 'Platform', value: 'React Native', icon: 'react' },
  ];

  const companyInfo = [
    { label: 'Company', value: 'HL Group', icon: 'office-building' },
    { label: 'Industry', value: 'Real Estate', icon: 'home-city' },
    { label: 'Location', value: 'India', icon: 'map-marker' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* App Logo/Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <PaperIcon source="office-building" size={64} color="#EF4444" />
          </View>
          <Text variant="headlineMedium" style={styles.appName}>
            HL Group ERP
          </Text>
          <Text variant="bodyLarge" style={styles.tagline}>
            Enterprise Resource Planning
          </Text>
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            App Information
          </Text>
          <Divider style={styles.divider} />
          
          {appInfo.map((item, index) => (
            <List.Item
              key={index}
              title={item.label}
              description={item.value}
              left={(props) => (
                <List.Icon {...props} icon={item.icon} color="#EF4444" />
              )}
              style={styles.listItem}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Company Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Company Information
          </Text>
          <Divider style={styles.divider} />
          
          {companyInfo.map((item, index) => (
            <List.Item
              key={index}
              title={item.label}
              description={item.value}
              left={(props) => (
                <List.Icon {...props} icon={item.icon} color="#EF4444" />
              )}
              style={styles.listItem}
            />
          ))}
        </Card.Content>
      </Card>

      {/* About Description */}
      <Card style={styles.descriptionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            About HL Group ERP
          </Text>
          <Divider style={styles.divider} />
          
          <Text variant="bodyMedium" style={styles.description}>
            HL Group ERP is a comprehensive enterprise resource planning solution designed specifically for real estate management. 
            The application streamlines property management, customer relations, bookings, payments, and reporting processes.
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            Our mobile application provides on-the-go access to critical business functions, enabling real-time decision making 
            and efficient workflow management for real estate professionals.
          </Text>

          <Text variant="titleMedium" style={styles.featuresTitle}>
            Key Features:
          </Text>
          
          <View style={styles.featuresList}>
            <Text variant="bodyMedium" style={styles.feature}>
              • Master Data Management (Projects, Properties, Customers, Brokers)
            </Text>
            <Text variant="bodyMedium" style={styles.feature}>
              • Transaction Processing (Bookings, Payments, Transfers)
            </Text>
            <Text variant="bodyMedium" style={styles.feature}>
              • Comprehensive Reporting & Analytics
            </Text>
            <Text variant="bodyMedium" style={styles.feature}>
              • Document Management & Correspondence
            </Text>
            <Text variant="bodyMedium" style={styles.feature}>
              • Real-time Notifications & Alerts
            </Text>
            <Text variant="bodyMedium" style={styles.feature}>
              • Secure Authentication & Role-based Access
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text variant="bodySmall" style={styles.copyrightText}>
          © 2025 HL Group. All rights reserved.
        </Text>
        <Text variant="bodySmall" style={styles.copyrightText}>
          Version 2.0.0
        </Text>
      </View>

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
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.dark ? '#7F1D1D' : '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tagline: {
    color: theme.colors.textSecondary,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
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
  listItem: {
    paddingVertical: 4,
  },
  descriptionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    backgroundColor: theme.colors.card,
  },
  description: {
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  featuresTitle: {
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  featuresList: {
    marginLeft: 8,
  },
  feature: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  copyright: {
    alignItems: 'center',
    padding: 24,
  },
  copyrightText: {
    color: theme.colors.textSecondary,
    opacity: 0.6,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default AboutScreen;
