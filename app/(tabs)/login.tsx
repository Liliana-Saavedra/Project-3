import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Backend API URL (use 10.0.2.2 for Android emulator to reach localhost)
const API_URL = 'https://project-3-app-28bcd4518326.herokuapp.com';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Create or sync user in backend database after OAuth login
    const syncUserWithBackend = async (user: any, provider: string) => {
        try {
            console.log('Syncing user with backend:', user.id, user.email);

            // Map provider to backend enum format (uppercase)
            const providerEnum = provider.toUpperCase(); // "google" -> "GOOGLE"

            const userData = {
                email: user.email,
                username: user.email?.split('@')[0], // Use email prefix as username
                displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
                avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                provider: providerEnum,
                providerId: user.id, // Supabase user ID
            };

            // First, try to create the user
            let response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // If user already exists (409 CONFLICT), get existing user by email
            if (response.status === 409) {
                console.log('User already exists, fetching existing user...');
                response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(user.email)}`);
            }

            if (response.ok) {
                const data = await response.json();
                console.log('User synced with backend:', data);
                return data;
            } else {
                const errorData = await response.text();
                console.error('Failed to sync user with backend:', errorData);
            }
        } catch (error) {
            console.error('Error syncing user with backend:', error);
            // Don't throw - user is still authenticated even if backend sync fails
        }
    };

    // Sign in with Google via Supabase OAuth
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            // Create redirect URI for Expo (no path to avoid unmatched route)
            const redirectUri = makeRedirectUri();

            console.log('Redirect URI:', redirectUri);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if (error) {
                Alert.alert('Error', error.message);
                return;
            }

            if (data?.url) {
                // Open browser for OAuth
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUri
                );

                console.log('WebBrowser result:', result);

                if (result.type === 'success' && result.url) {
                    // Parse tokens from the URL hash (handle exp:// URLs)
                    const hashIndex = result.url.indexOf('#');
                    if (hashIndex !== -1) {
                        const hashParams = result.url.substring(hashIndex + 1);
                        const urlParams = new URLSearchParams(hashParams);
                        const accessToken = urlParams.get('access_token');
                        const refreshToken = urlParams.get('refresh_token');

                        console.log('Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

                        if (accessToken && refreshToken) {
                            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                            if (sessionError) {
                                Alert.alert('Error', sessionError.message);
                            } else {
                                console.log('Session set successfully:', sessionData.user?.email);

                                // Sync user with backend database
                                await syncUserWithBackend(sessionData.user, 'google');

                                Alert.alert('Success', `Welcome ${sessionData.user?.email}!`);
                                // Navigate to dashboard after successful login
                                router.replace('/(tabs)/dashboard');
                            }
                        } else {
                            Alert.alert('Error', 'Failed to get authentication tokens');
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Email/Password sign in
    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Success', `Welcome back, ${data.user?.email}!`);
                router.replace('/(tabs)/dashboard');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // GitHub OAuth via Supabase
    const handleGitHubSignIn = async () => {
        setLoading(true);
        try {
            const redirectUri = makeRedirectUri();

            console.log('GitHub Redirect URI:', redirectUri);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if (error) {
                Alert.alert('Error', error.message);
                return;
            }

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUri
                );

                console.log('GitHub WebBrowser result:', result);

                if (result.type === 'success' && result.url) {
                    const hashIndex = result.url.indexOf('#');
                    if (hashIndex !== -1) {
                        const hashParams = result.url.substring(hashIndex + 1);
                        const urlParams = new URLSearchParams(hashParams);
                        const accessToken = urlParams.get('access_token');
                        const refreshToken = urlParams.get('refresh_token');

                        if (accessToken && refreshToken) {
                            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                            if (sessionError) {
                                Alert.alert('Error', sessionError.message);
                            } else {
                                console.log('GitHub session set:', sessionData.user?.email);

                                // Sync user with backend database
                                await syncUserWithBackend(sessionData.user, 'github');

                                Alert.alert('Success', `Welcome ${sessionData.user?.email || sessionData.user?.user_metadata?.user_name}!`);
                                router.replace('/(tabs)/dashboard');
                            }
                        } else {
                            Alert.alert('Error', 'Failed to get authentication tokens');
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('GitHub Sign-In Error:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.header}>Welcome to Tuned In 🎧</Text>
                <Text style={styles.subtext}>Log in to start tracking your live music journey</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.login]}
                    onPress={handleEmailLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.google]}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.github]}
                    onPress={handleGitHubSignIn}
                    disabled={loading}
                >
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
    buttonContainer: {
        width: '80%',
    },
    login: {
        backgroundColor: '#27C024',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
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
    disabled: {
        opacity: 0.6,
    },
});
