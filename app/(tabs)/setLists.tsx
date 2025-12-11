import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from '../../lib/supabase';

const API_URL = 'https://project-3-app-28bcd4518326.herokuapp.com';

interface Concert {
    id: string;
    artist: string;
    venue?: string;
    city?: string;
    dateTime: string;
}

interface Setlist {
    id: string;
    concertId: string;
    songs: string[];
    favoriteSongs: string[];
}

export default function SetLists() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConcerts, setIsLoadingConcerts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // User state
    const [userId, setUserId] = useState<string | null>(null);

    // Concert state
    const [concerts, setConcerts] = useState<Concert[]>([]);

    // Setlist form state
    const [songs, setSongs] = useState<string[]>([]);
    const [favoriteSongs, setFavoriteSongs] = useState<string[]>([]);
    const [songInput, setSongInput] = useState("");
    const [favoriteInput, setFavoriteInput] = useState("");

    // Modal state
    const [showSetlistModal, setShowSetlistModal] = useState(false);
    const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);
    const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);

    // Fetch backend user ID based on Supabase auth email
    useEffect(() => {
        const getBackendUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                try {
                    const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(user.email)}`);
                    if (response.ok) {
                        const backendUser = await response.json();
                        setUserId(backendUser.id);
                        console.log('Backend user ID for setlists:', backendUser.id);
                    } else {
                        setError('User not found');
                        setIsLoadingConcerts(false);
                    }
                } catch (err) {
                    console.error('Error fetching backend user:', err);
                    setError('Failed to fetch user');
                    setIsLoadingConcerts(false);
                }
            }
        };
        getBackendUserId();
    }, []);

    // Fetch concerts when userId is available
    useEffect(() => {
        if (userId) {
            fetchConcerts();
        }
    }, [userId]);

    const fetchConcerts = async () => {
        if (!userId) return;

        setIsLoadingConcerts(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/concerts/user/${userId}`, {
                method: "GET",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error("Failed to fetch concerts");

            const data = await response.json();
            setConcerts(data);
        } catch (err: any) {
            console.error('Error fetching concerts:', err);
            setError(err.message || 'Failed to load concerts');
        } finally {
            setIsLoadingConcerts(false);
            setRefreshing(false);
        }
    };

    const fetchSetlistByConcertId = async (concertId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/setlists/concert/${concertId}`, {
                method: "GET",
                headers: { Accept: "application/json" }
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentSetlist(data);
                setSongs(data.songs || []);
                setFavoriteSongs(data.favoriteSongs || []);
            } else {
                // No setlist exists yet
                setCurrentSetlist(null);
                setSongs([]);
                setFavoriteSongs([]);
            }
        } catch (err: any) {
            console.error('Error fetching setlist:', err);
            setCurrentSetlist(null);
            setSongs([]);
            setFavoriteSongs([]);
        }
    };

    const handleConcertClick = async (concert: Concert) => {
        setSelectedConcert(concert);
        await fetchSetlistByConcertId(concert.id);
        setShowSetlistModal(true);
    };

    const handleAddSong = () => {
        if (songInput.trim()) {
            setSongs([...songs, songInput.trim()]);
            setSongInput("");
        }
    };

    const handleRemoveSong = (index: number) => {
        setSongs(songs.filter((_, i) => i !== index));
    };

    const handleAddFavorite = () => {
        if (favoriteInput.trim()) {
            setFavoriteSongs([...favoriteSongs, favoriteInput.trim()]);
            setFavoriteInput("");
        }
    };

    const handleRemoveFavorite = (index: number) => {
        setFavoriteSongs(favoriteSongs.filter((_, i) => i !== index));
    };

    const handleCreateSetlist = async () => {
        if (!selectedConcert) {
            setError("Concert is required");
            return;
        }
        if (songs.length === 0) {
            Alert.alert("Error", "Add at least one song to the setlist");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/setlists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    concertId: selectedConcert.id,
                    songs,
                    favoriteSongs
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Failed to create setlist");
            }

            const data = await response.json();
            setCurrentSetlist(data);
            Alert.alert("Success", "Setlist created successfully!");
            setShowSetlistModal(false);
        } catch (err: any) {
            console.error('Error creating setlist:', err);
            Alert.alert("Error", err.message || "Failed to create setlist");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSetlist = async () => {
        if (!currentSetlist?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/setlists/${currentSetlist.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    songs,
                    favoriteSongs
                }),
            });

            if (!response.ok) throw new Error("Failed to update setlist");

            Alert.alert("Success", "Setlist updated successfully!");
            setShowSetlistModal(false);
        } catch (err: any) {
            console.error('Error updating setlist:', err);
            Alert.alert("Error", err.message || "Failed to update setlist");
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setShowSetlistModal(false);
        setSelectedConcert(null);
        setCurrentSetlist(null);
        setSongs([]);
        setFavoriteSongs([]);
        setSongInput("");
        setFavoriteInput("");
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConcerts();
    }, [userId]);

    const formatDate = (dateTime: string) => {
        try {
            const date = new Date(dateTime);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateTime;
        }
    };

    if (isLoadingConcerts && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0EA3FF" />
                <Text style={styles.loadingText}>Loading concerts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Set Lists 🎵</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={24} color="#0EA3FF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>Track songs from each concert</Text>
            </View>

            {error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchConcerts}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : concerts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color="#64748b" />
                    <Text style={styles.emptyText}>No concerts yet</Text>
                    <Text style={styles.emptySubtext}>Log a concert first to add setlists!</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#0EA3FF"
                            colors={['#0EA3FF']}
                        />
                    }
                >
                    <Text style={styles.sectionTitle}>Select a Concert</Text>
                    {concerts.map((concert) => (
                        <TouchableOpacity
                            key={concert.id}
                            style={styles.concertCard}
                            onPress={() => handleConcertClick(concert)}
                        >
                            <View style={styles.concertInfo}>
                                <Text style={styles.artistName}>{concert.artist}</Text>
                                {concert.venue && (
                                    <Text style={styles.venueText}>{concert.venue}</Text>
                                )}
                                <Text style={styles.dateText}>{formatDate(concert.dateTime)}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#64748b" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Setlist Modal */}
            <Modal
                visible={showSetlistModal}
                onRequestClose={closeModal}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>
                                    {currentSetlist ? "Edit Setlist" : "Create Setlist"}
                                </Text>
                                {selectedConcert && (
                                    <Text style={styles.modalSubtitle}>{selectedConcert.artist}</Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#cbd5e1" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {/* Add Song Input */}
                            <Text style={styles.inputLabel}>Songs</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Enter song name"
                                    placeholderTextColor="#94a3b8"
                                    value={songInput}
                                    onChangeText={setSongInput}
                                    style={styles.input}
                                    onSubmitEditing={handleAddSong}
                                />
                                <TouchableOpacity style={styles.addButton} onPress={handleAddSong}>
                                    <Ionicons name="add" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Songs List */}
                            {songs.length > 0 && (
                                <View style={styles.tagContainer}>
                                    {songs.map((song, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>{song}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveSong(index)}>
                                                <Ionicons name="close-circle" size={18} color="#94a3b8" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Add Favorite Input */}
                            <Text style={styles.inputLabel}>Favorite Songs ⭐</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Enter favorite song"
                                    placeholderTextColor="#94a3b8"
                                    value={favoriteInput}
                                    onChangeText={setFavoriteInput}
                                    style={styles.input}
                                    onSubmitEditing={handleAddFavorite}
                                />
                                <TouchableOpacity style={[styles.addButton, styles.favoriteButton]} onPress={handleAddFavorite}>
                                    <Ionicons name="star" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Favorites List */}
                            {favoriteSongs.length > 0 && (
                                <View style={styles.tagContainer}>
                                    {favoriteSongs.map((song, index) => (
                                        <View key={index} style={[styles.tag, styles.favoriteTag]}>
                                            <Ionicons name="star" size={14} color="#fbbf24" />
                                            <Text style={styles.tagText}>{song}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveFavorite(index)}>
                                                <Ionicons name="close-circle" size={18} color="#94a3b8" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                                onPress={currentSetlist ? handleUpdateSetlist : handleCreateSetlist}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {currentSetlist ? "Update Setlist" : "Create Setlist"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
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
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00123C',
        padding: 20,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0EA3FF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
        textAlign: 'center',
    },
    refreshButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#FF44AE',
        fontWeight: '600',
        marginBottom: 10,
    },
    concertCard: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    concertInfo: {
        flex: 1,
    },
    artistName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    venueText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
        fontSize: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#0EA3FF',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#0A1E44',
        borderRadius: 16,
        width: '100%',
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    modalTitle: {
        fontSize: 22,
        color: '#0EA3FF',
        fontWeight: 'bold',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#cbd5e1',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#0f172a',
        color: '#e0f2fe',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    addButton: {
        backgroundColor: '#0EA3FF',
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        backgroundColor: '#f59e0b',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: '#1e293b',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    favoriteTag: {
        backgroundColor: '#422006',
        borderWidth: 1,
        borderColor: '#f59e0b',
    },
    tagText: {
        color: '#e0f2fe',
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#27C024',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});