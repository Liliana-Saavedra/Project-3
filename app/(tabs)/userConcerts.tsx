import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from '../../lib/supabase';

const API_URL = 'https://project-3-app-28bcd4518326.herokuapp.com';

interface Photo {
    id: string;
    url: string;
    caption?: string;
}

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
    photos?: Photo[];
}

export default function UserConcerts() {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

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
                        console.log('Backend user ID for concerts:', backendUser.id);
                    } else {
                        setError('User not found');
                    }
                } catch (err) {
                    console.error('Error fetching backend user:', err);
                    setError('Failed to fetch user');
                }
            }
        };
        getBackendUserId();
    }, []);

    // Fetch concerts when userId is available
    useEffect(() => {
        if (userId) {
            fetchUserConcerts();
        }
    }, [userId]);

    const fetchUserConcerts = async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Fetch concerts for this user
            const response = await fetch(`${API_URL}/api/concerts/user/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch concerts');
            }

            const concertsData: Concert[] = await response.json();

            // Fetch photos for each concert
            const concertsWithPhotos = await Promise.all(
                concertsData.map(async (concert) => {
                    try {
                        const photosResponse = await fetch(`${API_URL}/api/photos/concert/${concert.id}`);
                        if (photosResponse.ok) {
                            const photos = await photosResponse.json();
                            return { ...concert, photos };
                        }
                    } catch (err) {
                        console.error(`Error fetching photos for concert ${concert.id}:`, err);
                    }
                    return { ...concert, photos: [] };
                })
            );

            setConcerts(concertsWithPhotos);
        } catch (err: any) {
            console.error('Error fetching concerts:', err);
            setError(err.message || 'Failed to load concerts');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserConcerts();
    }, [userId]);

    const formatDate = (dateTime: string) => {
        try {
            const date = new Date(dateTime);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateTime;
        }
    };

    const renderConcertItem = ({ item }: { item: Concert }) => (
        <View style={styles.concertCard}>
            {/* Concert Image */}
            {item.photos && item.photos.length > 0 ? (
                <Image
                    source={{ uri: item.photos[0].url }}
                    style={styles.concertImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.placeholderImage}>
                    <Ionicons name="musical-notes" size={40} color="#64748b" />
                </View>
            )}

            {/* Concert Details */}
            <View style={styles.concertDetails}>
                <Text style={styles.artistName}>{item.artist}</Text>
                {item.tourName && (
                    <Text style={styles.tourName}>{item.tourName}</Text>
                )}
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#94a3b8" />
                    <Text style={styles.infoText}>
                        {item.venue}{item.city ? `, ${item.city}` : ''}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                    <Text style={styles.infoText}>{formatDate(item.dateTime)}</Text>
                </View>
                {item.genre && (
                    <View style={styles.genreTag}>
                        <Text style={styles.genreText}>{item.genre}</Text>
                    </View>
                )}
            </View>

            {/* Photo count badge */}
            {item.photos && item.photos.length > 1 && (
                <View style={styles.photoBadge}>
                    <Ionicons name="images" size={12} color="#fff" />
                    <Text style={styles.photoBadgeText}>{item.photos.length}</Text>
                </View>
            )}
        </View>
    );

    if (isLoading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0EA3FF" />
                <Text style={styles.loadingText}>Loading your concerts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Concerts 🎸</Text>
                <Text style={styles.headerSubtitle}>
                    {concerts.length} concert{concerts.length !== 1 ? 's' : ''} logged
                </Text>
            </View>

            {error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchUserConcerts}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : concerts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color="#64748b" />
                    <Text style={styles.emptyText}>No concerts yet</Text>
                    <Text style={styles.emptySubtext}>
                        Start logging your concert experiences!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={concerts}
                    renderItem={renderConcertItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#0EA3FF"
                            colors={['#0EA3FF']}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    concertCard: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    concertImage: {
        width: '100%',
        height: 180,
    },
    placeholderImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    concertDetails: {
        padding: 16,
    },
    artistName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    tourName: {
        fontSize: 14,
        color: '#A11EFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#94a3b8',
        marginLeft: 6,
    },
    genreTag: {
        backgroundColor: '#27C024',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    genreText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    photoBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    photoBadgeText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
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
});
