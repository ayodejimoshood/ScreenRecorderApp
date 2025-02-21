import RNScreenRecorder from 'react-native-screen-recorder';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      // Start screen recording
      await RNScreenRecorder.startRecording({
        mic: settings.includeMicrophone,
        quality: settings.quality === 'high' ? 2 : settings.quality === 'medium' ? 1 : 0,
        maxDuration: settings.maxDuration
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
    } catch (error) {
      console.error('Error starting recording:', error);
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
      const videoPath = await RNScreenRecorder.stopRecording();
      this.isRecording = false;

      return videoPath;
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