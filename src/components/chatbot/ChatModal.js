// ChatModal Component - Main chat interface with animations
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Easing,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import VoiceControls from './VoiceControls';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatModal = ({
  visible,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  context,
  quickActions,
  onQuickAction,
  startVoiceInput,
  stopVoiceInput,
  onSpeakerPress,
  isListening,
  isSpeaking,
  isVoiceAvailable,
  onClearChat,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Show modal immediately
      setModalVisible(true);

      // Reset animation values before starting
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);

      // iPhone-style scale animation - expand from bot icon
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      // Collapse back into bot icon with smooth animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide modal after animation completes
        setModalVisible(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Quick actions always visible - removed auto-hide on typing
  // useEffect(() => {
  //   setShowQuickActions(inputText.trim().length === 0);
  // }, [inputText]);

  const lastSendTime = useRef(0);

  const handleSend = () => {
    // Prevent rapid button presses (debounce)
    const now = Date.now();
    if (now - lastSendTime.current < 500) {
      return;
    }
    lastSendTime.current = now;

    const message = inputText.trim();

    // Validate message
    if (!message) {
      return;
    }

    if (message.length > 1000) {
      // Show error in chat
      return;
    }

    if (onSendMessage) {
      onSendMessage(message);
      setInputText('');
      // Quick actions stay visible
    }
  };

  const handleQuickAction = (action) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
    // Quick actions stay visible
  };

  const handleMicPress = () => {
    if (isListening) {
      // Stop listening
      stopVoiceInput();
    } else {
      // Start listening with real-time transcript callback
      startVoiceInput((transcript) => {
        // Update input text in real-time as user speaks
        setInputText(transcript);
      });
    }
  };

  const getContextDisplayName = (ctx) => {
    const contextNames = {
      general: 'General',
      projects: 'Projects',
      customers: 'Customers',
      payments: 'Payments',
      reports: 'Reports',
      bookings: 'Bookings',
      brokers: 'Brokers',
      properties: 'Properties',
      masters: 'Masters',
      utilities: 'Utilities',
      dispatches: 'Dispatches',
      feedback: 'Feedback',
    };
    return contextNames[ctx] || 'General';
  };

  const styles = getStyles(theme, insets);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 10}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                  <Text style={styles.headerTitle}>HL Assistant</Text>
                  <Text style={styles.headerSubtitle}>
                    Context: {getContextDisplayName(context)}
                  </Text>
                </View>

                <TouchableOpacity onPress={onClearChat} style={styles.clearButton}>
                  <Icon name="broom" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.messagesContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => (
                  <MessageBubble message={item} isUser={item.type === 'user'} />
                )}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }}
              />
              {isLoading && <TypingIndicator />}
            </View>

            {quickActions && quickActions.length > 0 && (
              <QuickActions
                actions={quickActions}
                onActionPress={handleQuickAction}
                visible={true}
              />
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <VoiceControls
                  onMicPress={handleMicPress}
                  onSpeakerPress={onSpeakerPress}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  disabled={isLoading}
                  showMicrophone={isVoiceAvailable}
                />

                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Type your message..."
                    placeholderTextColor={theme.colors.onSurface + '80'}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    inputText.trim().length > 0 ? styles.sendButtonActive : styles.sendButtonInactive
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="send"
                    size={20}
                    color={inputText.trim().length > 0 ? '#FFFFFF' : theme.colors.onSurface + '80'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  clearButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Math.max(insets.bottom, 8) + 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: theme.colors.surfaceDisabled,
  },
});

export default ChatModal;
