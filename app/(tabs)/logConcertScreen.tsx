import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ConcertFormData {
  artist: string;
  venue: string;
  date: Date;
  notes: string;
  setlist: string;
  photo: string | null;
}

export default function LogConcertScreen() {
  const [formData, setFormData] = useState<ConcertFormData>({
    artist: '',
    venue: '',
    date: new Date(),
    notes: '',
    setlist: '',
    photo: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photo: result.assets[0].uri });
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photo: result.assets[0].uri });
    }
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  // Submit form to backend
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.artist.trim() || !formData.venue.trim()) {
      Alert.alert('Error', 'Please fill in Artist and Venue fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('artist', formData.artist);
      submitData.append('venue', formData.venue);
      submitData.append('date', formData.date.toISOString());
      submitData.append('notes', formData.notes);
      submitData.append('setlist', formData.setlist);

      // Add photo if exists
      if (formData.photo) {
        const filename = formData.photo.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        submitData.append('photo', {
          uri: formData.photo,
          name: filename,
          type,
        } as any);
      }

      // TODO: Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT_HERE/concerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: submitData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Concert logged successfully!');
        // Reset form
        setFormData({
          artist: '',
          venue: '',
          date: new Date(),
          notes: '',
          setlist: '',
          photo: null,
        });
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to submit concert.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Log a Concert</Text>

          {/* Artist Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Artist *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter artist name"
              value={formData.artist}
              onChangeText={(text) => setFormData({ ...formData, artist: text })}
            />
          </View>

          {/* Venue Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter venue name"
              value={formData.venue}
              onChangeText={(text) => setFormData({ ...formData, venue: text })}
            />
          </View>

          {/* Date Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Setlist Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Setlist</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter setlist (one song per line)"
              value={formData.setlist}
              onChangeText={(text) => setFormData({ ...formData, setlist: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Notes Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add your notes about the concert..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Photo Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo Upload</Text>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImage}
              >
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={takePhoto}
              >
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
            {formData.photo && (
              <View style={styles.photoPreview}>
                <Image
                  source={{ uri: formData.photo }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setFormData({ ...formData, photo: null })}
                >
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Log Concert'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    marginTop: 8,
    padding: 8,
  },
  removePhotoText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});