import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const PropertyCard = ({ property, onPress, onEdit, theme }) => {
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(property)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PaperIcon source="home" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]}>
              Unit {property.unit_number}
            </Text>
          </View>
          <Chip mode="flat" compact>{property.project_name}</Chip>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <PaperIcon source="floor-plan" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {property.area_sqft} sqft
            </Text>
          </View>
          <View style={styles.detailRow}>
            <PaperIcon source="currency-inr" size={16} color={theme.colors.textSecondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              ₹{property.price?.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onEdit(property)} style={styles.editBtn}>
          <PaperIcon source="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8 },
  header: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { flex: 1, fontWeight: '600' },
  details: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { position: 'absolute', top: 8, right: 8, padding: 8 },
});

export default PropertyCard;
