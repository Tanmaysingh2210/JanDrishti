import React, { useState } from "react";
import { API_URL } from "../constants/api";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";

import * as SecureStore from "expo-secure-store";

export default function Login() {
  const router = useRouter();

  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!emailOrMobile.trim()) {
      alert("Enter your email or Mobile number");
      return;
    }

    if (!password) {
      alert("Enter your password");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/citizen/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier: emailOrMobile.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // =========================
      // SAVE JWT SECURELY
      // =========================

      await SecureStore.setItemAsync(
        "citizen_token",
        data.token
      );

      // =========================
      // GO TO LOCATION PAGE
      // =========================

      router.replace("/location");

    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Unable to connect to server. Please check your connection."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7FAFD"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ================= SKIP ================= */}

          {/* <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.replace("/")}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>
          </View> */}


          {/* ================= LOGO ================= */}

          <View style={styles.logoContainer}>

            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>
                ▥
              </Text>
            </View>

            <Text style={styles.logoText}>
              <Text style={styles.logoCoral}>
                Nagar
              </Text>
              <Text style={styles.logoBlue}>
                Drishti
              </Text>
            </Text>

          </View>


          {/* ================= WELCOME ================= */}

          <View style={styles.welcomeContainer}>

            <Text style={styles.welcomeTitle}>
              Welcome Back 👋
            </Text>

            <Text style={styles.welcomeDescription}>
              Your city is waiting for your voice. Let's{"\n"}
              keep improving together.
            </Text>

          </View>


          {/* ================= LOGIN CARD ================= */}

          <View style={styles.loginCard}>

            {/* MOBILE / EMAIL LABEL */}

            <Text style={styles.inputLabel}>
              Mobile Number or Email
            </Text>

            {/* MOBILE / EMAIL INPUT */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ♙
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter yours"
                placeholderTextColor="#777777"
                value={emailOrMobile}
                onChangeText={setEmailOrMobile}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

            </View>


            {/* PASSWORD LABEL */}

            <Text style={styles.passwordLabel}>
              Password
            </Text>

            {/* PASSWORD INPUT */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ▣
              </Text>

              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#777777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? "◉" : "◌"}
                </Text>
              </TouchableOpacity>

            </View>


            {/* FORGOT PASSWORD */}

            <TouchableOpacity
              style={styles.forgotButton}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>


            {/* LOGIN BUTTON */}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                Login →
              </Text>
            </TouchableOpacity>

          </View>


          {/* ================= SIGN UP ================= */}

          <View style={styles.signupContainer}>

            <Text style={styles.signupText}>
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>
                Sign Up
              </Text>
            </TouchableOpacity>

          </View>


          {/* ================= SECURITY ================= */}

          <View style={styles.securityBadge}>

            <Text style={styles.securityIcon}>
              ♧
            </Text>

            <Text style={styles.securityText}>
              Secure & Private
            </Text>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFD",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 35,
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

  /* ================= LOGO ================= */

  logoContainer: {
    alignItems: "center",
    marginTop: 70,
  },

  logoCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#F76B57",
    alignItems: "center",
    justifyContent: "center",
  },

  logoIcon: {
    color: "#4B413D",
    fontSize: 31,
    fontWeight: "700",
  },

  logoText: {
    marginTop: 17,
    fontSize: 23,
    fontWeight: "700",
  },

  logoCoral: {
    color: "#F76B57",
  },

  logoBlue: {
    color: "#2937D8",
  },

  /* ================= WELCOME ================= */

  welcomeContainer: {
    alignItems: "center",
    marginTop: 27,
  },

  welcomeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: "#1E2225",
  },

  welcomeDescription: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#654C43",
  },

  /* ================= LOGIN CARD ================= */

  loginCard: {
    width: "90%",
    alignSelf: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 11,

    marginTop: 25,

    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 19,

    borderWidth: 1,
    borderColor: "#E3E3E3",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,

    elevation: 3,
  },

  /* ================= LABELS ================= */

  inputLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#654C43",
    marginBottom: 5,
    letterSpacing: 0.2,
  },

  passwordLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#654C43",
    marginTop: 17,
    marginBottom: 5,
    letterSpacing: 0.2,
  },

  /* ================= INPUT ================= */

  inputContainer: {
    width: "100%",
    height: 49,

    backgroundColor: "#F0F1F3",

    borderRadius: 9,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
  },

  inputIcon: {
    width: 27,
    fontSize: 20,
    color: "#665851",
    textAlign: "center",
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#333333",
  },

  eyeButton: {
    width: 32,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  eyeIcon: {
    fontSize: 22,
    color: "#665851",
  },

  /* ================= FORGOT ================= */

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 17,
  },

  forgotText: {
    color: "#0062BD",
    fontSize: 13,
    fontWeight: "600",
  },

  /* ================= LOGIN BUTTON ================= */

  loginButton: {
    width: "100%",
    height: 60,

    marginTop: 24,

    borderRadius: 13,

    backgroundColor: "#F86A5A",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#F86A5A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.20,
    shadowRadius: 6,

    elevation: 3,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  /* ================= SIGNUP ================= */

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 27,
  },

  signupText: {
    color: "#654C43",
    fontSize: 14,
  },

  signupLink: {
    color: "#C75B4D",
    fontSize: 14,
    fontWeight: "500",
  },

  /* ================= SECURITY ================= */

  securityBadge: {
    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F2F3F5",

    borderRadius: 15,

    paddingHorizontal: 12,
    paddingVertical: 5,

    marginTop: 58,
  },

  securityIcon: {
    color: "#8C817B",
    fontSize: 12,
    marginRight: 4,
  },

  securityText: {
    color: "#8C817B",
    fontSize: 10.5,
  },
});