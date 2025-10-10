// Property Details Modal Component
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  BackHandler,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useTheme } from '../../context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PropertyDetailsModal = ({ visible, property, onClose }) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // Animate modal open/close
  useEffect(() => {
    if (visible) {
      // Opening animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Closing animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!property) return null;

  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Property Image Header */}
            <View style={styles.imageContainer}>
              <Image
                source={property.img}
                style={styles.propertyImage}
                resizeMode="cover"
              />
              
              {/* Gradient Overlay */}
              <View style={styles.gradientOverlay} />
              
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Property Title on Image */}
              <View style={styles.titleOverlay}>
                <Text variant="headlineMedium" style={styles.propertyTitle}>
                  {property.title}
                </Text>
                <Text variant="bodyMedium" style={styles.propertyType}>
                  {property.propertyType}
                </Text>
              </View>
            </View>

            {/* Content Sections */}
            <View style={styles.contentContainer}>
              {/* Description */}
              <View style={styles.section}>
                <Text variant="bodyLarge" style={styles.description}>
                  {property.description}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="map-marker" size={24} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Location
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.locationText}>
                  {property.location}
                </Text>
              </View>

              {/* Specifications */}
              {property.specifications && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="ruler-square" size={24} color={theme.colors.primary} />
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Specifications
                    </Text>
                  </View>
                  <View style={styles.specsGrid}>
                    {Object.entries(property.specifications).map(([key, value]) => (
                      <View key={key} style={styles.specItem}>
                        <Text variant="bodySmall" style={styles.specLabel}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                        <Text variant="bodyMedium" style={styles.specValue}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Key Features */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="star" size={24} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Key Features
                  </Text>
                </View>
                {property.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Icon name="check-circle" size={20} color="#10B981" />
                    <Text variant="bodyMedium" style={styles.featureText}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Amenities */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="home-city" size={24} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Amenities
                  </Text>
                </View>
                <View style={styles.amenitiesGrid}>
                  {property.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Icon name="checkbox-marked-circle" size={18} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={styles.amenityText}>
                        {amenity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Pricing */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="currency-inr" size={24} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Pricing
                  </Text>
                </View>
                <Text variant="headlineSmall" style={styles.pricingText}>
                  {property.pricing}
                </Text>
              </View>

              {/* Contact Button */}
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                activeOpacity={0.8}
              >
                <Icon name="phone" size={20} color="#FFFFFF" />
                <Text variant="titleMedium" style={styles.contactButtonText}>
                  Contact Us
                </Text>
              </TouchableOpacity>

              {/* Bottom Spacing */}
              <View style={styles.bottomSpacing} />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: StatusBar.currentHeight || 0,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Moved lower to avoid status bar/notch overlap
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  propertyTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyType: {
    color: '#E5E7EB',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginLeft: 8,
    color: theme.colors.text,
  },
  description: {
    color: theme.colors.text,
    lineHeight: 24,
  },
  locationText: {
    color: theme.colors.textSecondary,
    marginLeft: 32,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 32,
    gap: 16,
  },
  specItem: {
    minWidth: '45%',
  },
  specLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  specValue: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 32,
  },
  featureText: {
    marginLeft: 12,
    color: theme.colors.text,
    flex: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 32,
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: 8,
  },
  amenityText: {
    marginLeft: 8,
    color: theme.colors.text,
    flex: 1,
  },
  pricingText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 32,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default PropertyDetailsModal;
