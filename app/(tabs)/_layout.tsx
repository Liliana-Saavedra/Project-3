import { Tabs, useRouter, useSegments } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    // Redirect based on auth state
    useEffect(() => {
        if (isLoading) return;

        const segmentsArray = segments as string[];
        const currentRoute = segmentsArray.length > 1 ? segmentsArray[1] : segmentsArray[0]; // e.g., "login", "dashboard", etc.

        if (!isAuthenticated && currentRoute !== 'login') {
            // Not logged in and trying to access any route -> redirect to login
            router.replace('/(tabs)/login');
        } else if (isAuthenticated && currentRoute === 'login') {
            // Logged in but on login page -> redirect to dashboard
            router.replace('/(tabs)/dashboard');
        }
    }, [isAuthenticated, isLoading, segments]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00123C' }}>
                <ActivityIndicator size="large" color="#ffd33d" />
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#ffd33d",
                headerStyle: {
                    backgroundColor: "#00123C",
                },
                headerTitleAlign: "center",
                headerTitleStyle: { color: "#ffffff" },
                tabBarStyle: {
                    backgroundColor: "#00123C",
                },
            }}
        >
            {/* Index route - hidden, just redirects */}
            <Tabs.Screen
                name="index"
                options={{
                    href: null, // Always hide from tab bar
                }}
            />

            {/* Login tab - only visible when NOT authenticated */}
            <Tabs.Screen
                name="login"
                options={{
                    title: "Login",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "log-in" : "log-in-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    // Hide this tab when user is authenticated
                    href: isAuthenticated ? null : '/(tabs)/login',
                }}
            />

            {/* Protected tabs - only visible when authenticated */}
            <Tabs.Screen
                name="concertLog"
                options={{
                    title: "Concerts",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "musical-notes" : "musical-notes-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    // Hide this tab when user is NOT authenticated
                    href: isAuthenticated ? '/(tabs)/concertLog' : null,
                }}
            />

            <Tabs.Screen
                name="userConcerts"
                options={{
                    title: "My Concerts",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "albums" : "albums-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    href: isAuthenticated ? '/(tabs)/userConcerts' : null,
                }}
            />

            <Tabs.Screen
                name="setLists"
                options={{
                    title: "Set Lists",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "list" : "list-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    href: isAuthenticated ? '/(tabs)/setLists' : null,
                }}
            />

            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "speedometer" : "speedometer-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    href: isAuthenticated ? '/(tabs)/dashboard' : null,
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Notifications",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "notifications" : "notifications-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    href: isAuthenticated ? '/(tabs)/notifications' : null,
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person-circle" : "person-circle-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                    href: isAuthenticated ? '/(tabs)/profile' : null,
                }}
            />
        </Tabs>
    );
}