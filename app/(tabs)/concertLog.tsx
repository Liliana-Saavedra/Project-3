import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, FlatList, RefreshControl, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

// Backend API URL (use 10.0.2.2 for Android emulator to reach localhost)
const API_URL = 'https://project-3-app-28bcd4518326.herokuapp.com';


interface Concert {
    id: string;
    artist: string;
    tourName?: string;
    venue?: string;
    city?: string;
    country?: string;
    genre?: string;
    dateTime: string;
    notes?: string;
    ticketUrl?: string;
}

export default function Concerts() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConcerts, setIsLoadingConcerts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Image upload state (for standalone uploads outside modal)
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Modal image upload state
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [isModalUploading, setIsModalUploading] = useState(false);

    // Form state
    const [artist, setArtist] = useState("");
    const [tourName, setTourName] = useState("");
    const [venue, setVenue] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [genre, setGenre] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [notes, setNotes] = useState("");
    // Date picker state
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    // Get backend userId (not Supabase ID, but the ID from your backend's users table)
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch backend user ID based on Supabase auth email
    useEffect(() => {
        const getBackendUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                console.log('Fetching backend user for email:', user.email);
                try {
                    // Fetch the backend user by email to get their backend ID
                    const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(user.email)}`);
                    if (response.ok) {
                        const backendUser = await response.json();
                        setUserId(backendUser.id);
                        console.log('Backend user ID:', backendUser.id);
                    } else {
                        console.error('Backend user not found for email:', user.email);
                    }
                } catch (error) {
                    console.error('Error fetching backend user:', error);
                }
            } else {
                console.log('No authenticated user found');
            }
        };
        getBackendUserId();

        // Listen for auth state changes (only on sign-in/sign-out, not initial state)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event);

            // Only fetch backend user on actual sign-in events, not initial load
            if (event === 'SIGNED_IN' && session?.user?.email) {
                try {
                    const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(session.user.email)}`);
                    if (response.ok) {
                        const backendUser = await response.json();
                        setUserId(backendUser.id);
                    }
                } catch (error) {
                    console.error('Error fetching backend user on auth change:', error);
                }
            } else if (event === 'SIGNED_OUT') {
                setUserId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleDatePickerConfirm = () => {
        // Validate date format (YYYY-MM-DD)
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        // Validate time format (HH:mm)
        const timePattern = /^\d{2}:\d{2}$/;

        if (!selectedDate || !selectedTime) {
            setError("Please enter both date and time");
            return;
        }

        if (!datePattern.test(selectedDate)) {
            setError("Date must be in YYYY-MM-DD format (e.g., 2024-07-15)");
            return;
        }

        if (!timePattern.test(selectedTime)) {
            setError("Time must be in HH:mm format (e.g., 19:30)");
            return;
        }

        const formatted = `${selectedDate}T${selectedTime}`;
        setDateTime(formatted);
        setShowDateTimePicker(false);
        setError(null);
    };

    const handleCreateLog = async () => {
        // Validation
        if (!artist.trim()) {
            setError("Artist is required");
            return;
        }
        if (!dateTime.trim()) {
            setError("Date and time is required");
            return;
        }
        if (!userId) {
            setError("User ID is required. Please ensure you are logged in.");
            return;
        }

        // Format dateTime for Java LocalDateTime (ISO-8601 format)
        // Convert "YYYY-MM-DDTHH:mm" to "YYYY-MM-DDTHH:mm:00" if needed
        let formattedDateTime = dateTime.trim();
        if (formattedDateTime.length === 16) {
            // If format is "YYYY-MM-DDTHH:mm", add seconds
            formattedDateTime = formattedDateTime + ":00";
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/concerts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    artist: artist.trim(),
                    tourName: tourName.trim() || null,
                    venue: venue.trim() || null,
                    city: city.trim() || null,
                    country: country.trim() || null,
                    genre: genre.trim() || null,
                    dateTime: formattedDateTime,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to create concert log" }));
                throw new Error(errorData.message || "Failed to create concert log");
            }

            const concertData = await response.json();
            const concertId = concertData.id;

            // Step 2: Create photos for each uploaded image
            if (modalImages.length > 0 && concertId) {
                const photoPromises = modalImages.map(async (imageUrl) => {
                    const photoResponse = await fetch(`${API_URL}/api/photos`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId: userId,
                            concertId: concertId,
                            url: imageUrl,
                            caption: null,
                            takenAt: null,
                        }),
                    });

                    if (!photoResponse.ok) {
                        console.error("Failed to save photo:", imageUrl);
                    }
                    return photoResponse;
                });

                await Promise.all(photoPromises);
            }

            // Reset form
            resetForm();
            setShowCreateModal(false);

            const photoCount = modalImages.length;
            const message = photoCount > 0
                ? `Concert log created with ${photoCount} photo${photoCount > 1 ? 's' : ''}!`
                : "Concert log created successfully!";
            Alert.alert("Success", message);
        } catch (err: any) {
            setError(err.message || "An error occurred while creating the concert log");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setArtist("");
        setTourName("");
        setVenue("");
        setCity("");
        setCountry("");
        setGenre("");
        setDateTime("");
        setNotes("");
        setSelectedDate("");
        setSelectedTime("");
        setModalImages([]);
        setError(null);
    };

    const handleCloseModal = () => {
        resetForm();
        setShowCreateModal(false);
    };

    const pickAndUploadImage = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Please allow access to your photo library to upload images.");
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }

            const imageUri = result.assets[0].uri;
            setIsUploading(true);

            // Generate unique filename
            const fileName = `concert_${userId}_${Date.now()}.jpg`;
            const filePath = `${userId}/${fileName}`;

            // Fetch the image and convert to blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Convert blob to ArrayBuffer for Supabase
            const arrayBuffer = await new Response(blob).arrayBuffer();

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
                setUploadedImages(prev => [...prev, urlData.publicUrl]);
                Alert.alert("Success", "Image uploaded successfully!");
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            Alert.alert("Upload Failed", error.message || "Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Image upload function for the modal
    const pickAndUploadModalImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Please allow access to your photo library to upload images.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }

            const imageUri = result.assets[0].uri;
            setIsModalUploading(true);

            const fileName = `concert_${userId}_${Date.now()}.jpg`;
            const filePath = `${userId}/${fileName}`;

            const response = await fetch(imageUri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data: urlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
                setModalImages(prev => [...prev, urlData.publicUrl]);
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            Alert.alert("Upload Failed", error.message || "Failed to upload image. Please try again.");
        } finally {
            setIsModalUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Concert Log 📸</Text>
                <Text style={styles.subtext}>Track your concert experiences and memories.</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Text style={styles.buttonText}>Create Concert Log</Text>
                </TouchableOpacity>
            </View>

            {/* Create Concert Log Modal */}
            <Modal
                visible={showCreateModal}
                onRequestClose={handleCloseModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Concert Log</Text>
                            <TouchableOpacity
                                onPress={handleCloseModal}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#cbd5e1" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <TextInput
                                placeholder="Artist *"
                                placeholderTextColor="#94a3b8"
                                value={artist}
                                onChangeText={setArtist}
                                style={styles.input}
                                editable={!isLoading}
                            />

                            <TextInput
                                placeholder="Tour Name"
                                placeholderTextColor="#94a3b8"
                                value={tourName}
                                onChangeText={setTourName}
                                style={styles.input}
                                editable={!isLoading}
                            />

                            <TextInput
                                placeholder="Venue"
                                placeholderTextColor="#94a3b8"
                                value={venue}
                                onChangeText={setVenue}
                                style={styles.input}
                                editable={!isLoading}
                            />

                            <TextInput
                                placeholder="City"
                                placeholderTextColor="#94a3b8"
                                value={city}
                                onChangeText={setCity}
                                style={styles.input}
                                editable={!isLoading}
                            />

                            <TextInput
                                placeholder="Country"
                                placeholderTextColor="#94a3b8"
                                value={country}
                                onChangeText={setCountry}
                                style={styles.input}
                                editable={!isLoading}
                            />

                            <TextInput
                                placeholder="Genre"
                                placeholderTextColor="#94a3b8"
                                value={genre}
                                onChangeText={setGenre}
                                style={styles.input}
                                editable={!isLoading}
                            />

                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => {
                                    setShowDateTimePicker(true);
                                    // Clear date/time specific errors when opening picker
                                    if (error && (error.includes("Date") || error.includes("Time"))) {
                                        setError(null);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                <Text style={dateTime ? styles.dateTimeButtonText : styles.dateTimeButtonPlaceholder}>
                                    {dateTime || "Select Date & Time *"}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            <TextInput
                                placeholder="Notes"
                                placeholderTextColor="#94a3b8"
                                value={notes}
                                onChangeText={setNotes}
                                style={[styles.input, styles.textArea]}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={!isLoading}
                            />

                            {/* Photo Upload Section */}
                            <View style={styles.modalPhotoSection}>
                                <Text style={styles.modalPhotoLabel}>Photos</Text>
                                <TouchableOpacity
                                    style={[styles.addPhotoButton, (isModalUploading || isLoading) && styles.buttonDisabled]}
                                    onPress={pickAndUploadModalImage}
                                    disabled={isModalUploading || isLoading}
                                >
                                    {isModalUploading ? (
                                        <View style={styles.uploadingContainer}>
                                            <ActivityIndicator size="small" color="#fff" />
                                            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Uploading...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.uploadingContainer}>
                                            <Ionicons name="camera-outline" size={20} color="#fff" />
                                            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Add Photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Modal Images Preview */}
                                {modalImages.length > 0 && (
                                    <View style={styles.modalImagesContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {modalImages.map((imageUrl, index) => (
                                                <View key={index} style={styles.imageWrapper}>
                                                    <Image source={{ uri: imageUrl }} style={styles.modalUploadedImage} />
                                                    <TouchableOpacity
                                                        style={styles.removeImageButton}
                                                        onPress={() => {
                                                            setModalImages(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                        disabled={isLoading}
                                                    >
                                                        <Ionicons name="close-circle" size={22} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                        <Text style={styles.photoCountText}>{modalImages.length} photo{modalImages.length > 1 ? 's' : ''} added</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                                onPress={handleCreateLog}
                                disabled={isLoading}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isLoading ? "Creating..." : "Create Log"}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Date/Time Picker Modal */}
            <Modal
                visible={showDateTimePicker}
                onRequestClose={() => setShowDateTimePicker(false)}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date & Time</Text>
                            <TouchableOpacity
                                onPress={() => setShowDateTimePicker(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#cbd5e1" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.pickerContent}>
                            {error && (error.includes("Date") || error.includes("Time")) ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}
                            <Text style={styles.pickerLabel}>Date (YYYY-MM-DD)</Text>
                            <TextInput
                                placeholder="2024-07-15"
                                placeholderTextColor="#94a3b8"
                                value={selectedDate}
                                onChangeText={(text) => {
                                    // Remove all non-digits
                                    const digits = text.replace(/[^0-9]/g, '');
                                    // Auto-format: YYYY-MM-DD
                                    let formatted = '';
                                    if (digits.length > 0) {
                                        formatted = digits.substring(0, 4);
                                        if (digits.length > 4) {
                                            formatted += '-' + digits.substring(4, 6);
                                        }
                                        if (digits.length > 6) {
                                            formatted += '-' + digits.substring(6, 8);
                                        }
                                    }
                                    setSelectedDate(formatted);
                                }}
                                style={styles.input}
                                keyboardType="numeric"
                                maxLength={10}
                            />

                            <Text style={styles.pickerLabel}>Time (HH:mm)</Text>
                            <TextInput
                                placeholder="19:30"
                                placeholderTextColor="#94a3b8"
                                value={selectedTime}
                                onChangeText={(text) => {
                                    // Remove all non-digits
                                    const digits = text.replace(/[^0-9]/g, '');
                                    // Auto-format: HH:mm
                                    let formatted = '';
                                    if (digits.length > 0) {
                                        formatted = digits.substring(0, 2);
                                        if (digits.length > 2) {
                                            formatted += ':' + digits.substring(2, 4);
                                        }
                                    }
                                    setSelectedTime(formatted);
                                }}
                                style={styles.input}
                                keyboardType="numeric"
                                maxLength={5}
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, (!selectedDate || !selectedTime) && styles.submitButtonDisabled]}
                                onPress={handleDatePickerConfirm}
                                disabled={!selectedDate || !selectedTime}
                            >
                                <Text style={styles.submitButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00123C',
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionWithBorder: {
        borderTopWidth: 3,
        borderTopColor: '#0EA3FF',
        paddingTop: 20,
    },
    header: {
        fontSize: 28,
        color: '#0EA3FF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtext: {
        fontSize: 18,
        color: '#cbd5e1',
        marginTop: 4,
        fontWeight: "600",
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        color: '#A11EFF',
        fontWeight: '600',
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#0EA3FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    createButton: {
        backgroundColor: '#0EA3FF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#0A1E44',
        borderRadius: 12,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    modalTitle: {
        fontSize: 24,
        color: '#0EA3FF',
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    input: {
        backgroundColor: '#0f172a',
        color: '#e0f2fe',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    errorContainer: {
        backgroundColor: '#7f1d1d',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#fca5a5',
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#27C024',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#1a5a1a',
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dateTimeButton: {
        backgroundColor: '#0f172a',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateTimeButtonText: {
        color: '#e0f2fe',
        fontSize: 16,
    },
    dateTimeButtonPlaceholder: {
        color: '#94a3b8',
        fontSize: 16,
    },
    pickerCard: {
        backgroundColor: '#0A1E44',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    pickerContent: {
        padding: 20,
    },
    pickerLabel: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#1a5a1a',
        opacity: 0.7,
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagesContainer: {
        marginTop: 16,
    },
    imagesLabel: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    imagesScroll: {
        flexDirection: 'row',
    },
    imageWrapper: {
        marginRight: 12,
        position: 'relative',
    },
    uploadedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#1e293b',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#0A1E44',
        borderRadius: 12,
    },
    modalPhotoSection: {
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    modalPhotoLabel: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    addPhotoButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalImagesContainer: {
        marginTop: 12,
    },
    modalUploadedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#1e293b',
    },
    photoCountText: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 8,
    },
});

