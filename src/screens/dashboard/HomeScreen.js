import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

const HomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.welcomeText}>
              Welcome, {user?.name}!
            </Text>
            <Text variant="bodyMedium" style={styles.roleText}>
              Role: {user?.role}
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                0
              </Text>
              <Text variant="bodyMedium">Customers</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                0
              </Text>
              <Text variant="bodyMedium">Projects</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                0
              </Text>
              <Text variant="bodyMedium">Units</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                ₹0
              </Text>
              <Text variant="bodyMedium">Collections</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Add Customer
            </Button>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Add Project
            </Button>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Record Payment
            </Button>
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              📱 Mobile App - Phase 1
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Foundation modules are now ready:
            </Text>
            <Text variant="bodySmall" style={styles.infoList}>
              ✅ Authentication{'\n'}
              ✅ Navigation{'\n'}
              ✅ State Management{'\n'}
              ✅ API Configuration{'\n'}
              ✅ Theme System
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              More features coming in next phases!
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  welcomeText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  roleText: {
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statNumber: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    marginBottom: 12,
    backgroundColor: '#1F2937',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 8,
    color: '#374151',
  },
  infoList: {
    marginLeft: 8,
    marginBottom: 8,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default HomeScreen;
