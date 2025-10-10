// MessageBubble Component - Individual message display
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context';

const MessageBubble = ({ message, isUser }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <Text key={index} style={[styles.messageText, styles.bulletPoint, isUser && styles.userText]}>
            {line.trim()}
          </Text>
        );
      }
      if (line.trim() === '') return <View key={index} style={styles.lineBreak} />;
      return (
        <Text key={index} style={[styles.messageText, isUser && styles.userText]}>
          {line}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      {isUser ? (
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          {formatContent(message.content)}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.botBubble]}>
          {formatContent(message.content)}
        </View>
      )}
      <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.onSurface,
  },
  userText: {
    color: '#FFFFFF',
  },
  bulletPoint: {
    marginVertical: 2,
  },
  lineBreak: {
    height: 8,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: theme.colors.onSurface,
    textAlign: 'right',
  },
  botTimestamp: {
    color: theme.colors.onSurface,
    textAlign: 'left',
  },
});

export default React.memo(MessageBubble);
