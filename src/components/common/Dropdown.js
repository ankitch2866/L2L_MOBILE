import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Menu, TextInput, Text } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

const Dropdown = ({ label, value, onValueChange, items = [], error, disabled, style }) => {
  const [visible, setVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);
  const displayValue = selectedItem ? selectedItem.label : '';

  // Dynamic height calculation
  const getMenuContentStyle = () => ({
    maxHeight: Math.min(400, items.length * 50 + 20),
    backgroundColor: '#fff',
  });

  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={visible && !disabled}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableOpacity
            onPress={() => !disabled && setVisible(true)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <TextInput
              label={label}
              value={displayValue}
              mode="outlined"
              editable={false}
              error={error}
              disabled={disabled}
              right={
                <TextInput.Icon
                  icon={() => <PaperIcon source="chevron-down" size={24} color={disabled ? '#999' : '#666'} />}
                />
              }
              style={[styles.input, disabled && styles.disabled]}
              pointerEvents="none"
            />
          </TouchableOpacity>
        }
        contentStyle={[
          getMenuContentStyle(),
          items.length > 8 && { paddingVertical: 0 } // Remove padding when scrolling
        ]}
      >
        {items.length > 0 ? (
          items.length > 8 ? (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
              {items.map((item, index) => (
                <Menu.Item
                  key={`menu-item-${item.value}-${index}`}
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                  title={item.label}
                  titleStyle={value === item.value ? styles.selectedText : null}
                  style={value === item.value ? styles.selectedItem : null}
                />
              ))}
            </ScrollView>
          ) : (
            items.map((item, index) => (
              <Menu.Item
                key={`menu-item-${item.value}-${index}`}
                onPress={() => {
                  onValueChange(item.value);
                  setVisible(false);
                }}
                title={item.label}
                titleStyle={value === item.value ? styles.selectedText : null}
                style={value === item.value ? styles.selectedItem : null}
              />
            ))
          )
        ) : (
          <Menu.Item key="no-options" title="No options available" disabled />
        )}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#fff',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
  },
  menuContent: {
    backgroundColor: '#fff',
  },
  scrollView: {
    maxHeight: 350, // Max height for scrollable content
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
  },
  selectedText: {
    fontWeight: '600',
    color: '#1976D2',
  },
});

export default Dropdown;
