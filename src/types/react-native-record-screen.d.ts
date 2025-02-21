declare module 'react-native-record-screen' {
  interface RecordingOptions {
    mic?: boolean;
    quality?: number;
    width?: number;
    height?: number;
    bitrate?: number;
  }

  interface RecordingResult {
    status: string;
    result: {
      outputURL: string;
      duration: number;
      size: number;
    };
  }

  const RecordScreen: {
    startRecording(options: RecordingOptions): Promise<void>;
    stopRecording(): Promise<RecordingResult>;
    clean(): Promise<void>;
  };

  export default RecordScreen;
} 