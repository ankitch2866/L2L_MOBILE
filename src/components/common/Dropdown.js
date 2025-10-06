import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, TextInput, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Dropdown = ({ label, value, onValueChange, items, error, disabled, style }) => {
  const [visible, setVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);
  const displayValue = selectedItem ? selectedItem.label : '';

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
                  icon={() => <Icon name="chevron-down" size={24} color={disabled ? '#999' : '#666'} />}
                />
              }
              style={[styles.input, disabled && styles.disabled]}
              pointerEvents="none"
            />
          </TouchableOpacity>
        }
        contentStyle={styles.menuContent}
      >
        {items.length > 0 ? (
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
    maxHeight: 300,
    backgroundColor: '#fff',
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
