// TypingIndicator Component - Shows when bot is typing
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context';

const TypingIndicator = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounceAnimation = (animValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createBounceAnimation(dot1Anim, 0);
    const animation2 = createBounceAnimation(dot2Anim, 150);
    const animation3 = createBounceAnimation(dot3Anim, 300);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  const getDotStyle = (animValue) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.3],
        }),
      },
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, getDotStyle(dot1Anim)]} />
          <Animated.View style={[styles.dot, getDotStyle(dot2Anim)]} />
          <Animated.View style={[styles.dot, getDotStyle(dot3Anim)]} />
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 3,
  },
});

export default React.memo(TypingIndicator);
