import RecordScreen from 'react-native-record-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export interface RecordingSettings {
    maxDuration: number;
    autoDelete: boolean;
    retentionDays: number;
    quality: 'high' | 'medium' | 'low';
    includeMicrophone: boolean;
}

interface RecordingStatus {
  isRecording: boolean;
  duration: number;
  fileSize?: number;
}

class ScreenRecorder {
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;
  private recordingTimer: NodeJS.Timeout | null = null;
  private statusUpdateCallback: ((status: RecordingStatus) => void) | null = null;
  private statusUpdateInterval: NodeJS.Timeout | null = null;

  setStatusCallback(callback: (status: RecordingStatus) => void) {
    this.statusUpdateCallback = callback;
  }

  private startStatusUpdates() {
    if (this.statusUpdateCallback) {
      this.statusUpdateInterval = setInterval(() => {
        const duration = (Date.now() - this.recordingStartTime) / 1000;
        this.statusUpdateCallback!({
          isRecording: this.isRecording,
          duration,
          fileSize: 0,
        });
      }, 1000);
    }
  }

  private stopStatusUpdates() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  async startRecording(settings: RecordingSettings): Promise<boolean> {
    try {
      if (this.isRecording) {
        return false;
      }

      // Clean up any existing recordings
      await RecordScreen.clean();

      if (Platform.OS === 'ios') {
        return new Promise((resolve) => {
          Alert.alert(
            'Screen Recording',
            'Please start screen recording from Control Center when prompted',
            [
              {
                text: 'Start Recording',
                onPress: async () => {
                  try {
                    // Start screen recording with error handling
                    await RecordScreen.startRecording({
                      mic: settings.includeMicrophone,
                      quality: settings.quality === 'high' ? 2 : settings.quality === 'medium' ? 1 : 0,
                      width: 1280,
                      height: 720,
                      bitrate: settings.quality === 'high' ? 12000000 : settings.quality === 'medium' ? 8000000 : 4000000
                    });

                    this.isRecording = true;
                    this.recordingStartTime = Date.now();
                    this.startStatusUpdates();

                    if (settings.maxDuration > 0) {
                      this.recordingTimer = setTimeout(() => {
                        if (this.isRecording) {
                          this.stopRecording();
                        }
                      }, settings.maxDuration * 1000);
                    }

                    resolve(true);
                  } catch (error) {
                    console.error('Error in startRecording:', error);
                    Alert.alert('Error', 'Failed to start screen recording. Please make sure you have granted the necessary permissions.');
                    resolve(false);
                  }
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false),
              },
            ],
          );
        });
      } else {
        // Android implementation
        await RecordScreen.startRecording({
          mic: settings.includeMicrophone,
          quality: settings.quality === 'high' ? 2 : settings.quality === 'medium' ? 1 : 0,
          width: 1280,
          height: 720,
          bitrate: settings.quality === 'high' ? 12000000 : settings.quality === 'medium' ? 8000000 : 4000000
        });

        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.startStatusUpdates();

        if (settings.maxDuration > 0) {
          this.recordingTimer = setTimeout(() => {
            if (this.isRecording) {
              this.stopRecording();
            }
          }, settings.maxDuration * 1000);
        }

        return true;
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start screen recording. Please make sure you have granted the necessary permissions.');
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.isRecording) {
        return null;
      }

      this.stopStatusUpdates();

      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }

      // Stop screen recording and get the video file path
      const result = await RecordScreen.stopRecording().catch((error) => {
        console.error('Error in stopRecording:', error);
        Alert.alert('Error', 'Failed to stop screen recording.');
        throw error;
      });
      
      this.isRecording = false;

      if (result?.result?.outputURL) {
        return result.result.outputURL;
      }
      return null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  async saveSettings(settings: RecordingSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('recordingSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async getSettings(): Promise<RecordingSettings | null> {
    try {
      const settings = await AsyncStorage.getItem('recordingSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }
}

export const screenRecorder = new ScreenRecorder(); 