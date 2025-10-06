import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context';
import { LoadingIndicator } from '../../components';
import { Icon as PaperIcon } from 'react-native-paper';
import { fetchPropertyById, deleteProperty, clearCurrentProperty } from '../../store/slices/propertiesSlice';

const PropertyDetailsScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { currentProperty, loading } = useSelector(state => state.properties);

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
    return () => dispatch(clearCurrentProperty());
  }, [dispatch, propertyId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      `Delete Unit ${currentProperty?.unit_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteProperty(propertyId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) return <LoadingIndicator />;
  if (!currentProperty) return null;

  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.row}>
      <PaperIcon source={icon} size={20} color={theme.colors.primary} />
      <View style={styles.rowContent}>
        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>{label}</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.text }}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.text }]}>
            Unit {currentProperty.unit_number}
          </Text>
          
          <Divider style={styles.divider} />
          
          <DetailRow icon="office-building" label="Project" value={currentProperty.project_name} />
          <DetailRow icon="floor-plan" label="Area" value={`${currentProperty.area_sqft} sqft`} />
          <DetailRow icon="currency-inr" label="Price" value={`₹${currentProperty.price?.toLocaleString()}`} />
          
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditProperty', { propertyId })}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={handleDelete}
              textColor="#EF4444"
              style={styles.button}
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  divider: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  rowContent: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
});

export default PropertyDetailsScreen;
