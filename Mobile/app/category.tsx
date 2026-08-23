import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const categories = [
    { name: "Roads",        value: "roads_traffic",   icon: "⚒"  },
    { name: "Sanitation",   value: "sanitation",      icon: "♜"  },
    { name: "Water",        value: "water_management", icon: "💧" },
    { name: "Education",    value: "education",       icon: "🎓" },
    { name: "Healthcare",   value: "health",          icon: "✚"  },
    { name: "Agriculture",  value: "environment",     icon: "♧"  },
    { name: "Energy",       value: "electricity",     icon: "ϟ"  },
    { name: "Public Safety",value: "social",          icon: "♙"  },
    { name: "Infrastructure",value: "infrastructure", icon: "🏗️" },
    { name: "Others",       value: "other",           icon: "•••"},
];

export default function CategoryScreen() {
    const router = useRouter();

    const {
        evidence,
        title,
        description,
        aiCategory,
        aiCategoryLabel,
    } = useLocalSearchParams<{
        evidence: string;
        title: string;
        description: string;
        aiCategory: string;
        aiCategoryLabel: string;
    }>();

    // Pre-select the AI-detected category if passed in
    const [selectedValue, setSelectedValue] = useState<string>(
        aiCategory || ""
    );

    const handleConfirm = () => {
        if (!selectedValue) return;

        const selected = categories.find((c) => c.value === selectedValue);

        router.push({
            pathname: "/report-location",
            params: {
                evidence:      evidence,
                category:      selectedValue,
                categoryLabel: selected?.name || aiCategoryLabel || "",
                title:         title || "",
                description:   description || "",
            },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>

                    <Text style={styles.logo}>
                        <Text style={styles.logoJan}>Jan</Text>
                        <Text style={styles.logoDrishti}>Drishti</Text>
                    </Text>

                    <View style={styles.profileCircle}>
                        <Text>👤</Text>
                    </View>
                </View>

                {/* TITLE */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Choose Category</Text>
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressText}>2 / 4</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    {aiCategory ? (
                        <View style={styles.aiNote}>
                            <Text style={styles.aiNoteIcon}>✣</Text>
                            <Text style={styles.aiNoteText}>
                                AI suggested <Text style={styles.aiNoteCategory}>{aiCategoryLabel}</Text>.
                                Select a different one below.
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.subtitle}>
                            Select the category that best describes the issue.
                        </Text>
                    )}

                    <View style={styles.grid}>
                        {categories.map((category) => {
                            const isSelected = selectedValue === category.value;
                            const isAI       = aiCategory === category.value;

                            return (
                                <TouchableOpacity
                                    key={category.value}
                                    style={[
                                        styles.categoryCard,
                                        isSelected && styles.selectedCard,
                                    ]}
                                    onPress={() => setSelectedValue(category.value)}
                                    activeOpacity={0.8}
                                >
                                    {isAI && !isSelected && (
                                        <View style={styles.aiTag}>
                                            <Text style={styles.aiTagText}>AI</Text>
                                        </View>
                                    )}

                                    <Text style={[styles.categoryIcon, isSelected && styles.selectedIcon]}>
                                        {category.icon}
                                    </Text>
                                    <Text style={[styles.categoryText, isSelected && styles.selectedText]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* CONTINUE */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[styles.continueButton, !selectedValue && styles.disabledButton]}
                        disabled={!selectedValue}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.continueText}>Confirm Category →</Text>
                    </TouchableOpacity>
                </View>

                {/* NAVIGATION */}
                <View style={styles.bottomNav}>
                    <Text style={styles.navText}>⌂{"\n"}Home</Text>
                    <Text style={styles.navText}>◉{"\n"}Nearby</Text>
                    <Text style={styles.activeNavText}>＋{"\n"}Report</Text>
                    <Text style={styles.navText}>□{"\n"}Issues</Text>
                    <Text style={styles.navText}>♙{"\n"}Profile</Text>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea:  { flex: 1, backgroundColor: "#F8FAFC" },
    container: { flex: 1, backgroundColor: "#F8FAFC" },

    header: {
        height: 53,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E6E6E6",
        marginTop: 39,
    },
    backButton: { width: 46, height: 46, justifyContent: "center" },
    backText:   { fontSize: 25, color: "#B84E3E" },
    logo:       { fontSize: 22, fontWeight: "800" },
    logoJan:    { color: "#F76B57" },
    logoDrishti:{ color: "#2937D8" },
    profileCircle: {
        width: 32, height: 32, borderRadius: 16,
        borderWidth: 2, borderColor: "#F76B57",
        alignItems: "center", justifyContent: "center",
    },

    titleRow: {
        height: 47, paddingHorizontal: 12,
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", backgroundColor: "#FFFFFF",
    },
    title: { fontSize: 24, fontWeight: "700", color: "#29263D" },
    progressBadge: {
        backgroundColor: "#F0F0FF", borderRadius: 12,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    progressText: { color: "#2937D8", fontSize: 10, fontWeight: "700" },

    divider: { height: 1, backgroundColor: "#E4E4E4", marginHorizontal: 12 },

    content: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 20 },

    aiNote: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#E8E9FF",
        borderRadius: 8, padding: 10,
        marginBottom: 16, gap: 8,
    },
    aiNoteIcon: { fontSize: 18, color: "#2937D8" },
    aiNoteText: { flex: 1, fontSize: 12, color: "#2937D8", lineHeight: 17 },
    aiNoteCategory: { fontWeight: "700" },

    subtitle: { fontSize: 13, color: "#604C43", marginBottom: 18 },

    grid: {
        flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
    },

    categoryCard: {
        width: "48%", height: 110,
        backgroundColor: "#FFFFFF",
        borderWidth: 1, borderColor: "#DADADA",
        borderRadius: 8, marginBottom: 12,
        alignItems: "center", justifyContent: "center",
        position: "relative",
    },
    selectedCard: { borderColor: "#2939e9", backgroundColor: "#dfe1fb" },

    aiTag: {
        position: "absolute", top: 6, right: 6,
        backgroundColor: "#2937D8",
        borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
    },
    aiTagText: { color: "#FFF", fontSize: 8, fontWeight: "700" },

    categoryIcon: { fontSize: 21, marginBottom: 5 },
    selectedIcon: { color: "#2937D8" },
    categoryText: { fontSize: 15, fontWeight: "600", color: "#29263D", textAlign: "center" },
    selectedText: { color: "#2937D8" },

    bottomContainer: { paddingHorizontal: 12, paddingVertical: 10 },
    continueButton: {
        height: 44, borderRadius: 24,
        backgroundColor: "#F76B57",
        alignItems: "center", justifyContent: "center",
    },
    disabledButton: { opacity: 0.5 },
    continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

    bottomNav: {
        height: 62, backgroundColor: "#FFFFFF",
        borderTopWidth: 1, borderTopColor: "#DCDCDC",
        flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    },
    navText: { textAlign: "center", fontSize: 12, color: "#604C43", lineHeight: 17 },
    activeNavText: { textAlign: "center", fontSize: 9, color: "#F76B57", fontWeight: "700", lineHeight: 17 },
});