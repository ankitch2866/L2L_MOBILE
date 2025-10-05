import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProjectCard = ({ project, onPress, onEdit, onDelete, theme }) => {
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => onPress(project)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name="office-building" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {project.project_name}
            </Text>
          </View>
          <Chip mode="flat" compact>{project.company_name}</Chip>
        </View>
        
        <View style={styles.location}>
          <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
          <Text variant="bodySmall" style={[styles.address, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {project.address}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(project)} style={styles.actionBtn}>
            <Icon name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(project)} style={styles.actionBtn}>
            <Icon name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8 },
  header: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { flex: 1, fontWeight: '600' },
  location: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 12 },
  address: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 },
  actionBtn: { padding: 8 },
});

export default ProjectCard;
