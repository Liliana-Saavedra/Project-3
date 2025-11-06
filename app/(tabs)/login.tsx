import { View, Text, StyleSheet, TouchableOpacity, TextInput,  } from "react-native";
import React from "react";

export default function Login() {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.header}>Welcome to Tuned In 🎧</Text>
                <Text style={styles.subtext}>Log in to start tracking your live music journey</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#94a3b8"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                />
            </View>
            <View>
                <TouchableOpacity style={[styles.button, styles.login]}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity style={[styles.button, styles.google]}>
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity style={[styles.button, styles.github]}>
                    <Text style={styles.buttonText}>Sign in with GitHub</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00123C',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 26,
        color: '#0EA3FF',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtext: {
        fontSize: 16,
        color: '#cbd5e1',
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: "500",
        marginHorizontal: 20,
    },
    inputContainer: {
        width: '80%',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#0f172a',
        color: '#e0f2fe',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    login: {
        backgroundColor: '#27C024',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    google: {
        backgroundColor: '#0EA3FF',
    },
    github: {
        backgroundColor: '#A11EFF',
    },
});
    