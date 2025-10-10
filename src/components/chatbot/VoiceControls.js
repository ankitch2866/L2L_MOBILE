// VoiceControls Component - Microphone and speaker buttons
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

const VoiceControls = ({
  onMicPress,
  onSpeakerPress,
  isListening = false,
  isSpeaking = false,
  disabled = false,
  showMicrophone = true
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const micPulseAnim = useRef(new Animated.Value(1)).current;
  const speakerPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(micPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => {
        pulseAnimation.stop();
        micPulseAnim.setValue(1);
      };
    } else {
      micPulseAnim.setValue(1);
    }
  }, [isListening]);

  useEffect(() => {
    if (isSpeaking) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(speakerPulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(speakerPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => {
        pulseAnimation.stop();
        speakerPulseAnim.setValue(1);
      };
    } else {
      speakerPulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  const handleMicPress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onMicPress) onMicPress();
  };

  const handleSpeakerPress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSpeakerPress) onSpeakerPress();
  };

  return (
    <View style={styles.container}>
      {showMicrophone && (
        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: micPulseAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.button,
              isListening ? styles.activeButton : styles.inactiveButton,
              disabled && styles.disabledButton
            ]}
            onPress={handleMicPress}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Icon
              name={isListening ? 'microphone' : 'microphone-outline'}
              size={20}
              color={isListening ? '#FFFFFF' : theme.colors.primary}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: speakerPulseAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.button,
            isSpeaking ? styles.activeButton : styles.inactiveButton,
            disabled && styles.disabledButton
          ]}
          onPress={handleSpeakerPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Icon
            name={isSpeaking ? 'volume-high' : 'volume-medium'}
            size={20}
            color={isSpeaking ? '#FFFFFF' : theme.colors.primary}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  buttonContainer: {
    marginHorizontal: 4,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  inactiveButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: theme.colors.surfaceDisabled,
    borderColor: theme.colors.outline,
  },
});

export default React.memo(VoiceControls);
