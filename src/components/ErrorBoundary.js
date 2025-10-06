// Error Boundary Component
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { Icon as PaperIcon } from 'react-native-paper';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.iconContainer}>
                  <PaperIcon source="alert-circle" size={64} color="#DC2626" />
                </View>
                
                <Text variant="headlineSmall" style={styles.title}>
                  Oops! Something went wrong
                </Text>
                
                <Text variant="bodyMedium" style={styles.message}>
                  We're sorry for the inconvenience. The app encountered an unexpected error.
                </Text>

                {__DEV__ && this.state.error && (
                  <View style={styles.errorDetails}>
                    <Text variant="titleSmall" style={styles.errorTitle}>
                      Error Details:
                    </Text>
                    <Text variant="bodySmall" style={styles.errorText}>
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <Text variant="bodySmall" style={styles.errorStack}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </View>
                )}

                <Button
                  mode="contained"
                  onPress={this.handleReset}
                  style={styles.button}
                  icon="refresh"
                >
                  Try Again
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    color: '#991B1B',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    color: '#991B1B',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  button: {
    backgroundColor: '#EF4444',
  },
});

export default ErrorBoundary;
