// Breadcrumb Navigation Component
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const BreadcrumbNavigation = ({ breadcrumbs = [], onBreadcrumbPress }) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {breadcrumbs.map((breadcrumb, index) => (
          <View key={index} style={styles.breadcrumbContainer}>
            <Chip
              mode={index === breadcrumbs.length - 1 ? 'flat' : 'outlined'}
              onPress={() => onBreadcrumbPress && onBreadcrumbPress(breadcrumb, index)}
              style={[
                styles.breadcrumb,
                index === breadcrumbs.length - 1 ? styles.activeBreadcrumb : styles.inactiveBreadcrumb
              ]}
              textStyle={[
                styles.breadcrumbText,
                index === breadcrumbs.length - 1 ? styles.activeBreadcrumbText : styles.inactiveBreadcrumbText
              ]}
              disabled={index === breadcrumbs.length - 1}
            >
              {breadcrumb.title}
            </Chip>
            
            {index < breadcrumbs.length - 1 && (
              <Icon 
                name="chevron-right" 
                size={16} 
                color="#6B7280" 
                style={styles.separator}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumb: {
    marginHorizontal: 2,
  },
  activeBreadcrumb: {
    backgroundColor: '#EF4444',
  },
  inactiveBreadcrumb: {
    backgroundColor: 'transparent',
    borderColor: '#D1D5DB',
  },
  breadcrumbText: {
    fontSize: 12,
  },
  activeBreadcrumbText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inactiveBreadcrumbText: {
    color: '#6B7280',
  },
  separator: {
    marginHorizontal: 4,
  },
});

export default BreadcrumbNavigation;
