// Quick Action Button Component
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const QuickActionButton = ({ title, icon, color = '#EF4444', onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <Icon name={icon} size={32} color="#FFFFFF" style={styles.icon} />
      <Text variant="labelMedium" style={styles.label}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    minHeight: 100,
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default React.memo(QuickActionButton);
