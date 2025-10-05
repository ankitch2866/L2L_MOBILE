import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EmptyState = ({ 
  icon = 'inbox', 
  title = 'No Data', 
  message = 'No items found', 
  actionText, 
  onActionPress 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color="#D1D5DB" />
      </View>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {actionText && onActionPress && (
        <Button
          mode="contained"
          onPress={onActionPress}
          style={styles.button}
          buttonColor="#EF4444"
        >
          {actionText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});

export default EmptyState;
