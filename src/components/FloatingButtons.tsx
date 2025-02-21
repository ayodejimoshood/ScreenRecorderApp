import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingButtonsProps {
  onRecord: () => void;
  onStop: () => void;
  onSettings: () => void;
  isRecording: boolean;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  onRecord,
  onStop,
  onSettings,
  isRecording,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
      {!isRecording ? (
        <TouchableOpacity
          style={[styles.button, styles.recordButton]}
          onPress={onRecord}
        >
          <View style={styles.recordIcon} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={onStop}
        >
          <View style={styles.stopIcon} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, styles.settingsButton]}
        onPress={onSettings}
      >
        <View style={styles.settingsIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 10,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  recordButton: {
    backgroundColor: '#333',
  },
  stopButton: {
    backgroundColor: '#ff3b30',
  },
  settingsButton: {
    backgroundColor: '#333',
  },
  recordIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff3b30',
  },
  stopIcon: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default FloatingButtons; 