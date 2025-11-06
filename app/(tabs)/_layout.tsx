import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
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
       
        <Tabs.Screen
        name="index"
        options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons
                    name={focused ? "home-sharp" : "home-outline"}
                    color={color}
                    size={24}
                />
            ),
        }}
        />
        <Tabs.Screen
        name = "login"
        options={{
            title: "Login",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons
                    name={focused ? "log-in" : "log-in-outline"}
                    color={color}
                    size={24}
                />
            ),
        }}
        />
        <Tabs.Screen
        name = "concertLog"
        options={{
            title: "Concerts",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons
                    name={focused ? "musical-notes" : "musical-notes-outline"}
                    color={color}
                    size={24}
                />
            ),
        }}
        />

        <Tabs.Screen
        name = "setLists"
        options={{
            title: "Set Lists",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons
                    name={focused ? "list" : "list-outline"}
                    color={color}
                    size={24}
                />
            ),
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
        }}
        />
        <Tabs.Screen
        name = "notifications"
        options={{
            title: "Notifications",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons
                    name={focused ? "notifications" : "notifications-outline"}
                    color={color}
                    size={24}
                />
            ),
        }}
        />
        <Tabs.Screen
        name = "profile"
        options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
                <Ionicons
                    name={focused ? "person-circle" : "person-circle-outline"}
                    color={color}
                    size={24}
                />
            ),
        }}
        />
        </Tabs>
    );
}
