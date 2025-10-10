// Custom Hook for Chatbot State Management
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chatService from '../services/chatService';
import voiceService from '../services/voiceService';

export const useChatbot = () => {
  // Try to get navigation, but don't fail if not available
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    // Navigation not available, will use default context
    navigation = null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([chatService.getWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('general');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recordingRef = useRef(null);

  // Load messages from storage on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 1) { // Don't save if only welcome message
      saveMessages();
    }
  }, [messages]);

  // Detect context from navigation (only if navigation is available)
  useEffect(() => {
    if (!navigation) return;
    
    try {
      // Initial context detection
      const state = navigation.getState();
      if (state) {
        const currentRoute = getCurrentRoute(state);
        detectContext(currentRoute?.name);
      }

      // Listen for navigation changes
      const unsubscribe = navigation.addListener('state', () => {
        const state = navigation.getState();
        if (state) {
          const currentRoute = getCurrentRoute(state);
          detectContext(currentRoute?.name);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.log('Navigation listener not available:', error);
    }
  }, [navigation]);

  /**
   * Get the current active route from navigation state
   */
  const getCurrentRoute = (state) => {
    if (!state) return null;
    
    // Navigate through nested navigators to find the active route
    const route = state.routes[state.index];
    
    if (route.state) {
      return getCurrentRoute(route.state);
    }
    
    return route;
  };

  /**
   * Load messages from AsyncStorage
   */
  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem('chatMessages');
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  /**
   * Save messages to AsyncStorage
   */
  const saveMessages = async () => {
    try {
      // Keep only last 100 messages to prevent storage issues
      const messagesToSave = messages.slice(-100);
      await AsyncStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  /**
   * Detect context from route name
   * Maps all app routes to appropriate contexts
   */
  const detectContext = (routeName) => {
    if (!routeName) return;
    
    const route = routeName.toLowerCase();
    
    // Projects context
    if (route.includes('project') && !route.includes('size')) {
      setContext('projects');
    }
    // Customers context
    else if (route.includes('customer') || route.includes('coapplicant') || route.includes('co-applicant')) {
      setContext('customers');
    }
    // Payments context
    else if (
      route.includes('payment') || 
      route.includes('installment') || 
      route.includes('cheque') ||
      route.includes('transaction') ||
      route.includes('credit')
    ) {
      setContext('payments');
    }
    // Bookings context
    else if (route.includes('booking') || route.includes('allotment')) {
      setContext('bookings');
    }
    // Brokers context
    else if (route.includes('broker')) {
      setContext('brokers');
    }
    // Properties/Units context
    else if (route.includes('property') || route.includes('unit') || route.includes('stock')) {
      setContext('properties');
    }
    // Reports context
    else if (
      route.includes('report') || 
      route.includes('collection') ||
      route.includes('outstanding') ||
      route.includes('dues')
    ) {
      setContext('reports');
    }
    // Masters context
    else if (
      route.includes('master') ||
      route.includes('bank') ||
      route.includes('plc') ||
      route.includes('size') ||
      route.includes('plan')
    ) {
      setContext('masters');
    }
    // Utilities context
    else if (
      route.includes('utilities') ||
      route.includes('employee') ||
      route.includes('birthday') ||
      route.includes('log') ||
      route.includes('letter')
    ) {
      setContext('utilities');
    }
    // Dispatches context
    else if (route.includes('dispatch') || route.includes('bba')) {
      setContext('dispatches');
    }
    // Calling/Feedback context
    else if (route.includes('calling') || route.includes('feedback')) {
      setContext('feedback');
    }
    // Home/Dashboard context
    else if (route.includes('home') || route.includes('dashboard')) {
      setContext('general');
    }
    // Default to general
    else {
      setContext('general');
    }
  };

  /**
   * Send message to chatbot
   */
  const sendMessage = useCallback(async (messageText, isVoiceInput = false) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setHasUnreadMessages(false);

    // TEMPORARY: Show "Coming Soon" message instead of calling API
    const CHATBOT_API_ENABLED = false;

    try {
      if (!CHATBOT_API_ENABLED) {
        // Simulate a short delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: '🤖 Chat feature coming soon!\n\nOur AI assistant is currently under development. We\'re working hard to bring you an amazing chatbot experience.\n\nStay tuned for updates! 🚀',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Auto-speak if input was from voice
        if (isVoiceInput) {
          setTimeout(() => {
            speakLastMessage();
          }, 500);
        }
        
        // Show unread indicator if chat is closed
        if (!isOpen) {
          setHasUnreadMessages(true);
        }
      } else {
        // Original API call logic (will be used when backend is ready)
        const response = await chatService.sendMessage(messageText, context);
        
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.success ? response.response : (response.error || 'Sorry, I couldn\'t process that.'),
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Auto-speak if input was from voice
        if (isVoiceInput) {
          setTimeout(() => {
            speakLastMessage();
          }, 500);
        }
        
        // Show unread indicator if chat is closed
        if (!isOpen) {
          setHasUnreadMessages(true);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: error.message || 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (!isOpen) {
        setHasUnreadMessages(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [context, isOpen]);

  /**
   * Clear all messages except welcome
   */
  const clearChat = useCallback(async () => {
    setMessages([chatService.getWelcomeMessage()]);
    setHasUnreadMessages(false);
    await AsyncStorage.removeItem('chatMessages');
  }, []);

  /**
   * Start voice input (real-time speech recognition)
   * @param {Function} onTranscriptUpdate - Callback to update input text in real-time
   */
  const startVoiceInput = useCallback(async (onTranscriptUpdate) => {
    try {
      setIsListening(true);
      
      // Start real-time speech recognition
      await voiceService.startSpeechRecognition(
        // On partial results (real-time updates)
        (partialText) => {
          if (onTranscriptUpdate) {
            onTranscriptUpdate(partialText);
          }
        },
        // On final results
        (finalText) => {
          if (onTranscriptUpdate) {
            onTranscriptUpdate(finalText);
          }
        },
        // On error
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          
          const errorMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: 'Voice recognition error. Please try again.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      );
    } catch (error) {
      console.error('Voice input error:', error);
      setIsListening(false);
      
      const errorMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: error.message || 'Voice input is not available. Please use text input.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, []);

  /**
   * Stop voice input (does NOT auto-send)
   */
  const stopVoiceInput = useCallback(async () => {
    try {
      await voiceService.stopSpeechRecognition();
      setIsListening(false);
      // Text stays in input field - user clicks send manually
    } catch (error) {
      console.error('Stop voice input error:', error);
      setIsListening(false);
    }
  }, []);

  /**
   * Speak the last bot message
   */
  const speakLastMessage = useCallback(async () => {
    try {
      // If already speaking, stop
      if (isSpeaking) {
        await voiceService.stop();
        setIsSpeaking(false);
        return;
      }

      // Find last bot message
      const botMessages = messages.filter(m => m.type === 'bot');
      if (botMessages.length > 0) {
        const lastMessage = botMessages[botMessages.length - 1];
        setIsSpeaking(true);
        await voiceService.speak(lastMessage.content);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Speak error:', error);
      setIsSpeaking(false);
    }
  }, [messages, isSpeaking]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(async () => {
    try {
      await voiceService.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Stop speaking error:', error);
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Toggle speaking
   */
  const toggleSpeaking = useCallback(async () => {
    if (isSpeaking) {
      await stopSpeaking();
    } else {
      await speakLastMessage();
    }
  }, [isSpeaking, speakLastMessage, stopSpeaking]);

  /**
   * Get quick actions for current context
   */
  const getQuickActions = useCallback(() => {
    return chatService.getQuickActions(context);
  }, [context]);

  /**
   * Open chatbot modal
   */
  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasUnreadMessages(false);
  }, []);

  /**
   * Close chatbot modal
   */
  const closeChat = useCallback(() => {
    setIsOpen(false);
    // Stop any ongoing voice operations
    if (isListening) {
      stopVoiceInput();
    }
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [isListening, isSpeaking, stopVoiceInput, stopSpeaking]);

  return {
    // State
    isOpen,
    messages,
    isLoading,
    context,
    hasUnreadMessages,
    isListening,
    isSpeaking,
    isVoiceAvailable: voiceService.isVoiceRecognitionAvailable(),
    
    // Actions
    sendMessage,
    clearChat,
    startVoiceInput,
    stopVoiceInput,
    speakLastMessage,
    stopSpeaking,
    toggleSpeaking,
    getQuickActions,
    openChat,
    closeChat,
    
    // Setters (for direct control if needed)
    setIsOpen,
    setContext,
    setHasUnreadMessages,
  };
};
