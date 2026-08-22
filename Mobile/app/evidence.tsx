import React, { useState } from "react";
import { API_URL } from "../constants/api";
import * as SecureStore from "expo-secure-store";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Modal,
    Pressable,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

type EvidenceItem = {
    uri: string;
    type: "image" | "video";
    name: string;
    publicId: string;
};

export default function EvidenceScreen() {
    const router = useRouter();

    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [loading, setLoading] = useState(false);


    const [previewItem, setPreviewItem] =
        useState<EvidenceItem | null>(null);

    // ==========================================
    // PREVIEW EVIDENCE
    // ==========================================

    const handlePreview = (item: EvidenceItem) => {
        setPreviewItem(item);
    };

    const uploadEvidence = async (
        uri: string,
        type: "image" | "video",
        fileName: string
    ) => {
        try {
            setLoading(true);

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

                return null;
            }

            const formData = new FormData();

            formData.append("file", {
                uri,
                name: fileName,
                type:
                    type === "image"
                        ? "image/jpeg"
                        : "video/mp4",
            } as any);

            const response = await fetch(
                `${API_URL}/api/citizen/issues/evidence`,
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },

                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to upload evidence"
                );
            }

            console.log(
                "Cloudinary upload:",
                data.file
            );

            return data.file;

        } catch (error) {

            console.error(
                "Evidence upload error:",
                error
            );

            Alert.alert(
                "Upload Failed",
                "Could not upload the evidence. Please try again."
            );

            return null;

        } finally {

            setLoading(false);

        }
    };
    // ==========================================
    // TAKE PHOTO
    // ==========================================
    const handleTakePhoto = async () => {
        try {

            const permission =
                await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Camera Permission",
                    "Camera permission is required to take a photo."
                );
                return;
            }

            const result =
                await ImagePicker.launchCameraAsync({
                    mediaTypes: ["images"],
                    allowsEditing: false,
                    quality: 0.8,
                });

            if (result.canceled) {
                return;
            }

            const asset = result.assets[0];

            const fileName =
                asset.fileName ||
                `photo_${Date.now()}.jpg`;

            // Upload to Cloudinary
            const uploaded =
                await uploadEvidence(
                    asset.uri,
                    "image",
                    fileName
                );

            if (!uploaded) {
                return;
            }

            // Show uploaded evidence
            setEvidence((prev) => [
                ...prev,
                {
                    uri: uploaded.url,
                    type: "image",
                    name: fileName,

                    // Keep Cloudinary information
                    // for the final issue submission
                    publicId: uploaded.publicId,
                } as any,
            ]);

        } catch (error) {

            console.error(
                "Photo error:",
                error
            );

            Alert.alert(
                "Error",
                "Unable to take photo."
            );
        }
    };
    // ==========================================
    // RECORD VIDEO
    // ==========================================

    const handleRecordVideo = async () => {
        try {

            const permission =
                await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Camera Permission",
                    "Camera permission is required to record a video."
                );
                return;
            }

            const result =
                await ImagePicker.launchCameraAsync({
                    mediaTypes: ["videos"],
                    allowsEditing: false,
                    quality: 0.7,
                    videoMaxDuration: 60,
                });

            if (result.canceled) {
                return;
            }

            const asset = result.assets[0];

            const fileName =
                asset.fileName ||
                `video_${Date.now()}.mp4`;

            // Upload to Cloudinary
            const uploaded =
                await uploadEvidence(
                    asset.uri,
                    "video",
                    fileName
                );

            if (!uploaded) {
                return;
            }

            // Show uploaded video
            setEvidence((prev) => [
                ...prev,
                {
                    uri: uploaded.url,
                    type: "video",
                    name: fileName,
                    publicId: uploaded.publicId,
                } as any,
            ]);

        } catch (error) {

            console.error(
                "Video error:",
                error
            );

            Alert.alert(
                "Error",
                "Unable to record video."
            );
        }
    };

    // ==========================================
    // CONTINUE
    // ==========================================

    const handleContinue = () => {
        if (evidence.length === 0) {
            Alert.alert(
                "Add Evidence",
                "Please take a photo or record a video before continuing."
            );

            return;
        }

        /*
          Later:
    
          1. Upload evidence to backend
          2. Backend uploads to Cloudinary
          3. Receive Cloudinary URLs
          4. Navigate to next report page
        */

        router.push("/");
    };

    // ==========================================
    // REMOVE EVIDENCE
    // ==========================================

    const removeEvidence = (index: number) => {
        setEvidence((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <View style={styles.container}>

                {/* ================= HEADER ================= */}

                <View style={styles.header}>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>

                    <Text style={styles.logo}>
                        <Text style={styles.logoJan}>
                            Jan
                        </Text>
                        <Text style={styles.logoDrishti}>
                            Drishti
                        </Text>
                    </Text>

                    <View style={styles.profileCircle}>
                        <Text>👤</Text>
                    </View>

                </View>

                {/* ================= PROGRESS ================= */}

                <View style={styles.progressRow}>

                    <Text style={styles.pageTitle}>
                        Add Evidence
                    </Text>

                    <View style={styles.progressBadge}>
                        <Text style={styles.progressText}>
                            1 / 4
                        </Text>
                    </View>

                </View>

                <View style={styles.divider} />

                {/* ================= CONTENT ================= */}

                <View style={styles.content}>

                    <Text style={styles.sectionTitle}>
                        Show us the problem
                    </Text>

                    <Text style={styles.description}>
                        Photos and videos help the appropriate team
                        verify the challenge faster and deploy the
                        right resources.
                    </Text>

                    {/* ================= CAMERA OPTIONS ================= */}

                    <View style={styles.optionsRow}>

                        {/* PHOTO */}

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                styles.photoButton,
                            ]}
                            onPress={handleTakePhoto}
                            activeOpacity={0.8}
                            disabled={loading}
                        >

                            <Text style={styles.photoIcon}>
                                📷
                            </Text>

                            <Text style={styles.photoText}>
                                Take Photo
                            </Text>

                        </TouchableOpacity>

                        {/* VIDEO */}

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                styles.videoButton,
                            ]}
                            onPress={handleRecordVideo}
                            activeOpacity={0.8}
                            disabled={loading}
                        >

                            <Text style={styles.videoIcon}>
                                🎥
                            </Text>

                            <Text style={styles.videoText}>
                                Record Video
                            </Text>

                        </TouchableOpacity>

                    </View>

                    {/* ================= EVIDENCE ================= */}

                    {evidence.length > 0 && (
                        <View style={styles.uploadedSection}>

                            <Text style={styles.uploadedTitle}>
                                UPLOADED EVIDENCE ({evidence.length})
                            </Text>

                            {evidence.map((item, index) => (

                                <View
                                    key={`${item.uri}-${index}`}
                                    style={styles.evidenceCard}
                                >

                                    {/* IMAGE */}

                                    {item.type === "image" ? (

                                        <Image
                                            source={{ uri: item.uri }}
                                            style={styles.evidenceImage}
                                        />

                                    ) : (

                                        <View style={styles.videoPreview}>
                                            <Text style={styles.videoPreviewIcon}>
                                                ▶
                                            </Text>
                                        </View>

                                    )}

                                    {/* FILE INFO */}

                                    <View style={styles.fileInfo}>

                                        <Text
                                            style={styles.fileName}
                                            numberOfLines={1}
                                        >
                                            {item.name}
                                        </Text>

                                        <Text style={styles.fileMeta}>
                                            {item.type === "image"
                                                ? "Photo"
                                                : "Video"}{" "}
                                            • Just now
                                        </Text>

                                    </View>

                                    {/* DELETE */}

                                    <View style={styles.actionButtons}>

                                        <TouchableOpacity
                                            onPress={() => removeEvidence(index)}
                                            style={styles.actionButton}
                                        >
                                            <Text style={styles.deleteText}>🗑</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handlePreview(item)}
                                            style={styles.actionButton}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.eyeText}>◉</Text>
                                        </TouchableOpacity>

                                    </View>

                                </View>

                            ))}

                        </View>
                    )}

                </View>

                {/* ================= BOTTOM ================= */}

                <View style={styles.bottomContainer}>

                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            evidence.length === 0 &&
                            styles.continueDisabled,
                        ]}
                        onPress={handleContinue}
                        disabled={loading}
                        activeOpacity={0.8}
                    >

                        {loading ? (

                            <ActivityIndicator
                                color="#FFFFFF"
                            />

                        ) : (

                            <Text style={styles.continueText}>
                                Continue →
                            </Text>

                        )}

                    </TouchableOpacity>

                </View>

                {/* ================= NAVIGATION ================= */}

                <View style={styles.bottomNav}>

                    <View style={styles.navItem}>
                        <Text style={styles.navIcon}>
                            ⌂
                        </Text>
                        <Text style={styles.navText}>
                            Home
                        </Text>
                    </View>

                    <View style={styles.navItem}>
                        <Text style={styles.navIcon}>
                            ◉
                        </Text>
                        <Text style={styles.navText}>
                            Nearby
                        </Text>
                    </View>

                    <View style={styles.navItem}>

                        <View style={styles.reportCircle}>
                            <Text style={styles.plus}>
                                +
                            </Text>
                        </View>

                        <Text style={styles.reportText}>
                            Report
                        </Text>

                    </View>

                    <View style={styles.navItem}>
                        <Text style={styles.navIcon}>
                            □
                        </Text>
                        <Text style={styles.navText}>
                            Issues
                        </Text>
                    </View>

                    <View style={styles.navItem}>
                        <Text style={styles.navIcon}>
                            ♙
                        </Text>
                        <Text style={styles.navText}>
                            Profile
                        </Text>
                    </View>

                </View>

                {/* ================= EVIDENCE PREVIEW ================= */}

                <Modal
                    visible={previewItem !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setPreviewItem(null)}
                >
                    <View style={styles.previewOverlay}>

                        {/* CLOSE */}
                        <Pressable
                            style={styles.previewCloseArea}
                            onPress={() => setPreviewItem(null)}
                        >
                            <Text style={styles.previewClose}>
                                ✕
                            </Text>
                        </Pressable>

                        {/* IMAGE PREVIEW */}

                        {previewItem?.type === "image" && (
                            <Image
                                source={{
                                    uri: previewItem.uri,
                                }}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        )}

                        {/* VIDEO PREVIEW */}

                        {previewItem?.type === "video" && (
                            <View style={styles.videoPreviewLarge}>
                                <Text style={styles.videoPlayLarge}>
                                    ▶
                                </Text>

                                <Text style={styles.videoPreviewText}>
                                    Video Preview
                                </Text>
                            </View>
                        )}

                        {/* FILE NAME */}

                        {previewItem && (
                            <Text
                                style={styles.previewFileName}
                                numberOfLines={1}
                            >
                                {previewItem.name}
                            </Text>
                        )}

                    </View>
                </Modal>

            </View>

        </SafeAreaView>
    );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    actionButtons: {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 5,
    },

    actionButton: {
        width: 30,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },

    eyeText: {
        fontSize: 28,
        color: "#604C43",
    },

    deleteText: {
        fontSize: 16,
        color: "#604C43",
    },

    /* ================= PREVIEW ================= */

    previewOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    previewCloseArea: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },

    previewClose: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "500",
    },

    previewImage: {
        width: "100%",
        height: "75%",
    },

    previewFileName: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 15,
        maxWidth: "90%",
    },

    videoPreviewLarge: {
        width: "100%",
        height: 250,
        borderRadius: 15,
        backgroundColor: "#1E1E1E",
        alignItems: "center",
        justifyContent: "center",
    },

    videoPlayLarge: {
        color: "#FFFFFF",
        fontSize: 45,
    },

    videoPreviewText: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 10,
    },

    /* ================= HEADER ================= */

    header: {
        height: 53,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E6E6E6",
        marginTop: 39
    },

    backButton: {
        width: 46,
        height: 46,
        alignItems: "flex-start",
        justifyContent: "center",
    },

    backText: {
        fontSize: 25,
        color: "#B84E3E",
    },

    logo: {
        fontSize: 22,
        fontWeight: "800",
    },

    logoJan: {
        color: "#F76B57",
    },

    logoDrishti: {
        color: "#2937D8",
    },

    profileCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    /* ================= TITLE ================= */

    progressRow: {
        height: 47,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#29263D",
    },

    progressBadge: {
        backgroundColor: "#F0F0FF",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    progressText: {
        color: "#2937D8",
        fontSize: 10,
        fontWeight: "700",
    },

    divider: {
        height: 1,
        backgroundColor: "#E4E4E4",
        marginHorizontal: 12,
    },

    /* ================= CONTENT ================= */

    content: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 18,
    },

    sectionTitle: {
        marginTop: 23,
        fontSize: 21,
        fontWeight: "700",
        color: "#29263D",
    },

    description: {
        fontSize: 12,
        lineHeight: 17,
        color: "#604C43",
        marginTop: 6,
        marginBottom: 16,
    },

    /* ================= OPTIONS ================= */

    optionsRow: {
        flexDirection: "row",
        gap: 13,
    },

    optionButton: {
        flex: 1,
        height: 145,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },

    photoButton: {
        backgroundColor: "#4A4FFF",
    },

    videoButton: {
        backgroundColor: "#E8E9FF",
        borderWidth: 1,
        borderColor: "#E5B8B1",
    },

    photoIcon: {
        fontSize: 25,
        marginBottom: 5,
    },

    videoIcon: {
        fontSize: 25,
        marginBottom: 5,
    },

    photoText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },

    videoText: {
        color: "#29263D",
        fontSize: 11,
        fontWeight: "700",
    },

    /* ================= UPLOADED ================= */

    uploadedSection: {
        marginTop: 27,
    },

    uploadedTitle: {
        fontSize: 13,
        color: "#604C43",
        fontWeight: "500",
        marginBottom: 10,
    },

    evidenceCard: {
        height: 97,
        backgroundColor: "#FFFFFF",
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "#E5CFCB",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        marginBottom: 8,
    },

    evidenceImage: {
        width: 62,
        height: 62,
        borderRadius: 7,
        backgroundColor: "#EEEEEE",
    },

    videoPreview: {
        width: 62,
        height: 62,
        borderRadius: 7,
        backgroundColor: "#E8E9FF",
        alignItems: "center",
        justifyContent: "center",
    },

    videoPreviewIcon: {
        fontSize: 24,
        color: "#2937D8",
    },

    fileInfo: {
        flex: 1,
        marginLeft: 9,
    },

    fileName: {
        fontSize: 11,
        fontWeight: "700",
        color: "#29263D",
    },

    fileMeta: {
        fontSize: 9,
        color: "#777777",
        marginTop: 3,
    },

    deleteButton: {
        width: 35,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
    },

    deleteText: {
        fontSize: 16,
        color: "#604C43",
    },

    /* ================= BOTTOM ================= */

    bottomContainer: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#F8FAFC",
    },

    continueButton: {
        height: 44,
        borderRadius: 24,
        backgroundColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    continueDisabled: {
        opacity: 0.55,
    },

    continueText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    /* ================= NAV ================= */

    bottomNav: {
        height: 62,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#DCDCDC",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },

    navItem: {
        width: 58,
        height: 58,
        alignItems: "center",
        justifyContent: "center",
    },

    navIcon: {
        fontSize: 18,
        color: "#604C43",
        marginBottom: 2,
    },

    navText: {
        fontSize: 9,
        color: "#604C43",
    },

    reportCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#F76B57",
        alignItems: "center",
        justifyContent: "center",
    },

    plus: {
        color: "#FFFFFF",
        fontSize: 22,
        lineHeight: 24,
    },

    reportText: {
        fontSize: 9,
        color: "#F76B57",
        fontWeight: "700",
        marginTop: 2,
    },

});