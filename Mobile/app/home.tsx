import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";

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
} from "react-native";

import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

import { API_URL } from "../constants/api";

export default function HomeScreen() {
    const router = useRouter();

    const [citizenName, setCitizenName] = useState("Citizen");
    const [city, setCity] = useState("Your Location");
    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    // ==========================================
    // LOAD CITIZEN + LOCATION
    // ==========================================

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        try {
            // --------------------------------------
            // Get token
            // --------------------------------------

            const token = await SecureStore.getItemAsync(
                "citizen_token"
            );

            if (!token) {
                router.replace("/login");
                return;
            }

            // --------------------------------------
            // Get logged-in citizen
            // --------------------------------------

            const response = await fetch(
                `${API_URL}/api/citizen/auth/me`,
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data.citizen) {
                setCitizenName(
                    data.citizen.fullName || "Citizen"
                );
            }

            // --------------------------------------
            // Get current location
            // --------------------------------------

            const location =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

            const userLatitude = location.coords.latitude;
            const userLongitude = location.coords.longitude;

            setLatitude(userLatitude);
            setLongitude(userLongitude);
            // --------------------------------------
            // Convert coordinates to city
            // --------------------------------------

            const places =
                await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

            if (places.length > 0) {
                const place = places[0];

                const locationName =
                    place.city ||
                    place.district ||
                    place.subregion ||
                    place.region ||
                    "Your Location";

                setCity(locationName);
            }

        } catch (error) {
            console.log(
                "Home loading error:",
                error
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // REPORT ISSUE
    // ==========================================

    const handleReportIssue = () => {
        console.log("Report issue");

        // Later:
        // router.push("/report");
    };

    // ==========================================
    // VIEW NEARBY
    // ==========================================

    const handleViewNearby = () => {
        console.log("View nearby");

        // Later:
        // router.push("/nearby");
    };

    // ==========================================
    // VIEW STATUS
    // ==========================================

    const handleViewStatus = () => {
        console.log("View status");

        // Later:
        // router.push("/issue/123");
    };

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <View style={styles.header}>

                    <View>
                        <Text style={styles.greeting}>
                            Good evening, {citizenName}
                        </Text>

                        <View style={styles.locationRow}>

                            <Text style={styles.locationPin}>
                                ●
                            </Text>

                            <Text style={styles.locationText}>
                                {loading ? "Locating..." : city}
                            </Text>

                            <Text style={styles.locationArrow}>
                                ▾
                            </Text>

                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.notificationIcon}>
                            🔔
                        </Text>

                        <View style={styles.notificationDot} />
                    </TouchableOpacity>

                </View>


                {/* ================================= */}
                {/* REPORT CARD */}
                {/* ================================= */}

                <View style={styles.reportCard}>

                    <Text style={styles.reportSmallText}>
                        SEE A PROBLEM?
                    </Text>

                    <Text style={styles.reportTitle}>
                        Report it to Jan-Drishti
                    </Text>

                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => router.push("/evidence" as any)}
                        activeOpacity={0.8}
                    >

                        <Text style={styles.reportButtonIcon}>
                            ⚒
                        </Text>

                        <Text style={styles.reportButtonText}>
                            REPORT ISSUE
                        </Text>

                    </TouchableOpacity>

                </View>


                {/* ================================= */}
                {/* NEARBY MAP */}
                {/* ================================= */}

                <View style={styles.mapCard}>

                    {latitude !== null && longitude !== null ? (

                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: latitude,
                                longitude: longitude,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.015,
                            }}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                        >

                            <Marker
                                coordinate={{
                                    latitude: latitude,
                                    longitude: longitude,
                                }}
                                title="You are here"
                                description={city}
                            />

                        </MapView>

                    ) : (

                        <View style={styles.mapLoading}>
                            <Text style={styles.mapLoadingText}>
                                Locating you...
                            </Text>
                        </View>

                    )}

                    {/* TOP LABEL */}

                    <View style={styles.mapLabel}>

                        <Text style={styles.mapLabelText}>
                            📍 24 Challenges Nearby
                        </Text>

                    </View>


                    {/* VIEW NEARBY */}

                    <TouchableOpacity
                        style={styles.nearbyButton}
                        onPress={handleViewNearby}
                        activeOpacity={0.8}
                    >

                        <Text style={styles.nearbyButtonText}>
                            VIEW NEARBY
                        </Text>

                    </TouchableOpacity>

                </View>

                {/* ================================= */}
                {/* COMMUNITY IMPACT */}
                {/* ================================= */}

                <View style={styles.sectionHeader}>

                    <Text style={styles.sectionTitle}>
                        Community Impact
                    </Text>

                </View>

                <View style={styles.impactCard}>

                    {/* Reported */}

                    <View style={styles.impactRow}>

                        <View style={styles.impactLeft}>

                            <Text style={styles.impactIcon}>
                                ⊙
                            </Text>

                            <Text style={styles.impactLabel}>
                                Reported
                            </Text>

                        </View>

                        <Text style={styles.impactValue}>
                            1,284
                        </Text>

                    </View>


                    {/* Resolved */}

                    <View style={styles.impactRow}>

                        <View style={styles.impactLeft}>

                            <Text style={styles.impactIconBlue}>
                                ◉
                            </Text>

                            <Text style={styles.impactLabel}>
                                Resolved
                            </Text>

                        </View>

                        <Text style={styles.impactValue}>
                            126
                        </Text>

                    </View>


                    {/* Solutions */}

                    <View style={styles.impactRow}>

                        <View style={styles.impactLeft}>

                            <Text style={styles.impactIconPurple}>
                                ◉
                            </Text>

                            <Text style={styles.impactLabel}>
                                Solutions
                            </Text>

                        </View>

                        <Text style={styles.impactValue}>
                            38
                        </Text>

                    </View>

                </View>


                {/* ================================= */}
                {/* MY CHALLENGES */}
                {/* ================================= */}

                <View style={styles.sectionHeader}>

                    <Text style={styles.sectionTitle}>
                        My Challenges
                    </Text>

                </View>

                <View style={styles.challengeCard}>

                    <View style={styles.challengeTop}>

                        <View>

                            <Text style={styles.challengeTitle}>
                                Broken Handpump
                            </Text>

                            <Text style={styles.challengeId}>
                                #JD-2026-00128
                            </Text>

                        </View>

                        <View style={styles.statusBadge}>

                            <Text style={styles.statusText}>
                                UNDER REVIEW
                            </Text>

                        </View>

                    </View>


                    {/* Progress */}

                    <View style={styles.progressHeader}>

                        <Text style={styles.progressLabel}>
                            Progress
                        </Text>

                        <Text style={styles.progressPercent}>
                            60%
                        </Text>

                    </View>

                    <View style={styles.progressBackground}>

                        <View
                            style={[
                                styles.progressBar,
                                {
                                    width: "60%",
                                },
                            ]}
                        />

                    </View>


                    {/* Deadline */}

                    <View style={styles.challengeBottom}>

                        <Text style={styles.deadlineText}>
                            Deadline
                        </Text>

                        <Text style={styles.deadlineDate}>
                            28 Aug 2026
                        </Text>

                    </View>


                    <TouchableOpacity
                        onPress={handleViewStatus}
                        activeOpacity={0.7}
                    >

                        <Text style={styles.viewStatus}>
                            VIEW STATUS →
                        </Text>

                    </TouchableOpacity>

                </View>

            </ScrollView>


            {/* ================================= */}
            {/* BOTTOM NAVIGATION */}
            {/* ================================= */}

            <View style={styles.bottomNavigation}>

                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                >

                    <Text style={styles.navIcon}>
                        ⌂
                    </Text>

                    <Text style={styles.navTextActive}>
                        Home
                    </Text>

                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                >

                    <Text style={styles.navIcon}>
                        ◉
                    </Text>

                    <Text style={styles.navText}>
                        Nearby
                    </Text>

                </TouchableOpacity>


                {/* REPORT */}

                <TouchableOpacity
                    style={styles.reportNavItem}
                    onPress={handleReportIssue}
                    activeOpacity={0.8}
                >

                    <View style={styles.reportCircle}>

                        <Text style={styles.reportPlus}>
                            +
                        </Text>

                    </View>

                    <Text style={styles.reportNavText}>
                        Report
                    </Text>

                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                >

                    <Text style={styles.navIcon}>
                        ▣
                    </Text>

                    <Text style={styles.navText}>
                        Issues
                    </Text>

                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                >

                    <Text style={styles.navIcon}>
                        ♙
                    </Text>

                    <Text style={styles.navText}>
                        Profile
                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
}


/* ================================================= */
/* STYLES */
/* ================================================= */

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#F7F9FC",
    },

    container: {
        flex: 1,
        backgroundColor: "#F7F9FC",
    },

    scrollContent: {
        paddingHorizontal: 17,
        paddingBottom: 25,
    },


    /* ================= HEADER ================= */

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingTop: 18,
        paddingBottom: 14,
        marginTop:27,
    },

    greeting: {
        fontSize: 18,
        lineHeight: 23,
        fontWeight: "700",
        color: "#202124",
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },

    locationPin: {
        color: "#F76B57",
        fontSize: 9,
        marginRight: 6,
    },

    locationText: {
        fontSize: 12,
        color: "#604C43",
        fontWeight: "500",
    },

    locationArrow: {
        fontSize: 10,
        color: "#604C43",
        marginLeft: 3,
    },

    notificationButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    notificationIcon: {
        fontSize: 18,
    },

    notificationDot: {
        position: "absolute",
        right: 7,
        top: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#F76B57",
    },
    /* ================= REPORT ================= */

    reportCard: {
        backgroundColor: "#F76B57",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 29,
        marginBottom: 14,
    },

    reportSmallText: {
        color: "#FFFFFF",
        fontSize: 10,
        letterSpacing: 0.8,
        fontWeight: "600",
    },

    reportTitle: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        marginTop: 5,
        marginBottom: 12,
    },

    reportButton: {
        height: 40,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },

    reportButtonIcon: {
        fontSize: 13,
        color: "#F76B57",
        marginRight: 6,
    },

    reportButtonText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#F76B57",
    },

    /* ================= MAP ================= */

    mapCard: {
        height: 187,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#E7EBEF",
        position: "relative",
        marginBottom: 18,
    },

    map: {
        width: "100%",
        height: "100%",
    },

    mapLoading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E7EBEF",
    },

    mapLoadingText: {
        fontSize: 12,
        color: "#666666",
    },

   mapLabel: {
  position: "absolute",
  left: 10,
  top: 10,
  backgroundColor: "#FFFFFF",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 7,

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.12,
  shadowRadius: 3,
  elevation: 2,
},

mapLabelText: {
  fontSize: 10,
  fontWeight: "600",
  color: "#29263D",
},

nearbyButton: {
  position: "absolute",
  right: 12,
  bottom: 12,
  backgroundColor: "#B84E3E",
  paddingHorizontal: 15,
  paddingVertical: 9,
  borderRadius: 20,
},

nearbyButtonText: {
  color: "#FFFFFF",
  fontSize: 9,
  fontWeight: "700",
},

    /* ================= SECTION ================= */

   sectionHeader: {
  marginBottom: 9,
},

sectionTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#29263D",
},


    /* ================= IMPACT ================= */

    impactCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E3DFE5",
  paddingHorizontal: 14,
  paddingVertical: 9,
  marginBottom: 22,

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.04,
  shadowRadius: 5,
  elevation: 1,
},

impactRow: {
  height: 30,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

impactLeft: {
  flexDirection: "row",
  alignItems: "center",
},

impactIcon: {
  color: "#F76B57",
  fontSize: 12,
  marginRight: 8,
},

impactIconBlue: {
  color: "#2937D8",
  fontSize: 12,
  marginRight: 8,
},

impactIconPurple: {
  color: "#7652C7",
  fontSize: 12,
  marginRight: 8,
},

impactLabel: {
  fontSize: 12,
  color: "#604C43",
},

impactValue: {
  fontSize: 16,
  fontWeight: "700",
  color: "#29263D",
},

    /* ================= CHALLENGE ================= */

   challengeCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 13,
  borderWidth: 1,
  borderColor: "#E3DFE5",
  padding: 14,
  marginBottom: 20,

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.04,
  shadowRadius: 5,
  elevation: 1,
},

challengeTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#29263D",
},

challengeId: {
  fontSize: 10,
  color: "#888888",
  marginTop: 3,
},

statusBadge: {
  backgroundColor: "#EEEFFF",
  borderRadius: 5,
  paddingHorizontal: 9,
  paddingVertical: 6,
},

statusText: {
  fontSize: 8,
  color: "#5558B8",
  fontWeight: "700",
},
progressHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 18,
  marginBottom: 6,
},

progressLabel: {
  fontSize: 11,
  color: "#777777",
},

progressPercent: {
  fontSize: 11,
  color: "#777777",
},

progressBackground: {
  width: "100%",
  height: 6,
  backgroundColor: "#E7E7E7",
  borderRadius: 4,
  overflow: "hidden",
},

progressBar: {
  height: 6,
  backgroundColor: "#B84E3E",
  borderRadius: 4,
},


   challengeBottom: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 18,
},

deadlineText: {
  fontSize: 11,
  color: "#777777",
},

deadlineDate: {
  fontSize: 11,
  fontWeight: "600",
  color: "#555555",
},

viewStatus: {
  textAlign: "right",
  marginTop: 14,
  color: "#F76B57",
  fontSize: 10,
  fontWeight: "700",
},
    /* ================= BOTTOM NAV ================= */

   bottomNavigation: {
  height: 72,
  backgroundColor: "#FFFFFF",
  borderTopWidth: 1,
  borderTopColor: "#E1E1E1",
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingHorizontal: 4,
},

navItem: {
  width: 60,
  height: 58,
  alignItems: "center",
  justifyContent: "center",
},

navIcon: {
  fontSize: 24,
  color: "#666666",
  marginBottom: 0,
},

navText: {
  fontSize: 10,
  color: "#666666",
},

navTextActive: {
  fontSize: 10,
  color: "#F76B57",
  fontWeight: "600",
},

reportNavItem: {
  width: 65,
  height: 70,
  alignItems: "center",
  justifyContent: "center",
},

reportCircle: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: "#F76B57",
  alignItems: "center",
  justifyContent: "center",
  marginTop: -25,

  shadowColor: "#F76B57",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.25,
  shadowRadius: 7,
  elevation: 5,
},

reportPlus: {
  color: "#FFFFFF",
  fontSize: 32,
  fontWeight: "400",
  lineHeight: 34,
},

reportNavText: {
  color: "#F76B57",
  fontSize: 10,
  fontWeight: "600",
  marginTop: 2,
},

});