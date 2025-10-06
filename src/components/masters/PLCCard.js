import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';

const PLCCard = ({ plc, onPress, onEdit, theme }) => {
  const name = plc?.plc_name || 'N/A';
  const id = plc?.plc_id ? String(plc.plc_id) : 'N/A';
  const value = plc?.value !== undefined && plc?.value !== null ? plc.value : 'N/A';
  const isPercentage = plc?.is_percentage === 1 || plc?.is_percentage === true;
  const remark = plc?.remark || null;

  return (
    <Card style={styles.card} onPress={() => onPress(plc)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.name}>
              {name}
            </Text>
            <Text variant="bodySmall" style={styles.id}>
              {id !== 'N/A' ? `PLC-${id}` : 'N/A'}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(plc)}
            style={styles.editButton}
          />
        </View>

        <View style={styles.valueContainer}>
          <Text variant="headlineSmall" style={styles.value}>
            {value !== 'N/A' ? `${value}${isPercentage ? '%' : ''}` : 'N/A'}
          </Text>
          <Chip 
            mode="outlined" 
            style={styles.chip}
            textStyle={styles.chipText}
          >
            {isPercentage ? 'Percentage' : 'Fixed'}
          </Chip>
        </View>

        {remark && (
          <View style={styles.remarkContainer}>
            <Text variant="bodySmall" style={styles.remarkLabel}>
              Remark:
            </Text>
            <Text variant="bodySmall" style={styles.remarkText} numberOfLines={2}>
              {remark}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  id: {
    color: '#6B7280',
  },
  editButton: {
    margin: 0,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: {
    fontWeight: 'bold',
    color: '#059669',
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  remarkContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remarkLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  remarkText: {
    fontStyle: 'italic',
    color: '#374151',
  },
});

export default PLCCard;
