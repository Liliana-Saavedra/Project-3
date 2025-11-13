import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import React from "react";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
    return (
        <ScrollView style={styles.container}>
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Dashboard 📊</Text>
                <Text style={styles.subtext}>Overview of your concert activities and stats</Text>
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Most-Seen Artist</Text>
                <BarChart
                    data={{
                        labels: ["Artist A", "Artist B", "Artist C", "Artist D"],
                        datasets: [
                            {
                                data: [5, 8, 3, 6],
                            },
                        ],
                    }}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                />
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Top Venues or Cities</Text>
                <BarChart
                data={{
                    labels: ["Venue A", "Venue B", "Venue C"],
                    datasets: [
                        {
                            data: [4, 7, 5],
                        },
                    ],
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                />
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Genre Breakdown</Text>
                <PieChart
                    data={[
                        { name: "Rock", population: 45, color: "#f00", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                        { name: "Pop", population: 30, color: "#0f0", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                        { name: "Jazz", population: 15, color: "#00f", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                        { name: "Classical", population: 10, color: "#ff0", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                    ]}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                />
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Concerts Over Time</Text>
                <LineChart
                    data={{
                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                        datasets: [
                            {
                                data: [2, 4, 3, 5, 6, 8],
                            },
                        ],
                    }}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                />
            </View>
            <View style={[styles.section, styles.sectionWithBorder]}>
                <Text style={styles.sectionTitle}>Favorite Songs</Text>
                <PieChart
                    data={[
                        { name: "Song A", population: 40, color: "#f54242", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                        { name: "Song B", population: 35, color: "#42f554", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                        { name: "Song C", population: 25, color: "#4287f5", legendFontColor: "#7F7F7F", legendFontSize: 15 },
                    ]}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                />
            </View>
        </View>
        </ScrollView>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#00123C",
    backgroundGradientTo: "#00123C",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(14, 163, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(203, 213, 225, ${opacity})`,
};

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
        width: '50%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

