import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';

const API_URL = 'https://project-3-app-28bcd4518326.herokuapp.com';

export default function Notifications() {
    const [concertAlerts, setConcertAlerts] = useState(true);
    const [artistUpdates, setArtistUpdates] = useState(true);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch backend user ID based on Supabase auth email
    useEffect(() => {
        const getBackendUserId = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.email) {
                    console.log('Fetching backend user for notifications:', user.email);
                    const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(user.email)}`);
                    if (response.ok) {
                        const backendUser = await response.json();
                        setUserId(backendUser.id);
                        console.log('Backend user ID for notifications:', backendUser.id);
                    } else {
                        setError('User not found in backend');
                        setIsLoading(false);
                    }
                } else {
                    setError('Please log in to view notifications');
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error fetching backend user:', err);
                setError('Failed to fetch user');
                setIsLoading(false);
            }
        };
        getBackendUserId();
    }, []);

    // Fetch notifications when userId is available
    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${API_URL}/api/notifications/user/${userId}`,
                    { headers: { Accept: "application/json" } }
                );
                if (!response.ok) throw new Error("Failed to fetch notifications");
                const data = await response.json();
                setNotifications(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, [userId]);

    const concertNotifications = notifications.filter((n) => n.type === "CONCERT_ALERT");
    const artistNotifications = notifications.filter((n) => n.type === "ARTIST_UPDATE");

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.header}>Notifications 🔔</Text>
                <ActivityIndicator size="large" color="#0EA3FF" style={{ marginTop: 20 }} />
                <Text style={styles.subtext}>Loading notifications...</Text>
            </View>
        );
    }

    if (error && !userId) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.header}>Notifications 🔔</Text>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.section}>
                    <Text style={styles.header}>Notifications 🔔</Text>
                    <Text style={styles.subtext}>
                        Stay updated with concert alerts and artist news
                    </Text>
                    {error && <Text style={styles.error}>{error}</Text>}
                </View>

                {/* Concert Alerts */}
                <View style={[styles.section, styles.sectionWithBorder]}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>New Concert Alerts</Text>
                        <Switch value={concertAlerts} onValueChange={setConcertAlerts} />
                    </View>
                    {concertAlerts ? (
                        <>
                            <View style={styles.notificationCard}>
                                {concertNotifications.length === 0 ? (
                                    <Text style={styles.notificationText}>No concert alerts.</Text>
                                ) : (
                                    concertNotifications.map((n) => (
                                        <View key={n.id} style={styles.notificationItem}>
                                            <Text style={styles.notificationText}>{n.message}</Text>
                                            <Text style={styles.notificationTime}>
                                                {new Date(n.sentAt).toLocaleString()}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>
                            <TouchableOpacity style={styles.linkbutton}>
                                <Text style={styles.buttonText}>View Upcoming Concerts</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.notificationCard}>
                            <Text style={styles.notificationText}>Concert alerts are currently turned off.</Text>
                        </View>
                    )}
                </View>

                {/* Artist Updates */}
                <View style={[styles.section, styles.sectionWithBorder]}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>Artist Updates</Text>
                        <Switch value={artistUpdates} onValueChange={setArtistUpdates} />
                    </View>
                    {artistUpdates ? (
                        <>
                            <View style={styles.notificationCard}>
                                {artistNotifications.length === 0 ? (
                                    <Text style={styles.notificationText}>No artist updates.</Text>
                                ) : (
                                    artistNotifications.map((n) => (
                                        <View key={n.id} style={styles.notificationItem}>
                                            <Text style={styles.notificationText}>{n.message}</Text>
                                            <Text style={styles.notificationTime}>
                                                {new Date(n.sentAt).toLocaleString()}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>
                            <TouchableOpacity style={styles.linkbutton}>
                                <Text style={styles.buttonText}>Check Artist News</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.notificationCard}>
                            <Text style={styles.notificationText}>Artist updates are currently turned off.</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00123C',
        padding: 20,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
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
        color: '#FF44AE',
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#27C024',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
        width: '80%',
        
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    linkbutton: {
        backgroundColor: '#0EA3FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationCard: {
        backgroundColor: '#0A1E44',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    notificationText: {
        color: '#cbd5e1',
        fontSize: 16,
        marginBottom: 6,
    },
    notificationTime: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 10,
    },
    notificationItem: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        paddingBottom: 12,
    },
    error: {
        color: '#fca5a5',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});
