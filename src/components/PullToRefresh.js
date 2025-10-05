// Pull-to-Refresh Component
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

const PullToRefresh = ({ children, onRefresh, refreshing: externalRefreshing }) => {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  
  const isRefreshing = externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const handleRefresh = async () => {
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }
    
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#EF4444']} // Android
          tintColor="#EF4444" // iOS
          title="Pull to refresh"
          titleColor="#6B7280"
        />
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default PullToRefresh;
