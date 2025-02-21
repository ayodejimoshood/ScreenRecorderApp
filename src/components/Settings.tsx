import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RecordingSettings } from '../utils/screenRecorder';

interface SettingsProps {
  onSave: (settings: RecordingSettings) => void;
  initialSettings: RecordingSettings;
}

const Settings: React.FC<SettingsProps> = ({ onSave, initialSettings }) => {
  const [maxDuration, setMaxDuration] = useState(
    initialSettings.maxDuration.toString()
  );
  const [autoDelete, setAutoDelete] = useState(
    initialSettings.autoDelete
  );
  const [retentionDays, setRetentionDays] = useState(
    initialSettings.retentionDays.toString()
  );
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>(
    initialSettings.quality
  );
  const [includeMicrophone, setIncludeMicrophone] = useState(
    initialSettings.includeMicrophone
  );

  const insets = useSafeAreaInsets();

  const handleSave = () => {
    onSave({
      maxDuration: parseInt(maxDuration, 10),
      autoDelete,
      retentionDays: parseInt(retentionDays, 10),
      quality,
      includeMicrophone,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recording Options</Text>
        <View style={styles.setting}>
          <Text style={styles.label}>Maximum Duration (seconds)</Text>
          <TextInput
            style={styles.input}
            value={maxDuration}
            onChangeText={setMaxDuration}
            keyboardType="numeric"
            placeholder="60"
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Recording Quality</Text>
          <View style={styles.qualityButtons}>
            {(['high', 'medium', 'low'] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  styles.qualityButton,
                  quality === q && styles.qualityButtonActive,
                ]}
                onPress={() => setQuality(q)}
              >
                <Text
                  style={[
                    styles.qualityButtonText,
                    quality === q && styles.qualityButtonTextActive,
                  ]}
                >
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Include Microphone Audio</Text>
          <Switch
            value={includeMicrophone}
            onValueChange={setIncludeMicrophone}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Options</Text>
        <View style={styles.setting}>
          <Text style={styles.label}>Auto Delete Old Recordings</Text>
          <Switch value={autoDelete} onValueChange={setAutoDelete} />
        </View>

        {autoDelete && (
          <View style={styles.setting}>
            <Text style={styles.label}>Retention Period (days)</Text>
            <TextInput
              style={styles.input}
              value={retentionDays}
              onChangeText={setRetentionDays}
              keyboardType="numeric"
              placeholder="7"
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  setting: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  qualityButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  qualityButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings; 