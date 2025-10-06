// Stat Card Component
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const StatCard = ({ title, value, icon, color = '#3B82F6', onPress }) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <PaperIcon source={icon} size={28} color={color} />
          </View>
          
          <View style={styles.textContainer}>
            <Text variant="bodyMedium" style={styles.title}>
              {title}
            </Text>
            <Text variant="headlineMedium" style={styles.value}>
              {value}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    color: '#111827',
    fontWeight: 'bold',
  },
});

export default React.memo(StatCard);
