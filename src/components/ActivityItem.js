// Activity Item Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';
import { formatTimeAgo } from '../utils/timeUtils';

const ActivityItem = ({ activity }) => {
  const getIconName = (type) => {
    switch (type) {
      case 'booking':
        return 'calendar-check';
      case 'payment':
        return 'currency-inr';
      case 'customer':
        return 'account-plus';
      case 'property':
        return 'home-plus';
      default:
        return 'information';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'booking':
        return '#F59E0B';
      case 'payment':
        return '#10B981';
      case 'customer':
        return '#3B82F6';
      case 'property':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const iconName = getIconName(activity.type);
  const iconColor = getIconColor(activity.type);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <PaperIcon source={iconName} size={24} color={iconColor} />
      </View>
      
      <View style={styles.content}>
        <Text variant="bodyMedium" style={styles.description}>
          {activity.description}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {activity.user} • {formatTimeAgo(activity.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    color: '#6B7280',
  },
});

export default React.memo(ActivityItem);
