// Chatbot Component - Main component that ties everything together
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useChatbot } from '../../hooks/useChatbot';
import FloatingChatButton from './FloatingChatButton';
import ChatModal from './ChatModal';

const Chatbot = () => {
  // Check if user is authenticated
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  
  // Use chatbot hook
  const {
    isOpen,
    messages,
    isLoading,
    context,
    hasUnreadMessages,
    isListening,
    isSpeaking,
    isVoiceAvailable,
    sendMessage,
    clearChat,
    startVoiceInput,
    stopVoiceInput,
    speakLastMessage,
    stopSpeaking,
    getQuickActions,
    openChat,
    closeChat,
  } = useChatbot();

  // Only show chatbot if user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Floating Button */}
      <FloatingChatButton
        onPress={openChat}
        hasUnreadMessages={hasUnreadMessages}
      />

      {/* Chat Modal */}
      <ChatModal
        visible={isOpen}
        onClose={closeChat}
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        context={context}
        quickActions={getQuickActions()}
        onQuickAction={sendMessage}
        startVoiceInput={startVoiceInput}
        stopVoiceInput={stopVoiceInput}
        onSpeakerPress={isSpeaking ? stopSpeaking : speakLastMessage}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isVoiceAvailable={isVoiceAvailable}
        onClearChat={clearChat}
      />
    </View>
  );
};

export default Chatbot;
