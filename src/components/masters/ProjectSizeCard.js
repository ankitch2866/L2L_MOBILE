import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';

const ProjectSizeCard = ({ projectSize, onPress, onEdit, theme }) => {
  const size = projectSize?.size !== undefined && projectSize?.size !== null ? projectSize.size : 'N/A';
  const id = projectSize?.id ? String(projectSize.id) : 'N/A';
  const projectName = projectSize?.project_name || 'Unknown Project';
  const projectId = projectSize?.project_id || 'N/A';

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.size}>
              {size !== 'N/A' ? `${size} sq ft` : 'N/A'}
            </Text>
            <Text variant="bodySmall" style={styles.id}>
              {id !== 'N/A' ? `Size ID: ${id}` : 'N/A'}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(projectSize)}
            style={styles.editButton}
          />
        </View>

        <View style={styles.projectContainer}>
          <View style={styles.projectInfo}>
            <Text variant="bodySmall" style={styles.projectLabel}>
              Project:
            </Text>
            <Text variant="bodyMedium" style={styles.projectName}>
              {projectName}
            </Text>
          </View>
          <Chip 
            mode="outlined" 
            style={styles.chip}
            textStyle={styles.chipText}
            icon="home-city"
          >
            ID: {projectId}
          </Chip>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Text variant="bodySmall" style={styles.infoLabel}>
              📏 Area
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {size !== 'N/A' ? `${size} sq ft` : 'N/A'}
            </Text>
          </View>
        </View>
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
  size: {
    fontWeight: 'bold',
    color: '#059669',
    fontSize: 20,
    marginBottom: 4,
  },
  id: {
    color: '#6B7280',
  },
  editButton: {
    margin: 0,
  },
  projectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  projectInfo: {
    flex: 1,
  },
  projectLabel: {
    color: '#6B7280',
    marginBottom: 2,
  },
  projectName: {
    fontWeight: '600',
    color: '#111827',
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default ProjectSizeCard;
