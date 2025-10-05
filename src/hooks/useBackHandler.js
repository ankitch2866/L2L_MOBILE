// Back Navigation Handler Hook
import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Custom hook for handling back button behavior
 * @param {Function} onBackPress - Custom back press handler
 * @param {boolean} showExitConfirmation - Show exit confirmation on home screen
 * @returns {void}
 */
export const useBackHandler = (onBackPress, showExitConfirmation = false) => {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPressHandler = () => {
        if (onBackPress) {
          return onBackPress();
        }

        if (showExitConfirmation) {
          Alert.alert(
            'Exit App',
            'Are you sure you want to exit?',
            [
              {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
              },
              {
                text: 'Exit',
                onPress: () => BackHandler.exitApp(),
                style: 'destructive',
              },
            ],
            { cancelable: false }
          );
          return true;
        }

        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPressHandler
      );

      return () => subscription.remove();
    }, [onBackPress, showExitConfirmation])
  );
};

/**
 * Hook for double tap to exit functionality
 * @param {number} delay - Delay between taps in milliseconds
 * @returns {Function} - Function to call on back press
 */
export const useDoubleBackToExit = (delay = 2000) => {
  let backPressedOnce = false;

  const handleBackPress = () => {
    if (backPressedOnce) {
      BackHandler.exitApp();
      return true;
    }

    backPressedOnce = true;
    Alert.alert('', 'Press back again to exit', [], { cancelable: true });

    setTimeout(() => {
      backPressedOnce = false;
    }, delay);

    return true;
  };

  return handleBackPress;
};

/**
 * Hook for preventing back navigation
 * @param {boolean} preventBack - Whether to prevent back navigation
 * @param {string} message - Message to show when back is pressed
 * @returns {void}
 */
export const usePreventBack = (preventBack = false, message = 'Are you sure you want to go back?') => {
  useFocusEffect(
    React.useCallback(() => {
      if (!preventBack) return;

      const onBackPress = () => {
        Alert.alert(
          'Confirm',
          message,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                // Allow back navigation
                BackHandler.exitApp();
              },
            },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [preventBack, message])
  );
};
