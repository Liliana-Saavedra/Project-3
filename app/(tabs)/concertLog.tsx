import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, FlatList, RefreshControl, Image, ActivityIndicator } from "react-native";
import React, {useState, useEffect} from "react";
import {Ionicons} from "@expo/vector-icons";
import {createClient} from '@supabase.supabase-js';
import * as ImagePicker from 'expo-image-picker';

const supabaseUrl = 'https://mfwvfbqzpaeyztgqhhtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1md3ZmYnF6cGFleXp0Z3FoaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTA5NzEsImV4cCI6MjA3ODEyNjk3MX0.zlQWmN_8IDn-3AFcLjeBBtxLF8CYH4G4BqSgZspEj7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
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
    ticketUrl: string;
}
export default function Concerts() {
    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Concert Log 📸</Text>
                <Text style={styles.subtext}>Track your concert experiences and memories.</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Filter Concerts</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>By Artist</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>By Date</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>By Venue</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Upload Photos</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Add Concert Photo</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Personal Notes</Text>
                <Text style={styles.subtext}>Add reflections, memories, or thoughts from each concert</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Write a Note</Text>
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

