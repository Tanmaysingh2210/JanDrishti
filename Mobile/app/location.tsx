import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";

import { useRouter } from "expo-router";

export default function Location() {
  const router = useRouter();

  const handleAllowLocation = () => {
    console.log("Allow location clicked");

    // Location permission will be added here.
  };

  const handleMaybeLater = () => {
    // For now continue to the app.
    console.log("Maybe later clicked");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>

        {/* ================= TOP ================= */}

        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>


        {/* ================= MAIN ================= */}

        <View style={styles.content}>

          {/* LOCATION IMAGE */}

          <Image
            source={require("../assets/location.png")}
            style={styles.locationImage}
            resizeMode="contain"
          />


          {/* TITLE */}

          <Text style={styles.title}>
            Help Us Locate Issues{"\n"}
            Automatically.
          </Text>


          {/* DESCRIPTION */}

          <Text style={styles.description}>
            Allowing location access helps{"\n"}
            NagarDrishti identify exactly where a civic{"\n"}
            issue is reported, ensuring faster{"\n"}
            resolution by the right department.
          </Text>

        </View>


        {/* ================= BOTTOM ================= */}

        <View style={styles.bottomContainer}>

          {/* ALLOW LOCATION */}

          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllowLocation}
            activeOpacity={0.8}
          >
            <Text style={styles.locationIcon}>
              ●
            </Text>

            <Text style={styles.allowText}>
              Allow Location Access
            </Text>
          </TouchableOpacity>


          {/* MAYBE LATER */}

          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleMaybeLater}
            activeOpacity={0.8}
          >
            <Text style={styles.laterText}>
              Maybe Later
            </Text>
          </TouchableOpacity>

        </View>

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
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* ================= TOP ================= */

  topBar: {
    height: 55,
    paddingHorizontal: 22,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  skipText: {
    color: "#F76B57",
    fontSize: 16,
    fontWeight: "500",
  },

  /* ================= CONTENT ================= */

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
  },

  /* ================= IMAGE ================= */

  locationImage: {
    width: 195,
    height: 195,
    marginTop: 58,
  },

  /* ================= TITLE ================= */

  title: {
    textAlign: "center",
    color: "#202326",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "700",
    marginTop: 25,
  },

  /* ================= DESCRIPTION ================= */

  description: {
    textAlign: "center",
    color: "#654C43",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    marginTop: 20,
  },

  /* ================= BOTTOM ================= */

  bottomContainer: {
    backgroundColor: "#FFFDFB",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 38,
  },

  /* ================= ALLOW ================= */

  allowButton: {
    height: 60,
    width: "100%",
    borderRadius: 15,
    backgroundColor: "#F86A5A",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  locationIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    marginRight: 8,
  },

  allowText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  /* ================= LATER ================= */

  laterButton: {
    height: 62,
    width: "100%",
    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F76B57",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 15,
  },

  laterText: {
    color: "#F76B57",
    fontSize: 19,
    fontWeight: "600",
  },
});