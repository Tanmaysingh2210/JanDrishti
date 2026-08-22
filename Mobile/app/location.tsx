import React, { useState } from "react";
import { API_URL } from "../constants/api";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function LocationScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleAllowLocation = async () => {
    try {

      setLoading(true);

      // =====================================
      // 1. Request location permission
      // =====================================

      const {
        status,
      } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        Alert.alert(
          "Location Permission Required",
          "NagarDrishti needs your location to identify where a civic issue is reported.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );

        return;
      }

      // =====================================
      // 2. Get current location
      // =====================================

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude =
        location.coords.latitude;

      const longitude =
        location.coords.longitude;

      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      // =====================================
      // 3. Get JWT from SecureStore
      // =====================================

      const token =
        await SecureStore.getItemAsync(
          "citizen_token"
        );

      if (!token) {

        Alert.alert(
          "Session Error",
          "Your login session was not found. Please login again."
        );

        router.replace("/login");

        return;
      }

      // =====================================
      // 4. Send location to backend
      // =====================================

      const response = await fetch(
        `${API_URL}/api/citizen/location`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            latitude,
            longitude,
          }),
        }
      );

      const data =
        await response.json();

      // =====================================
      // 5. Backend response
      // =====================================

      if (!response.ok) {

        Alert.alert(
          "Location Error",
          data.message ||
          "Unable to save your location."
        );

        return;
      }

      console.log(
        "Location saved:",
        data.location
      );

      // =====================================
      // 6. Continue to app
      // =====================================

      router.replace("/");

    } catch (error) {

      console.error(
        "Location error:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong while getting your location."
      );

    } finally {

      setLoading(false);

    }
  };

  const handleMaybeLater = () => {
    router.replace("/");
  };

  const handleSkip = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>

        {/* SKIP */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* MAIN CONTENT */}
        <View style={styles.content}>

          {/* IMAGE */}
          <Image
            source={require("../assets/location.png")}
            style={styles.locationImage}
            resizeMode="contain"
          />

          {/* TITLE */}
          <Text style={styles.title}>
            Help Us Locate Issues{"\n"}Automatically.
          </Text>

          {/* DESCRIPTION */}
          <Text style={styles.description}>
            Allowing location access helps{"\n"}
            NagarDrishti identify exactly where a civic{"\n"}
            issue is reported, ensuring faster{"\n"}
            resolution by the right department.
          </Text>

        </View>

        {/* BOTTOM BUTTONS */}
        <View style={styles.bottomContainer}>

          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllowLocation}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.allowButtonText}>
                📍 Allow Location Access
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleMaybeLater}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.laterButtonText}>
              Maybe Later
            </Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  skipButton: {
    position: "absolute",
    top: 15,
    right: 20,
    zIndex: 10,
  },

  skipText: {
    color: "#F76B57",
    fontSize: 17,
    fontWeight: "500",
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 115,
  },

  locationImage: {
    width: 210,
    height: 210,
    marginBottom: 25,
  },

  title: {
    textAlign: "center",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 18,
  },

  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#604C43",
  },

  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },

  allowButton: {
    height: 60,
    borderRadius: 17,
    backgroundColor: "#F76B57",
    alignItems: "center",
    justifyContent: "center",
  },

  allowButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "600",
  },

  laterButton: {
    height: 60,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F76B57",
    alignItems: "center",
    justifyContent: "center",
  },

  laterButtonText: {
    color: "#F76B57",
    fontSize: 19,
    fontWeight: "600",
  },
});