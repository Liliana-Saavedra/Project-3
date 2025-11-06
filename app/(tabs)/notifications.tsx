import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

export default function Notifications() {
    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Notifications 🔔</Text>
                <Text style={styles.subtext}>Stay updated with concert alerts, artist news, and friend activity</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>New Concert Alerts</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>View Upcoming Shows</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Artist Updates</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Check Artist News</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Friends Activity</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>See What Friends Logged</Text>
                </TouchableOpacity>
            </View>
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
});