// FloatingChatButton Component - Draggable floating button
import React, { useRef, useEffect } from 'react';
import { View, Animated, PanResponder, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const EDGE_MARGIN = 16;
const BOTTOM_MARGIN = 100;

const FloatingChatButton = ({ onPress, hasUnreadMessages = false }) => {
  const pan = useRef(new Animated.ValueXY({
    x: SCREEN_WIDTH - BUTTON_SIZE - EDGE_MARGIN,
    y: SCREEN_HEIGHT - BUTTON_SIZE - BOTTOM_MARGIN,
  })).current;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only set pan responder if user has moved more than 5 pixels
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        // Mark as dragging if moved more than 10 pixels
        if (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10) {
          isDragging.current = true;
        }
        
        // Update position
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        // If it was a tap (minimal movement), trigger onPress
        if (!isDragging.current && Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10) {
          onPress && onPress();
          return;
        }
        
        // Only snap to edge if user was dragging
        if (isDragging.current) {
          const currentX = pan.x._value;
          const currentY = pan.y._value;
          
          // Snap to nearest edge (left or right)
          const snapToLeft = currentX < SCREEN_WIDTH / 2;
          const targetX = snapToLeft ? EDGE_MARGIN : SCREEN_WIDTH - BUTTON_SIZE - EDGE_MARGIN;
          
          // Keep within vertical bounds
          let targetY = currentY;
          const minY = EDGE_MARGIN;
          const maxY = SCREEN_HEIGHT - BUTTON_SIZE - EDGE_MARGIN;
          
          if (targetY < minY) targetY = minY;
          if (targetY > maxY) targetY = maxY;
          
          // Animate to final position
          Animated.spring(pan, {
            toValue: { x: targetX, y: targetY },
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
          
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        isDragging.current = false;
      },
    })
  ).current;

  // Pulse animation when idle
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // Badge animation
  useEffect(() => {
    if (hasUnreadMessages) {
      Animated.sequence([
        Animated.spring(badgeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 3,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(badgeAnim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(badgeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.timing(badgeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [hasUnreadMessages]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Icon name="chat" size={28} color="#FFFFFF" />
        </LinearGradient>
        
        {hasUnreadMessages && (
          <Animated.View
            style={[
              styles.badge,
              {
                transform: [{ scale: badgeAnim }],
                opacity: badgeAnim,
              },
            ]}
          >
            <View style={styles.badgeDot} />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

export default FloatingChatButton;
