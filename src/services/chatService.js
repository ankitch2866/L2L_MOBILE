// Chat Service - API integration for chatbot
import api from '../config/api';

class ChatService {
  /**
   * Send message to chatbot API
   * @param {string} message - User message
   * @param {string} context - Current context (general, projects, customers, etc.)
   * @returns {Promise} API response
   */
  async sendMessage(message, context = 'general') {
    // Validate message
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format.');
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      throw new Error('Message cannot be empty.');
    }

    if (trimmedMessage.length > 1000) {
      throw new Error('Message is too long. Please keep it under 1000 characters.');
    }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      // Race between API call and timeout
      const apiPromise = api.post('/api/chat', {
        message: trimmedMessage,
        context,
        domain: context
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Return user-friendly error messages
      if (error.message === 'Request timeout') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication error. Please log in again.');
      } else {
        throw new Error('Failed to send message. Please try again.');
      }
    }
  }

  /**
   * Get welcome message for chatbot
   * @returns {Object} Welcome message object
   */
  getWelcomeMessage() {
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `Hello! I'm your HL Group assistant. I can help you with:

• Broker management
• Customer information
• Project details
• Unit Availability
• Installment Plans
• General assistance

How can I help you today?`,
      timestamp: new Date()
    };
  }

  /**
   * Get quick action buttons based on context
   * @param {string} context - Current context
   * @returns {Array} Array of quick action objects
   */
  getQuickActions(context = 'general') {
    const actions = {
      general: [
        { text: 'Show broker stats', action: 'Show broker statistics' },
        { text: 'Project stats', action: 'Show project statistics' },
        { text: 'Project customers', action: 'Show all customers' },
        { text: 'List Installment plan', action: 'List all installment plans' },
        { text: 'Help booking', action: 'Help me with booking queries' },
        { text: 'Help allotment', action: 'Help me with allotment queries' }
      ],
      projects: [
        { text: 'List projects', action: 'List all projects' },
        { text: 'Project details', action: 'Show project details' },
        { text: 'Available units', action: 'Show available units' },
        { text: 'Project stats', action: 'Show project statistics' }
      ],
      customers: [
        { text: 'List customers', action: 'List all customers' },
        { text: 'Customer details', action: 'Show customer details' },
        { text: 'Customer payments', action: 'Show customer payments' },
        { text: 'Recent customers', action: 'Show recent customers' }
      ],
      payments: [
        { text: 'Payment stats', action: 'Show payment statistics' },
        { text: 'Recent payments', action: 'Show recent payments' },
        { text: 'Pending payments', action: 'Show pending payments' },
        { text: 'Payment help', action: 'Help with payment queries' }
      ],
      bookings: [
        { text: 'List bookings', action: 'List all bookings' },
        { text: 'Recent bookings', action: 'Show recent bookings' },
        { text: 'Booking status', action: 'Check booking status' },
        { text: 'Allotment help', action: 'Help with allotment queries' }
      ],
      brokers: [
        { text: 'List brokers', action: 'List all brokers' },
        { text: 'Broker stats', action: 'Show broker statistics' },
        { text: 'Top brokers', action: 'Show top performing brokers' },
        { text: 'Broker details', action: 'Show broker details' }
      ],
      properties: [
        { text: 'Available units', action: 'Show available units' },
        { text: 'Unit details', action: 'Show unit details' },
        { text: 'Stock status', action: 'Show stock status' },
        { text: 'Property help', action: 'Help with property queries' }
      ],
      reports: [
        { text: 'Available reports', action: 'Show available reports' },
        { text: 'Collection report', action: 'Show collection report' },
        { text: 'Outstanding dues', action: 'Show outstanding dues' },
        { text: 'Report help', action: 'Help with reports' }
      ],
      masters: [
        { text: 'List banks', action: 'List all banks' },
        { text: 'Payment plans', action: 'Show payment plans' },
        { text: 'PLC details', action: 'Show PLC details' },
        { text: 'Master help', action: 'Help with master data' }
      ],
      utilities: [
        { text: 'Employee list', action: 'List all employees' },
        { text: 'Upcoming birthdays', action: 'Show upcoming birthdays' },
        { text: 'Log reports', action: 'Show log reports' },
        { text: 'Utilities help', action: 'Help with utilities' }
      ],
      dispatches: [
        { text: 'List dispatches', action: 'List all dispatches' },
        { text: 'Recent dispatches', action: 'Show recent dispatches' },
        { text: 'BBA records', action: 'Show BBA records' },
        { text: 'Dispatch help', action: 'Help with dispatch queries' }
      ],
      feedback: [
        { text: 'Recent feedback', action: 'Show recent feedback' },
        { text: 'Pending calls', action: 'Show pending calls' },
        { text: 'Feedback stats', action: 'Show feedback statistics' },
        { text: 'Feedback help', action: 'Help with feedback queries' }
      ]
    };
    
    return actions[context] || actions.general;
  }

  /**
   * Format bot message content (parse markdown-like syntax)
   * @param {string} content - Raw message content
   * @returns {string} Formatted content
   */
  formatMessage(content) {
    // This is a simple formatter - can be enhanced
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers for mobile
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markers
      .trim();
  }
}

export default new ChatService();
