// Top Navigation Bar Component
import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';

const TopNavigationBar = ({ 
  title, 
  navigation, 
  showBackButton = false, 
  showMenuButton = true,
  actions = [] 
}) => {
  const { user } = useSelector((state) => state.auth);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  return (
    <Appbar.Header style={styles.header}>
      {showBackButton ? (
        <Appbar.BackAction onPress={handleBackPress} color="#FFFFFF" />
      ) : showMenuButton ? (
        <Appbar.Action icon="menu" onPress={handleMenuPress} color="#FFFFFF" />
      ) : null}
      
      <Appbar.Content 
        title={title} 
        titleStyle={styles.title}
      />
      
      {actions.map((action, index) => (
        <Appbar.Action
          key={index}
          icon={action.icon}
          onPress={action.onPress}
          color="#FFFFFF"
        />
      ))}
      
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Appbar.Action
            icon="account-circle"
            onPress={openMenu}
            color="#FFFFFF"
          />
        }
        contentStyle={styles.menu}
      >
        <Menu.Item
          leadingIcon="account"
          onPress={() => {
            closeMenu();
            navigation.navigate('Profile');
          }}
          title="Profile"
        />
        <Menu.Item
          leadingIcon="cog"
          onPress={() => {
            closeMenu();
            navigation.navigate('Settings');
          }}
          title="Settings"
        />
      </Menu>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#EF4444',
    elevation: 4,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  menu: {
    backgroundColor: '#FFFFFF',
  },
});

export default TopNavigationBar;
