import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    StyleSheet,
} from "react-native";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

export default function DescriptionScreen() {
    const router = useRouter();

    const {
        evidence,
        categoryLabel,
        category,
    } = useLocalSearchParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleContinue = () => {
        if (!title.trim() || !description.trim()) {
            return;
        }

        router.push({
            pathname: "/report-location",
            params: {
                evidence: evidence as string,
                category: category as string,
                categoryLabel: categoryLabel as string,
                title: title.trim(),
                description: description.trim(),
            },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <View style={styles.container}>

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                    >
                        <Text style={styles.back}>←</Text>
                    </TouchableOpacity>

                    <Text style={styles.logo}>
                        <Text style={styles.jan}>Jan</Text>
                        <Text style={styles.drishti}>Drishti</Text>
                    </Text>

                    <View style={styles.profile}>
                        <Text>👤</Text>
                    </View>
                </View>

                <View style={styles.titleRow}>
                    <Text style={styles.pageTitle}>
                        Describe problem
                    </Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            3 / 4
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.content}>

                    <Text style={styles.heading}>
                        Describe the problem
                    </Text>

                    <Text style={styles.help}>
                        Please provide as much detail as possible so we
                        can accurately assess the issue.
                    </Text>

                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Problem title"
                        placeholderTextColor="#999"
                        style={styles.titleInput}
                    />

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe the problem..."
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                        style={styles.descriptionInput}
                    />

                    <View style={styles.aiBox}>
                        <Text style={styles.aiIcon}>✣</Text>

                        <Text style={styles.aiText}>
                            JanDrishti will help categorize your report
                            automatically based on your description.
                        </Text>
                    </View>

                </View>

                <View style={styles.bottomContainer}>

                    <TouchableOpacity
                        style={[
                            styles.continue,
                            (!title.trim() ||
                                !description.trim()) &&
                            styles.disabled,
                        ]}
                        disabled={
                            !title.trim() ||
                            !description.trim()
                        }
                        onPress={handleContinue}
                    >
                        <Text style={styles.continueText}>
                            Continue →
                        </Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.bottomNav}>
                    <Text style={styles.nav}>⌂{"\n"}Home</Text>
                    <Text style={styles.nav}>◉{"\n"}Nearby</Text>
                    <Text style={styles.active}>＋{"\n"}Report</Text>
                    <Text style={styles.nav}>□{"\n"}Issues</Text>
                    <Text style={styles.nav}>♙{"\n"}Profile</Text>
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
        backgroundColor: "#FFF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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

    titleRow: {
        height: 47,
        paddingHorizontal: 12,
        backgroundColor: "#FFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#29263D",
    },

    badge: {
        backgroundColor: "#F0F0FF",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },

    badgeText: {
        color: "#2937D8",
        fontSize: 10,
        fontWeight: "700",
    },

    divider: {
        height: 1,
        backgroundColor: "#E4E4E4",
        marginHorizontal: 12,
    },

    content: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 20,
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        color: "#29263D",
    },

    help: {
        fontSize: 12,
        color: "#604C43",
        lineHeight: 17,
        marginTop: 5,
        marginBottom: 15,
    },

    titleInput: {
        height: 52,
        borderWidth: 1,
        borderColor: "#E2CFCB",
        borderRadius: 8,
        backgroundColor: "#FFF",
        paddingHorizontal: 14,
        fontSize: 14,
        color: "#29263D",
        marginBottom: 12,
    },

    descriptionInput: {
        height: 290,
        borderWidth: 1,
        borderColor: "#E2CFCB",
        borderRadius: 8,
        backgroundColor: "#FFF",
        padding: 14,
        fontSize: 13,
        color: "#29263D",
    },

    aiBox: {
        marginTop: 14,
        backgroundColor: "#E8E9FF",
        borderRadius: 8,
        padding: 10,
        flexDirection: "row",
    },

    aiIcon: {
        color: "#2937D8",
        fontSize: 24,
        marginRight: 8,
    },

    aiText: {
        flex: 1,
        color: "#2937D8",
        fontSize: 11,
        lineHeight: 15,
    },

    bottomContainer: {
        padding: 12,
    },

    continue: {
        height: 44,
        borderRadius: 24,
        backgroundColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    disabled: {
        opacity: 0.5,
    },

    continueText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },

    bottomNav: {
        height: 62,
        backgroundColor: "#FFF",
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