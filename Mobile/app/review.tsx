import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import * as SecureStore from "expo-secure-store";

import { API_URL } from "../constants/api";

type EvidenceItem = {
    uri: string;
    type: "image" | "video";
    name: string;
    publicId: string;
};

export default function ReviewScreen() {

    const router = useRouter();

    const {
        evidence,
        category,
        categoryLabel,
        title,
        description,
        latitude,
        longitude,
        address,
    } = useLocalSearchParams();

    const [submitting, setSubmitting] =
        useState(false);

    const evidenceItems: EvidenceItem[] =
        evidence
            ? JSON.parse(evidence as string)
            : [];

    const handleSubmit = async () => {

        try {

            setSubmitting(true);

            const token =
                await SecureStore.getItemAsync(
                    "citizen_token"
                );

            if (!token) {
                Alert.alert(
                    "Session Error",
                    "Please login again."
                );

                router.replace("/login");
                return;
            }

            const photos = evidenceItems
                .filter((item) => item.type === "image")
                .map((item) => ({
                    url: item.uri,
                    publicId: item.publicId,
                }));

            const videos = evidenceItems
                .filter((item) => item.type === "video")
                .map((item) => ({
                    url: item.uri,
                    publicId: item.publicId,
                }));

            const response = await fetch(
                `${API_URL}/api/citizen/issues`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({

                        title,

                        description,

                        category,

                        photos,

                        videos,

                        location: {
                            latitude:
                                Number(latitude),

                            longitude:
                                Number(longitude),

                            address,

                        },

                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit report"
                );
            }

            console.log(
                "Issue submitted:",
                data.issue
            );

            router.replace({
                pathname: "/submitted",
                params: {
                    issueId: data.issue._id,
                },
            });

        } catch (error) {

            console.error(
                "Submit issue error:",
                error
            );

            Alert.alert(
                "Submission Failed",
                error instanceof Error
                    ? error.message
                    : "Unable to submit your challenge."
            );

        } finally {

            setSubmitting(false);

        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <View style={styles.container}>

                {/* HEADER */}

                <View style={styles.header}>

                    <TouchableOpacity
                        onPress={() => router.back()}
                    >
                        <Text style={styles.back}>
                            ←
                        </Text>
                    </TouchableOpacity>

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

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >

                    <View style={styles.titleRow}>

                        <Text style={styles.pageTitle}>
                            Review Report
                        </Text>

                    </View>

                    {/* TITLE */}

                    <View style={styles.section}>

                        <Text style={styles.issueTitle}>
                            {title}
                        </Text>

                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {categoryLabel}
                            </Text>
                        </View>

                    </View>

                    {/* DESCRIPTION */}

                    <View style={styles.card}>

                        <Text style={styles.label}>
                            Description
                        </Text>

                        <Text style={styles.description}>
                            {description}
                        </Text>

                    </View>

                    {/* LOCATION */}

                    <View style={styles.card}>

                        <Text style={styles.label}>
                            Location
                        </Text>

                        <View style={styles.locationRow}>

                            <Text style={styles.pin}>
                                📍
                            </Text>

                            <View style={styles.locationInfo}>
                                <Text style={styles.address}>
                                    {address ||
                                        "Current Location"}
                                </Text>

                                <Text style={styles.coords}>
                                    {Number(latitude).toFixed(6)},
                                    {" "}
                                    {Number(longitude).toFixed(6)}
                                </Text>
                            </View>

                        </View>

                    </View>

                    {/* EVIDENCE */}

                    <View style={styles.card}>

                        <Text style={styles.label}>
                            Evidence ({evidenceItems.length})
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.evidenceRow}
                        >

                            {evidenceItems.map(
                                (item, index) => (

                                    <View
                                        key={`${item.uri}-${index}`}
                                        style={styles.evidenceItem}
                                    >

                                        {item.type === "image" ? (

                                            <Image
                                                source={{
                                                    uri: item.uri,
                                                }}
                                                style={
                                                    styles.evidenceImage
                                                }
                                            />

                                        ) : (

                                            <View
                                                style={
                                                    styles.videoBox
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.videoIcon
                                                    }
                                                >
                                                    ▶
                                                </Text>
                                            </View>

                                        )}

                                        <Text
                                            style={
                                                styles.fileName
                                            }
                                            numberOfLines={1}
                                        >
                                            {item.name}
                                        </Text>

                                    </View>

                                )
                            )}

                        </ScrollView>

                    </View>

                    {/* SECURE */}

                    <View style={styles.secureBox}>

                        <Text style={styles.secureIcon}>
                            🔒
                        </Text>

                        <Text style={styles.secureText}>
                            Your report will be reviewed by
                            the appropriate government team.
                        </Text>

                    </View>

                </ScrollView>

                {/* SUBMIT */}

                <View style={styles.bottomContainer}>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >

                        {submitting ? (

                            <ActivityIndicator
                                color="#FFFFFF"
                            />

                        ) : (

                            <Text style={styles.submitText}>
                                Submit Challenge →
                            </Text>

                        )}

                    </TouchableOpacity>

                </View>

                {/* NAV */}

                <View style={styles.bottomNav}>

                    <Text style={styles.nav}>
                        ⌂{"\n"}Home
                    </Text>

                    <Text style={styles.nav}>
                        ◉{"\n"}Nearby
                    </Text>

                    <Text style={styles.active}>
                        ＋{"\n"}Report
                    </Text>

                    <Text style={styles.nav}>
                        □{"\n"}Issues
                    </Text>

                    <Text style={styles.nav}>
                        ♙{"\n"}Profile
                    </Text>

                </View>

            </View>

        </SafeAreaView>
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

    back: {
        fontSize: 25,
        color: "#B84E3E",
    },

    logo: {
        fontSize: 22,
        fontWeight: "800",
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

    scrollContent: {
        padding: 12,
        paddingBottom: 25,
    },

    titleRow: {
        marginBottom: 15,
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#29263D",
    },

    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5D4D0",
        marginBottom: 12,
    },

    issueTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#29263D",
        marginBottom: 8,
    },

    categoryBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#FFF0ED",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },

    categoryText: {
        color: "#F76B57",
        fontSize: 10,
        fontWeight: "700",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5D4D0",
        marginBottom: 12,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#29263D",
        marginBottom: 8,
    },

    description: {
        fontSize: 12,
        lineHeight: 18,
        color: "#604C43",
    },

    locationRow: {
        flexDirection: "row",
    },

    pin: {
        fontSize: 22,
        marginRight: 8,
    },

    locationInfo: {
        flex: 1,
    },

    address: {
        fontSize: 12,
        color: "#29263D",
        fontWeight: "600",
    },

    coords: {
        fontSize: 9,
        color: "#888",
        marginTop: 4,
    },

    evidenceRow: {
        flexDirection: "row",
    },

    evidenceItem: {
        width: 110,
        marginRight: 10,
    },

    evidenceImage: {
        width: 110,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#EEEEEE",
    },

    videoBox: {
        width: 110,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#E8E9FF",
        alignItems: "center",
        justifyContent: "center",
    },

    videoIcon: {
        fontSize: 28,
        color: "#2937D8",
    },

    fileName: {
        fontSize: 9,
        color: "#555",
        marginTop: 4,
    },

    secureBox: {
        backgroundColor: "#E8E9FF",
        borderRadius: 9,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
    },

    secureIcon: {
        fontSize: 17,
        marginRight: 8,
    },

    secureText: {
        flex: 1,
        fontSize: 10,
        color: "#2937D8",
        lineHeight: 15,
    },

    bottomContainer: {
        padding: 12,
        backgroundColor: "#F8FAFC",
    },

    submitButton: {
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    submitText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    bottomNav: {
        height: 62,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#DDD",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },

    nav: {
        textAlign: "center",
        fontSize: 9,
        color: "#604C43",
        lineHeight: 17,
    },

    active: {
        textAlign: "center",
        fontSize: 9,
        color: "#F76B57",
        fontWeight: "700",
        lineHeight: 17,
    },

});