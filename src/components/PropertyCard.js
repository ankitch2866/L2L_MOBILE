// Property Card Component
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';

const PropertyCard = ({ property, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(property)}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: property.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text variant="titleMedium" style={styles.title}>
            {property.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 150,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default React.memo(PropertyCard);
