import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#EF4444" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default LoadingIndicator;
