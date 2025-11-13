import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Dimensions } from "react-native";
import React, { useState } from "react";

export default function Notifications() {
    const [concertAlerts, setConcertAlerts] = useState(true);
    const [artistUpdates, setArtistUpdates] = useState(true);
    const [friendsActivity, setFriendsActivity] = useState(false);

    return (
        <ScrollView style={styles.container}>
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Notifications 🔔</Text>
                <Text style={styles.subtext}>Stay updated with concert alerts, artist news, and friend activity</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
            <View style={styles.row}>
                <Text style={styles.sectionTitle}>New Concert Alerts</Text>
                <Switch
                    value={concertAlerts}
                    onValueChange={setConcertAlerts}
                />
            </View>
            {concertAlerts ? ( 
            <>
            <View style={styles.notificationCard}>
                <Text style={styles.notificationText}>Concert alert: "Band A" is performing in your city on July 15th!</Text>
                <Text style={styles.notificationTime}>1 hour ago</Text>
                <Text style={styles.notificationText}>New concert added: "Festival X" lineup announced.</Text>
                <Text style={styles.notificationTime}>3 days ago</Text>
            </View>
            <TouchableOpacity style={styles.linkbutton}>
                <Text style={styles.buttonText}>View Upcoming Concerts</Text>
            </TouchableOpacity>
            </>
            ) : (
            <>
            <View style={styles.notificationCard}>
                <Text style={styles.notificationText}>Concert alerts are currently turned off.</Text>
            </View>
            </>
            )}
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
            <View style={styles.row}>
                <Text style={styles.sectionTitle}>Artist Updates</Text>
                <Switch
                    value={artistUpdates}
                    onValueChange={setArtistUpdates}
                />
            </View>
            {artistUpdates ? (
            <>
            <View style={styles.notificationCard}>
                <Text style={styles.notificationText}>Your favorite artist "Band A" is releasing a new album!</Text>
                <Text style={styles.notificationTime}>2 hours ago</Text>
                <Text style={styles.notificationText}>Concert tickets for "Venue B" are now available.</Text>
                <Text style={styles.notificationTime}>1 day ago</Text>
            </View>
            <TouchableOpacity style={styles.linkbutton}>
                <Text style={styles.buttonText}>Check Artist News</Text>
            </TouchableOpacity>
            </>
            ) : (
            <>
            <View style={styles.notificationCard}>
                <Text style={styles.notificationText}>Artist updates are currently turned off.</Text>
            </View>
            </>
            )}
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
            <View style={styles.row}>
                <Text style={styles.sectionTitle}>Friends Activity</Text>
                <Switch
                    value={friendsActivity}
                    onValueChange={setFriendsActivity}
                />
            </View>
            {friendsActivity ? (
            <>
                <View style={styles.notificationCard}>
                    <Text style={styles.notificationText}>Your friend "User123" is attending "Concert X" next week.</Text>
                    <Text style={styles.notificationTime}>3 days ago</Text>
                    <Text style={styles.notificationText}>"User456" just uploaded new photos from "Concert Y".</Text>
                    <Text style={styles.notificationTime}>5 days ago</Text>
                </View>
                <TouchableOpacity style={styles.linkbutton}>
                    <Text style={styles.buttonText}>View Friends' Activities</Text>
                </TouchableOpacity>
            </>
            ) : (
            <>
                <View style={styles.notificationCard}>
                    <Text style={styles.notificationText}>Friends activity notifications are currently turned off.</Text>
                </View>
            </>
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
    },
    subtext: {
        fontSize: 18,
        color: '#cbd5e1',
        marginTop: 4,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 20,
        color: '#A11EFF',
        fontWeight: '600',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#27C024',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
        
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
});