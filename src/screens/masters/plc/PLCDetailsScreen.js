import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, IconButton, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import { LoadingIndicator } from '../../../components';
import { fetchPLCById, deletePLC, fetchPLCs } from '../../../store/slices/plcSlice';

const PLCDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { current, loading } = useSelector(state => state.plc);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchPLCById(id));
  }, [dispatch, id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete PLC',
      'Are you sure you want to delete this PLC?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await dispatch(deletePLC(id)).unwrap();
              Alert.alert('Success', 'PLC deleted successfully', [
                { text: 'OK', onPress: () => {
                  dispatch(fetchPLCs());
                  navigation.goBack();
                }}
              ]);
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete PLC');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !current) return <LoadingIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              {current.plc_name}
            </Text>
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => navigation.navigate('EditPLC', { id: current.plc_id })}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>PLC ID:</Text>
            <Text variant="bodyMedium" style={styles.value}>PLC-{current.plc_id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Value:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {current.value}{current.is_percentage ? '%' : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Type:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {current.is_percentage ? 'Percentage' : 'Fixed Amount'}
            </Text>
          </View>

          {current.remark && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Remark:</Text>
              <Text variant="bodyMedium" style={[styles.value, styles.remarkText]}>
                {current.remark}
              </Text>
            </View>
          )}

          {current.updated_at && (
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>Last Updated:</Text>
              <Text variant="bodySmall" style={styles.value}>
                {new Date(current.updated_at).toLocaleString()}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditPLC', { id: current.plc_id })}
          style={styles.actionButton}
        >
          Edit PLC
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          loading={deleting}
          disabled={deleting}
          style={styles.actionButton}
          textColor={theme.colors.error}
        >
          Delete PLC
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontWeight: 'bold', flex: 1 },
  divider: { marginVertical: 16 },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    color: '#6B7280',
    width: 120,
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontWeight: '600',
  },
  remarkText: {
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default PLCDetailsScreen;
