import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context';
import PLCCard from '../../../components/masters/PLCCard';
import { LoadingIndicator, EmptyState } from '../../../components';
import { fetchPLCs, setSearchQuery } from '../../../store/slices/plcSlice';

const PLCListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { list, loading, searchQuery } = useSelector(state => state.plc);
  const [refreshing, setRefreshing] = useState(false);

  const filteredPLCs = (list || []).filter(plc => {
    const matchesSearch = 
      plc.plc_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plc.remark?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  useEffect(() => {
    dispatch(fetchPLCs());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPLCs());
    setRefreshing(false);
  };

  if (loading && list.length === 0) return <LoadingIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Searchbar
          placeholder="Search PLCs..."
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredPLCs}
        renderItem={({ item }) => (
          <PLCCard
            plc={item}
            onPress={(plc) => navigation.navigate('PLCDetails', { id: plc.plc_id })}
            onEdit={(plc) => navigation.navigate('EditPLC', { id: plc.plc_id })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.plc_id?.toString()}
        ListEmptyComponent={
          <EmptyState
            icon="currency-usd"
            title="No PLCs"
            message={searchQuery ? "No matching PLCs" : "Add your first PLC"}
            actionText="Add PLC"
            onActionPress={() => navigation.navigate('AddPLC')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddPLC')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  searchbar: { elevation: 0 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default PLCListScreen;
