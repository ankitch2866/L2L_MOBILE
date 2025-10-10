// Voice Service - Text-to-Speech and Speech-to-Text
import * as Speech from 'expo-speech';

// Try to import Voice, but handle if not available (Expo Go)
let Voice = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  console.warn('Voice recognition not available in Expo Go. Use development build for voice features.');
}

class VoiceService {
  constructor() {
    this.isSpeakingNow = false;
    this.isRecognizing = false;
    this.onSpeechResults = null;
    this.onSpeechPartialResults = null;
    this.onSpeechError = null;
    this.isVoiceAvailable = Voice !== null;
    
    // Initialize Voice recognition
    this.initializeVoice();
  }

  /**
   * Check if voice recognition is available
   * @returns {boolean}
   */
  isVoiceRecognitionAvailable() {
    return this.isVoiceAvailable;
  }

  /**
   * Initialize Voice recognition with event listeners
   */
  initializeVoice() {
    if (!Voice) {
      console.warn('Voice module not available');
      return;
    }
    
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResultsHandler.bind(this);
    Voice.onSpeechError = this.onSpeechErrorHandler.bind(this);
  }

  onSpeechStart(e) {
    console.log('Speech recognition started');
    this.isRecognizing = true;
  }

  onSpeechEnd(e) {
    console.log('Speech recognition ended');
    this.isRecognizing = false;
  }

  onSpeechResultsHandler(e) {
    if (this.onSpeechResults && e.value && e.value.length > 0) {
      this.onSpeechResults(e.value[0]);
    }
  }

  onSpeechPartialResultsHandler(e) {
    if (this.onSpeechPartialResults && e.value && e.value.length > 0) {
      this.onSpeechPartialResults(e.value[0]);
    }
  }

  onSpeechErrorHandler(e) {
    console.error('Speech recognition error:', e.error);
    this.isRecognizing = false;
    if (this.onSpeechError) {
      this.onSpeechError(e.error);
    }
  }

  /**
   * Speak text using text-to-speech
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise}
   */
  async speak(text, options = {}) {
    try {
      // Stop any current speech
      await this.stop();
      
      this.isSpeakingNow = true;
      
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          this.isSpeakingNow = false;
        },
        onStopped: () => {
          this.isSpeakingNow = false;
        },
        onError: () => {
          this.isSpeakingNow = false;
        },
        ...options
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeakingNow = false;
      throw new Error('Failed to speak text');
    }
  }

  /**
   * Stop current speech
   * @returns {Promise}
   */
  async stop() {
    try {
      await Speech.stop();
      this.isSpeakingNow = false;
    } catch (error) {
      console.error('Stop speech error:', error);
    }
  }

  /**
   * Check if currently speaking
   * @returns {Promise<boolean>}
   */
  async isSpeaking() {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      return this.isSpeakingNow;
    }
  }

  /**
   * Start real-time speech recognition
   * @param {Function} onPartialResults - Callback for partial results (real-time text)
   * @param {Function} onFinalResults - Callback for final results
   * @param {Function} onError - Callback for errors
   * @returns {Promise<void>}
   */
  async startSpeechRecognition(onPartialResults, onFinalResults, onError) {
    try {
      // Check if Voice module is available
      if (!Voice) {
        throw new Error('Voice recognition requires a development build. Not available in Expo Go.');
      }

      // Set callbacks
      this.onSpeechPartialResults = onPartialResults;
      this.onSpeechResults = onFinalResults;
      this.onSpeechError = onError;

      // Check if speech recognition is available
      const available = await Voice.isAvailable();
      if (!available) {
        throw new Error('Speech recognition not available on this device');
      }

      // Start recognition
      await Voice.start('en-US');
      this.isRecognizing = true;
    } catch (error) {
      console.error('Start speech recognition error:', error);
      this.isRecognizing = false;
      throw new Error(error.message || 'Failed to start speech recognition');
    }
  }

  /**
   * Stop speech recognition
   * @returns {Promise<void>}
   */
  async stopSpeechRecognition() {
    try {
      if (Voice) {
        await Voice.stop();
      }
      this.isRecognizing = false;
    } catch (error) {
      console.error('Stop speech recognition error:', error);
      this.isRecognizing = false;
    }
  }

  /**
   * Cancel speech recognition
   * @returns {Promise<void>}
   */
  async cancelSpeechRecognition() {
    try {
      if (Voice) {
        await Voice.cancel();
      }
      this.isRecognizing = false;
    } catch (error) {
      console.error('Cancel speech recognition error:', error);
      this.isRecognizing = false;
    }
  }

  /**
   * Destroy voice recognition (cleanup)
   * @returns {Promise<void>}
   */
  async destroyVoice() {
    try {
      if (Voice) {
        await Voice.destroy();
      }
      this.isRecognizing = false;
      this.onSpeechResults = null;
      this.onSpeechPartialResults = null;
      this.onSpeechError = null;
    } catch (error) {
      console.error('Destroy voice error:', error);
    }
  }

  /**
   * Get available voices
   * @returns {Promise<Array>} Available voices
   */
  async getAvailableVoices() {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.error('Get voices error:', error);
      return [];
    }
  }
}

export default new VoiceService();
