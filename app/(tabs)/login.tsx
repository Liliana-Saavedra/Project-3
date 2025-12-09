import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator  } from "react-native";
import React, {useState} from "react";
import * as WebBrowser from 'expo-web-browser';
import{makeRedirectUri} from 'expo-auth-session';
import {useRouter} from 'expo-router';
import {supabase} from '../../lib/supabase';
// import React, { use, useState } from "react";

const API_URL = 'http://10.0.2.2:8080';

export default function Login() {
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[loading, setloading] = useState(false);
    const router = useRouter();

    const syncUserWithBackend = async (user: any, provider: string) =>{
        try{
            console.log('Syncing user with backend:', user.id, user.email);

            const providerEnum = provider.toUpperCase();

            const userData = {
                email: user.email,
                username: user.email?.split('@')[0], // Use email prefix as username
                displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
                avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                provider: providerEnum,
                providerId: user.id,
            };

            let response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if(response.status === 409){
                console.log('User already exists, fetching existing user...');
                response = await fetch(`${API_URL}/api/users/email/${encodedURIComponent(user.email)}`);
            }
            if(response.ok){
                const data = await response.json();
                console.log('User synced with backend', data);
                return data;
            }else{
                const errorData = await response.text();
                console.error('Failed to sync user with backend:', errorData);
            }
        }catch(error){
            console.error('Error syncing user with backend:', error);
        }
    };

    const handelGoogleSignIn = async () => {
        setloading(true);
        try{
            const redirectUri = makeRedirectUri();
            console.log('Redirect URI:',redirectUri);

            const {data, error} = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if(error){
                Alert.alert('Error', error.message);
                return;
            }

            if(data?.url){
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url, 
                    redirectUri
                );

                console.log('WebBrowser result:', result);

                if(result.type === 'success' && result.url){
                    const hashIndex = result.url.indexOf('#');
                    if(hashIndex !== -1){
                        const hashParams = result.url.substring(hashIndex + 1);
                        const urlParams = new URLSearchParams(hashParams);
                        const accessToken = urlParams.get('access_token');
                        const refreshToken = urlParams.get('refresh_token');

                        console.log('Tokens found:', {accessToken: !!accessToken, refreshToken: !!refreshToken});
                        if (accessToken && refreshToken){
                            const {data: sessionData, error: sessionError} = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                            if(sessionError){
                                Alert.alert('Error', sessionError.message);
                            }else{
                                console.log('Session set successfully:', sessionData.user?.email);
                                await syncUserWithBackend(sessionData.user, 'google');

                                Alert.alert('Success', `Welcome${sessionData.user?.email}!`);
                                router.replace('/(tabs)/dashboard');
                            }
                        }else{
                            Alert.alert('Error', 'Failed to get authentication tokens');
                        }
                    }
                }
            }
        }catch (error:any){
            console.error('Google Sign-In Error:', error);
            Alert.alert('Error' , error.message || 'An unexpected error ocurred');
        }finally{
            setloading(false);
        }
    };

    } => {
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
    