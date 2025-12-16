import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { supabase } from '../../lib/supabase';

const screenWidth = Dimensions.get("window").width;
const API_URL = 'https://project-3-app-28bcd4518326.herokuapp.com';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch backend user ID based on Supabase auth email
    useEffect(() => {
        const getBackendUserId = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.email) {
                    console.log('Fetching backend user for email:', user.email);
                    const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(user.email)}`);
                    if (response.ok) {
                        const backendUser = await response.json();
                        setUserId(backendUser.id);
                        console.log('Backend user ID:', backendUser.id);
                    } else {
                        setError('User not found in backend');
                        setIsLoading(false);
                    }
                } else {
                    setError('Please log in to view your dashboard');
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

    // Fetch dashboard data when userId is available
    useEffect(() => {
        if (!userId) return;

        const fetchDashboard = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${API_URL}/api/dashboard/${userId}`,
                    { headers: { Accept: "application/json" } }
                );
                if (!response.ok) throw new Error("Failed to fetch dashboard");
                const data = await response.json();
                setDashboardData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, [userId]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.header}>Dashboard 📊</Text>
                <ActivityIndicator size="large" color="#0EA3FF" style={{ marginTop: 20 }} />
                <Text style={styles.subtext}>Loading your stats...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.header}>Dashboard 📊</Text>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    if (!dashboardData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.header}>Dashboard 📊</Text>
                <Text style={styles.subtext}>No data available</Text>
            </View>
        );
    }

    // Transform backend maps into chart-kit data (with fallbacks to prevent crashes)
    const artistLabels = Object.keys(dashboardData.topArtists || {});
    const artistCounts = Object.values(dashboardData.topArtists || {}) as number[];
    const hasArtistData = artistLabels.length > 0 && artistCounts.length > 0;

    const locationLabels = Object.keys(dashboardData.locations || {});
    const locationCounts = Object.values(dashboardData.locations || {}) as number[];
    const hasLocationData = locationLabels.length > 0 && locationCounts.length > 0;

    const genreData = Object.entries(dashboardData.genres || {}).map(([name, count], idx) => ({
        name,
        population: count as number,
        color: ["#0EA3FF", "#FF44AE", "#27C024", "#A11EFF", "#FFB800"][idx % 5],
        legendFontColor: "#cbd5e1",
        legendFontSize: 12,
    }));
    const hasGenreData = genreData.length > 0;

    const timelineLabels = Object.keys(dashboardData.timeline || {});
    const timelineCounts = Object.values(dashboardData.timeline || {}) as number[];
    const hasTimelineData = timelineLabels.length > 0 && timelineCounts.length > 0;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Dashboard 📊</Text>
                <Text style={styles.subtext}>Overview of your concert activities and stats</Text>
            </View>

            {/* Most-Seen Artist */}
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Most-Seen Artists</Text>
                {hasArtistData ? (
                    <BarChart
                        data={{ labels: artistLabels, datasets: [{ data: artistCounts }] }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        fromZero
                        yAxisLabel=""
                        yAxisSuffix=""
                    />
                ) : (
                    <Text style={styles.noData}>No artist data yet. Log some concerts!</Text>
                )}
            </View>

            {/* Top Venues or Cities */}
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Top Venues or Cities</Text>
                {hasLocationData ? (
                    <BarChart
                        data={{ labels: locationLabels, datasets: [{ data: locationCounts }] }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        fromZero
                        yAxisLabel=""
                        yAxisSuffix=""
                    />
                ) : (
                    <Text style={styles.noData}>No location data yet. Log some concerts!</Text>
                )}
            </View>

            {/* Genre Breakdown */}
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Genre Breakdown</Text>
                {hasGenreData ? (
                    <PieChart
                        data={genreData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        style={styles.chart}
                    />
                ) : (
                    <Text style={styles.noData}>No genre data yet. Log some concerts!</Text>
                )}
            </View>

            {/* Concerts Over Time */}
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Concerts Over Time</Text>
                {hasTimelineData ? (
                    <LineChart
                        data={{ labels: timelineLabels, datasets: [{ data: timelineCounts }] }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                ) : (
                    <Text style={styles.noData}>No timeline data yet. Log some concerts!</Text>
                )}
            </View>
        </ScrollView>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#00123C",
    backgroundGradientTo: "#00123C",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(14, 163, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(203, 213, 225, ${opacity})`,
};

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
        width: '50%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    error: {
        color: '#fca5a5',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    noData: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
});
