import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Alert } from 'react-native';
import FloatingButtons from './src/components/FloatingButtons';
import Settings from './src/components/Settings';
import { screenRecorder } from './src/utils/screenRecorder';
import type { RecordingSettings } from './src/utils/screenRecorder';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState<RecordingSettings>({
    maxDuration: 60,
    autoDelete: false,
    retentionDays: 7,
    quality: 'high',
    includeMicrophone: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await screenRecorder.getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  };

  const handleRecord = async () => {
    try {
      const success = await screenRecorder.startRecording(settings);
      if (success) {
        setIsRecording(true);
      } else {
        Alert.alert('Error', 'Failed to start recording');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleStop = async () => {
    const recordingPath = await screenRecorder.stopRecording();
    setIsRecording(false);
    if (recordingPath) {
      Alert.alert('Success', 'Recording saved successfully');
    } else {
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const handleSettings = () => {
    if (isRecording) {
      Alert.alert(
        'Recording in Progress',
        'Do you want to stop recording and go to settings?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop and Go',
            style: 'destructive',
            onPress: async () => {
              await handleStop();
              navigation.navigate('Settings');
            },
          },
        ]
      );
    } else {
      navigation.navigate('Settings');
    }
  };

  return (
    <View style={styles.container}>
      <FloatingButtons
        isRecording={isRecording}
        onRecord={handleRecord}
        onStop={handleStop}
        onSettings={handleSettings}
      />
    </View>
  );
}

function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState<RecordingSettings>({
    maxDuration: 60,
    autoDelete: false,
    retentionDays: 7,
    quality: 'high',
    includeMicrophone: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await screenRecorder.getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  };

  const handleSave = async (newSettings) => {
    await screenRecorder.saveSettings(newSettings);
    navigation.goBack();
  };

  return <Settings initialSettings={settings} onSave={handleSave} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Recording Settings',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 