import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

export default function Dashboard() {
    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Dashboard 📊</Text>
                <Text style={styles.subtext}>Overview of your concert activities and stats</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Most-Seen Artist</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>View Top Artists</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Favorite Venues</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Explore Venues</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Genre Breakdown</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>View Genre Insights</Text>
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
    },
    button: {
        backgroundColor: '#0EA3FF',
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

