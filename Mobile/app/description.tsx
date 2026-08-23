import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "../constants/api";

// Category display labels
const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    roads_traffic:      { label: "Roads & Traffic",    icon: "⚒"  },
    sanitation:         { label: "Sanitation",         icon: "♜"  },
    water_management:   { label: "Water",              icon: "💧" },
    education:          { label: "Education",          icon: "🎓" },
    health:             { label: "Healthcare",         icon: "✚"  },
    environment:        { label: "Agriculture",        icon: "♧"  },
    electricity:        { label: "Energy",             icon: "ϟ"  },
    social:             { label: "Public Safety",      icon: "♙"  },
    infrastructure:     { label: "Infrastructure",     icon: "🏗️" },
    other:              { label: "Others",             icon: "•••"},
};

export default function DescriptionScreen() {
    const router = useRouter();
    const { evidence } = useLocalSearchParams();

    const [title, setTitle]               = useState("");
    const [description, setDescription]   = useState("");
    const [classifying, setClassifying]   = useState(false);

    // AI-detected category result
    const [detectedCategory, setDetectedCategory]     = useState<string | null>(null);
    const [detectedCategoryLabel, setDetectedCategoryLabel] = useState<string>("");

    // ==========================================
    // AI CLASSIFY (on blur — background preview)
    // ==========================================
    const classifyWithAI = async () => {
        if (!title.trim() && !description.trim()) return;
        if (detectedCategory) return; // already classified
        setClassifying(true);
        try {
            const res = await fetch(`${API_URL}/api/citizen/issues/classify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), description: description.trim() }),
            });
            const data = await res.json();
            if (data.success && data.category) {
                const cat = data.category as string;
                setDetectedCategory(cat);
                setDetectedCategoryLabel(CATEGORY_LABELS[cat]?.label || cat);
            }
        } catch {
            // ignore
        } finally {
            setClassifying(false);
        }
    };

    // ==========================================
    // CONTINUE — classify if needed, then navigate
    // ==========================================
    const handleContinue = async () => {
        if (!title.trim() || !description.trim()) return;

        let finalCategory = detectedCategory;
        let finalLabel    = detectedCategoryLabel;

        // If no AI result yet, classify now
        if (!finalCategory) {
            setClassifying(true);
            try {
                const res = await fetch(`${API_URL}/api/citizen/issues/classify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: title.trim(), description: description.trim() }),
                });
                const data = await res.json();
                if (data.success && data.category) {
                    finalCategory = data.category as string;
                    finalLabel    = CATEGORY_LABELS[finalCategory]?.label || finalCategory;
                    setDetectedCategory(finalCategory);
                    setDetectedCategoryLabel(finalLabel);
                }
            } catch {
                finalCategory = "other";
                finalLabel    = "Others";
            } finally {
                setClassifying(false);
            }
        }

        router.push({
            pathname: "/report-location",
            params: {
                evidence:      evidence as string,
                category:      finalCategory || "other",
                categoryLabel: finalLabel || "Others",
                title:         title.trim(),
                description:   description.trim(),
            },
        });
    };

    // Called when user presses "Change Category"
    const handleChangeCategory = () => {
        router.push({
            pathname: "/category",
            params: {
                evidence:           evidence as string,
                title:              title.trim(),
                description:        description.trim(),
                aiCategory:         detectedCategory || "other",
                aiCategoryLabel:    detectedCategoryLabel || "Others",
            },
        });
    };

    const canContinue = title.trim().length > 0 && description.trim().length > 0;

    const catInfo = detectedCategory
        ? CATEGORY_LABELS[detectedCategory] ?? { label: detectedCategoryLabel, icon: "•••" }
        : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
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

                {/* TITLE ROW */}
                <View style={styles.titleRow}>
                    <Text style={styles.pageTitle}>Describe problem</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>2 / 4</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* CONTENT */}
                <View style={styles.content}>

                    <Text style={styles.heading}>Describe the problem</Text>
                    <Text style={styles.help}>
                        Provide as much detail as possible so we can accurately assess the issue.
                    </Text>

                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Problem title"
                        placeholderTextColor="#999"
                        style={styles.titleInput}
                        onBlur={classifyWithAI}
                    />

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe the problem..."
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                        style={styles.descriptionInput}
                        onBlur={classifyWithAI}
                    />

                    {/* AI DETECTION RESULT */}
                    {classifying ? (
                        <View style={styles.aiBox}>
                            <ActivityIndicator size="small" color="#2937D8" />
                            <Text style={styles.aiDetecting}>
                                AI is detecting category…
                            </Text>
                        </View>
                    ) : catInfo ? (
                        <View style={styles.detectedBox}>
                            <View style={styles.detectedLeft}>
                                <Text style={styles.aiLabel}>AI Detected Category</Text>
                                <View style={styles.detectedChip}>
                                    <Text style={styles.detectedIcon}>{catInfo.icon}</Text>
                                    <Text style={styles.detectedName}>{catInfo.label}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.changeBtn}
                                onPress={handleChangeCategory}
                            >
                                <Text style={styles.changeBtnText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.aiBox}>
                            <Text style={styles.aiIcon}>✣</Text>
                            <Text style={styles.aiText}>
                                JanDrishti AI will auto-detect the category from your description.
                            </Text>
                        </View>
                    )}

                </View>

                {/* CONTINUE BUTTON */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[
                            styles.continue,
                            (!canContinue || classifying) && styles.disabled,
                        ]}
                        disabled={!canContinue || classifying}
                        onPress={handleContinue}
                    >
                        {classifying ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.continueText}>
                                {detectedCategory ? "Continue →" : "Detect & Continue →"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* BOTTOM NAV */}
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
    safeArea:  { flex: 1, backgroundColor: "#F8FAFC" },
    container: { flex: 1, backgroundColor: "#F8FAFC" },

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
    back:    { fontSize: 25, color: "#B84E3E" },
    logo:    { fontSize: 22, fontWeight: "800" },
    jan:     { color: "#F76B57" },
    drishti: { color: "#2937D8" },
    profile: {
        width: 32, height: 32, borderRadius: 16,
        borderWidth: 2, borderColor: "#F76B57",
        alignItems: "center", justifyContent: "center",
    },

    titleRow: {
        height: 47,
        paddingHorizontal: 12,
        backgroundColor: "#FFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pageTitle: { fontSize: 24, fontWeight: "700", color: "#29263D" },
    badge: {
        backgroundColor: "#F0F0FF",
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    },
    badgeText: { color: "#2937D8", fontSize: 10, fontWeight: "700" },

    divider: { height: 1, backgroundColor: "#E4E4E4", marginHorizontal: 12 },

    content: { flex: 1, paddingHorizontal: 12, paddingTop: 20 },

    heading: { fontSize: 20, fontWeight: "700", color: "#29263D" },
    help: {
        fontSize: 12, color: "#604C43", lineHeight: 17,
        marginTop: 5, marginBottom: 15,
    },

    titleInput: {
        height: 52,
        borderWidth: 1, borderColor: "#E2CFCB", borderRadius: 8,
        backgroundColor: "#FFF",
        paddingHorizontal: 14, fontSize: 14, color: "#29263D",
        marginBottom: 12,
    },
    descriptionInput: {
        height: 200,
        borderWidth: 1, borderColor: "#E2CFCB", borderRadius: 8,
        backgroundColor: "#FFF",
        padding: 14, fontSize: 13, color: "#29263D",
        marginBottom: 14,
    },

    // Waiting / hint box
    aiBox: {
        backgroundColor: "#E8E9FF",
        borderRadius: 8, padding: 12,
        flexDirection: "row", alignItems: "center", gap: 8,
    },
    aiIcon:      { color: "#2937D8", fontSize: 22 },
    aiText:      { flex: 1, color: "#2937D8", fontSize: 11, lineHeight: 15 },
    aiDetecting: { marginLeft: 10, color: "#2937D8", fontSize: 12 },

    // Detected category result
    detectedBox: {
        backgroundColor: "#EEF9F0",
        borderWidth: 1, borderColor: "#4CAF7D",
        borderRadius: 10, padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detectedLeft: { flex: 1 },
    aiLabel: { fontSize: 10, color: "#4CAF7D", fontWeight: "700", marginBottom: 6 },
    detectedChip: {
        flexDirection: "row", alignItems: "center", gap: 6,
    },
    detectedIcon: { fontSize: 20 },
    detectedName: { fontSize: 16, fontWeight: "700", color: "#29263D" },

    changeBtn: {
        marginLeft: 12,
        borderWidth: 1, borderColor: "#2937D8",
        borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    changeBtnText: { color: "#2937D8", fontSize: 12, fontWeight: "700" },

    // Bottom
    bottomContainer: { padding: 12 },
    continue: {
        height: 44, borderRadius: 24,
        backgroundColor: "#F76B57",
        alignItems: "center", justifyContent: "center",
    },
    disabled: { opacity: 0.5 },
    continueText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

    bottomNav: {
        height: 62, backgroundColor: "#FFF",
        borderTopWidth: 1, borderTopColor: "#DDD",
        flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    },
    nav:    { textAlign: "center", fontSize: 9, color: "#604C43", lineHeight: 17 },
    active: { textAlign: "center", fontSize: 9, color: "#F76B57", fontWeight: "700", lineHeight: 17 },
});