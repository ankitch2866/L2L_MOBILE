import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaWrapper = ({ children, style, ...props }) => {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return (
      <SafeAreaView 
        style={[
          {
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
          style
        ]} 
        {...props}
      >
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[{ flex: 1 }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;
