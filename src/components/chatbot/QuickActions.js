// QuickActions Component - Quick action buttons for common queries
import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useTheme } from '../../context';
import * as Haptics from 'expo-haptics';

const QuickActions = ({ actions, onActionPress, visible = true }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (!visible || !actions || actions.length === 0) {
    return null;
  }

  const handleActionPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onActionPress) {
      onActionPress(action.action);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.7}
          >
            <Chip
              mode="outlined"
              style={styles.chip}
              textStyle={styles.chipText}
              onPress={() => handleActionPress(action)}
            >
              {action.text}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
    opacity: 0.7,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default React.memo(QuickActions);
