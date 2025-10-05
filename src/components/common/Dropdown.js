import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';

const Dropdown = ({ label, value, onValueChange, items, error, disabled }) => {
  const [visible, setVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);
  const displayText = selectedItem ? selectedItem.label : `Select ${label}`;

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>{label}</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => !disabled && setVisible(true)}
            disabled={disabled}
            style={[styles.button, error && styles.errorButton]}
            contentStyle={styles.buttonContent}
          >
            {displayText}
          </Button>
        }
      >
        {items.map((item) => (
          <Menu.Item
            key={item.value}
            onPress={() => {
              onValueChange(item.value);
              setVisible(false);
            }}
            title={item.label}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#6B7280',
  },
  button: {
    justifyContent: 'flex-start',
  },
  buttonContent: {
    justifyContent: 'flex-start',
  },
  errorButton: {
    borderColor: '#EF4444',
  },
});

export default Dropdown;
