import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                // Redirect to My Concerts when authenticated
                router.replace('/(tabs)/userConcerts');
            } else {
                // Redirect to login when not authenticated
                router.replace('/(tabs)/login');
            }
        }
    }, [isAuthenticated, isLoading]);

    // Show loading while redirecting
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0EA3FF" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00123C',
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