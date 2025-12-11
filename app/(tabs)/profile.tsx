import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function Profile() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                        router.replace("/(tabs)/login");
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Profile 👤</Text>
                <Text style={styles.subtext}>Manage your account</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>User Info</Text>
                {user?.user_metadata?.avatar_url && (
                    <Image
                        source={{ uri: user.user_metadata.avatar_url }}
                        style={styles.avatar}
                    />
                )}
                <Text style={styles.userInfo}>
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Shared Memories</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>View Concert Highlights</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Friend Sync</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Connect with Friends</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Logout</Text>
                <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
                    <Text style={styles.buttonText}>Sign Out</Text>
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
    signOutButton: {
        backgroundColor: '#dc2626',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    userInfo: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
});