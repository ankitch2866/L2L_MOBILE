// Property Grid View Component - Matches Web Frontend with Real Images
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../context';
import PropertyDetailsModal from '../../components/dashboard/PropertyDetailsModal';
import { getPropertyDetails } from '../../data/propertyDetails';

const PropertyGridView = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Static property data - matches web frontend exactly
  const propertyCategories = [
    {
      title: 'THE RISE OF LIFESTYLE',
      properties: [
        { id: 1, title: 'Grandeur Estates', img: require('../../../assets/properties/p1.jpg') },
        { id: 2, title: 'Aura Heights Villas', img: require('../../../assets/properties/real2.jpg') },
        { id: 3, title: 'Holiday Homes', img: require('../../../assets/properties/real3.jpg') },
      ],
    },
    {
      title: 'CITY LIVING',
      properties: [
        { id: 4, title: 'Penthouse Suites', img: require('../../../assets/properties/p2.jpg') },
        { id: 5, title: 'Townhouses', img: require('../../../assets/properties/real1.jpg') },
        { id: 6, title: 'Apartments', img: require('../../../assets/properties/p4.jpg') },
      ],
    },
    {
      title: 'INVESTMENT OPPORTUNITIES',
      properties: [
        { id: 7, title: 'Commercial Spaces', img: require('../../../assets/properties/p6.jpg') },
        { id: 8, title: 'Holiday Homes', img: require('../../../assets/properties/p3.jpg') },
        { id: 9, title: 'Haute Habitat', img: require('../../../assets/properties/p5.jpg') },
      ],
    },
  ];

  const handlePropertyPress = (property) => {
    const details = getPropertyDetails(property.id);
    if (details) {
      setSelectedProperty({ ...property, ...details });
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setSelectedProperty(null);
    }, 300); // Wait for animation to complete
  };

  const styles = getStyles(theme);

  return (
    <>
      <ScrollView style={styles.container}>
        {propertyCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <Text variant="titleLarge" style={styles.categoryTitle}>
              {category.title}
            </Text>
            
            <View style={styles.propertiesGrid}>
              {category.properties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.propertyCard}
                  onPress={() => handlePropertyPress(property)}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={property.img}
                      style={styles.propertyImage}
                      resizeMode="cover"
                    />
                    <View style={styles.overlay}>
                      <Text variant="titleMedium" style={styles.propertyTitle}>
                        {property.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        visible={modalVisible}
        property={selectedProperty}
        onClose={handleCloseModal}
      />
    </>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categorySection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontWeight: '300',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  propertiesGrid: {
    gap: 16,
  },
  propertyCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: theme.colors.card,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  propertyTitle: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 18,
  },
});

export default PropertyGridView;
