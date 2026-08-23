import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ReportLocationScreen() {

    const router = useRouter();

    const {
        evidence,
        category,
        categoryLabel,
        title,
        description,
    } = useLocalSearchParams();

    const [location, setLocation] =
        useState<Location.LocationObject | null>(null);

    const [address, setAddress] =
        useState("Getting your location...");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        try {

            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Location Required",
                    "Location permission is required to report the issue."
                );

                return;
            }

            const current =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            setLocation(current);

            try {
                const result =
                    await Location.reverseGeocodeAsync({
                        latitude: current.coords.latitude,
                        longitude: current.coords.longitude,
                    });

                if (result.length > 0) {

                    const place = result[0];

                    const parts = [
                        place.name,
                        place.street,
                        place.district,
                        place.city,
                        place.region,
                    ].filter(Boolean);

                    setAddress(parts.join(", "));
                }

            } catch {
                setAddress("Current location");
            }

        } catch (error) {

            console.error("Report location error:", error);

            Alert.alert(
                "Location Error",
                "Unable to get your current location."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {

        if (!location) {
            Alert.alert(
                "Location Required",
                "Please wait until your location is detected."
            );

            return;
        }

        router.push({
            pathname: "/review",
            params: {
                evidence: evidence as string,
                category: category as string,
                categoryLabel: categoryLabel as string,
                title: title as string,
                description: description as string,

                latitude:
                    location.coords.latitude.toString(),

                longitude:
                    location.coords.longitude.toString(),

                address,
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

                {/* TITLE */}

                <View style={styles.titleRow}>

                    <Text style={styles.pageTitle}>
                        Location
                    </Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            4 / 4
                        </Text>
                    </View>

                </View>

                <View style={styles.divider} />

                <View style={styles.content}>

                    <Text style={styles.heading}>
                        Where is the problem?
                    </Text>

                    <Text style={styles.help}>
                        Your current location will be used for
                        this report.
                    </Text>

                    {/* MAP */}

                    <View style={styles.mapContainer}>

                        {location ? (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude:
                                        location.coords.latitude,
                                    longitude:
                                        location.coords.longitude,
                                    latitudeDelta: 0.008,
                                    longitudeDelta: 0.008,
                                }}
                            >

                                <Marker
                                    coordinate={{
                                        latitude:
                                            location.coords.latitude,
                                        longitude:
                                            location.coords.longitude,
                                    }}
                                    title="Issue Location"
                                    description={address}
                                />

                            </MapView>
                        ) : (
                            <View style={styles.loadingMap}>

                                {loading ? (
                                    <>
                                        <ActivityIndicator
                                            size="large"
                                            color="#2937D8"
                                        />

                                        <Text style={styles.loadingText}>
                                            Finding your location...
                                        </Text>
                                    </>
                                ) : (
                                    <Text>
                                        Location unavailable
                                    </Text>
                                )}

                            </View>
                        )}

                    </View>

                    {/* LOCATION INFO */}

                    {location && (
                        <View style={styles.locationCard}>

                            <Text style={styles.pin}>
                                📍
                            </Text>

                            <View style={styles.locationInfo}>

                                <Text style={styles.locationTitle}>
                                    Current Location
                                </Text>

                                <Text
                                    style={styles.address}
                                    numberOfLines={2}
                                >
                                    {address}
                                </Text>

                                <Text style={styles.coordinates}>
                                    {location.coords.latitude.toFixed(6)},
                                    {" "}
                                    {location.coords.longitude.toFixed(6)}
                                </Text>

                            </View>

                        </View>
                    )}

                </View>

                {/* CONTINUE */}

                <View style={styles.bottomContainer}>

                    <TouchableOpacity
                        style={[
                            styles.continue,
                            !location && styles.disabled,
                        ]}
                        disabled={!location}
                        onPress={handleContinue}
                    >

                        <Text style={styles.continueText}>
                            Continue →
                        </Text>

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

    titleRow: {
        height: 47,
        paddingHorizontal: 12,
        backgroundColor: "#FFFFFF",
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
        padding: 12,
        paddingTop: 18,
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        color: "#29263D",
    },

    help: {
        fontSize: 12,
        color: "#604C43",
        marginTop: 5,
        marginBottom: 12,
    },

    mapContainer: {
        height: 390,
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E0D6D3",
    },

    map: {
        flex: 1,
    },

    loadingMap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEEEEE",
    },

    loadingText: {
        marginTop: 10,
        color: "#604C43",
    },

    locationCard: {
        marginTop: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#E5D4D0",
    },

    pin: {
        fontSize: 25,
        marginRight: 10,
    },

    locationInfo: {
        flex: 1,
    },

    locationTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#29263D",
    },

    address: {
        fontSize: 11,
        color: "#604C43",
        marginTop: 3,
    },

    coordinates: {
        fontSize: 9,
        color: "#999",
        marginTop: 4,
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