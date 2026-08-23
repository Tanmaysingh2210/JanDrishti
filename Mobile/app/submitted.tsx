import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from "react-native";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

export default function SubmittedScreen() {

    const router = useRouter();

    const { issueId } =
        useLocalSearchParams();

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <View style={styles.container}>

                {/* HEADER */}

                <View style={styles.header}>

                    <Text style={styles.logo}>
                        <Text style={styles.jan}>
                            Jan
                        </Text>
                        <Text style={styles.drishti}>
                            Drishti
                        </Text>
                    </Text>

                    <View style={styles.profile}>
                        <Text>👤</Text>
                    </View>

                </View>

                {/* MAIN */}

                <View style={styles.content}>

                    <View style={styles.successCircle}>

                        <Text style={styles.check}>
                            ✓
                        </Text>

                    </View>

                    <Text style={styles.title}>
                        Challenge Submitted
                    </Text>

                    <Text style={styles.subtitle}>
                        Thank you for helping improve your
                        community.
                    </Text>

                    {/* ISSUE ID */}

                    <View style={styles.issueIdBox}>

                        <Text style={styles.idLabel}>
                            CHALLENGE ID
                        </Text>

                        <Text style={styles.issueId}>
                            {issueId
                                ? `#${String(issueId).slice(-8).toUpperCase()}`
                                : "#JD-2026-00128"}
                        </Text>

                    </View>

                    {/* TIMELINE */}

                    <View style={styles.timeline}>

                        <Text style={styles.nextTitle}>
                            NEXT STEPS
                        </Text>

                        <TimelineItem
                            active
                            title="Government Review"
                            subtitle="Pending initial assessment."
                        />

                        <TimelineItem
                            title="Verification"
                            subtitle="Issue verification."
                        />

                        <TimelineItem
                            title="Solution Team"
                            subtitle="Department assignment."
                        />

                        <TimelineItem
                            title="Implementation"
                            subtitle="Work begins."
                        />

                    </View>

                </View>

                {/* BUTTON */}

                <View style={styles.bottomContainer}>

                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => router.replace("/")}
                    >
                        <Text style={styles.trackText}>
                            Track Challenge →
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace("/")}
                    >
                        <Text style={styles.homeText}>
                            Back to home
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>

        </SafeAreaView>
    );
}

function TimelineItem({
    active = false,
    title,
    subtitle,
}: {
    active?: boolean;
    title: string;
    subtitle: string;
}) {

    return (
        <View style={styles.timelineItem}>

            <View
                style={[
                    styles.timelineDot,
                    active &&
                        styles.timelineDotActive,
                ]}
            />

            <View style={styles.timelineText}>

                <Text style={styles.timelineTitle}>
                    {title}
                </Text>

                <Text style={styles.timelineSubtitle}>
                    {subtitle}
                </Text>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        height: 53,
        marginTop: 39,
        paddingHorizontal: 14,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#E6E6E6",
    },

    logo: {
        fontSize: 22,
        fontWeight: "800",
        marginLeft: 15,
    },

    jan: {
        color: "#F76B57",
    },

    drishti: {
        color: "#2937D8",
    },

    profile: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 25,
        paddingTop: 45,
    },

    successCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },

    check: {
        fontSize: 40,
        color: "#FFFFFF",
        fontWeight: "700",
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#29263D",
        textAlign: "center",
    },

    subtitle: {
        fontSize: 13,
        color: "#604C43",
        textAlign: "center",
        lineHeight: 19,
        marginTop: 8,
    },

    issueIdBox: {
        marginTop: 18,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#E5D4D0",
        alignItems: "center",
    },

    idLabel: {
        fontSize: 8,
        color: "#888",
        fontWeight: "600",
    },

    issueId: {
        fontSize: 12,
        color: "#29263D",
        fontWeight: "700",
        marginTop: 3,
    },

    timeline: {
        width: "100%",
        marginTop: 25,
    },

    nextTitle: {
        fontSize: 11,
        color: "#777",
        fontWeight: "700",
        marginBottom: 12,
    },

    timelineItem: {
        flexDirection: "row",
        minHeight: 50,
    },

    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#2937D8",
        backgroundColor: "#FFFFFF",
        marginTop: 3,
        marginRight: 12,
    },

    timelineDotActive: {
        backgroundColor: "#2937D8",
    },

    timelineText: {
        flex: 1,
    },

    timelineTitle: {
        fontSize: 12,
        color: "#2937D8",
        fontWeight: "600",
    },

    timelineSubtitle: {
        fontSize: 10,
        color: "#888",
        marginTop: 2,
    },

    bottomContainer: {
        paddingHorizontal: 12,
        paddingBottom: 20,
        alignItems: "center",
    },

    trackButton: {
        width: "100%",
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    trackText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },

    homeText: {
        color: "#2937D8",
        fontSize: 11,
        marginTop: 10,
    },

});