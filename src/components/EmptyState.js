// Empty State Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const EmptyState = ({
  icon = 'inbox',
  title = 'No Data Available',
  message = 'There is nothing to display at the moment.',
  actionLabel,
  onAction,
  iconSize = 80,
  iconColor = '#9CA3AF',
}) => {
  return (
    <View style={styles.container}>
      <PaperIcon source={icon} size={iconSize} color={iconColor} style={styles.icon} />
      
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          icon="plus"
        >
          {actionLabel}
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
    backgroundColor: '#FFFFFF',
  },
  icon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#EF4444',
    marginTop: 8,
  },
});

export default EmptyState;
