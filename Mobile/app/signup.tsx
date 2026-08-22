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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreed, setAgreed] = useState(false);

  const handleCreateAccount = async () => {
    if (!fullName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (mobile.length !== 10) {
      alert("Please enter a valid 10 digit mobile number");
      return;
    }

    if (aadhaar.length !== 12) {
      alert("Please enter a valid 12 digit Aadhaar number");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!agreed) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/citizen/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: fullName.trim(),
            mobileNumber: mobile,
            aadhaarNumber: aadhaar,
            email: email.trim(),
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      console.log("Registration successful");

      await SecureStore.setItemAsync(
        "citizen_token",
        data.token
      );

      alert("Account created successfully!");

      router.replace("/location");

    } catch (error) {
      console.error("Registration error:", error);

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
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ================= HEADER ================= */}

          <View style={styles.header}>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Create Account
            </Text>

            <View style={styles.headerSpacer} />

          </View>


          {/* ================= TITLE ================= */}

          <View style={styles.titleSection}>

            <Text style={styles.mainTitle}>
              <Text style={styles.blueText}>
                Join
              </Text>

              <Text style={styles.coralText}>
                {" "}NagarDrishti
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Make your voice count in seconds.
            </Text>

          </View>


          {/* ================= FORM ================= */}

          <View style={styles.formContainer}>

            {/* FULL NAME */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ♙
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9B9B9B"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

            </View>


            {/* MOBILE */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ☎
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#9B9B9B"
                value={mobile}
                onChangeText={(text) =>
                  setMobile(
                    text.replace(/[^0-9]/g, "")
                  )
                }
                keyboardType="phone-pad"
                maxLength={10}
              />

            </View>


            {/* AADHAAR */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ▣
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Aadhaar Number"
                placeholderTextColor="#9B9B9B"
                value={aadhaar}
                onChangeText={(text) =>
                  setAadhaar(
                    text.replace(/[^0-9]/g, "")
                  )
                }
                keyboardType="number-pad"
                maxLength={12}
                secureTextEntry
              />

            </View>


            {/* EMAIL */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ✉
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#9B9B9B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

            </View>


            {/* PASSWORD */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ♙
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9B9B9B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? "◉" : "◌"}
                </Text>
              </TouchableOpacity>

            </View>


            {/* CONFIRM PASSWORD */}

            <View style={styles.inputContainer}>

              <Text style={styles.inputIcon}>
                ♙
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9B9B9B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? "◉" : "◌"}
                </Text>
              </TouchableOpacity>

            </View>


            {/* TERMS */}

            <View style={styles.termsRow}>

              <TouchableOpacity
                style={[
                  styles.checkbox,
                  agreed && styles.checkboxChecked,
                ]}
                onPress={() =>
                  setAgreed(!agreed)
                }
                activeOpacity={0.7}
              >
                {agreed && (
                  <Text style={styles.checkmark}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                I agree to the{" "}

                <Text style={styles.linkText}>
                  Terms of Service
                </Text>

                {" "}and{" "}

                <Text style={styles.linkText}>
                  Privacy
                </Text>

                {"\n"}

                <Text style={styles.linkText}>
                  Policy.
                </Text>
              </Text>

            </View>


            {/* CREATE ACCOUNT */}

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>
                Create Account →
              </Text>
            </TouchableOpacity>


            {/* SECURITY */}

            <View style={styles.securityContainer}>

              <Text style={styles.securityIcon}>
                ♙
              </Text>

              <Text style={styles.securityText}>
                Your data is encrypted and secure.
              </Text>

            </View>

          </View>


          {/* ================= LOGIN ================= */}

          <View style={styles.loginSection}>

            <Text style={styles.loginText}>
              Already have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginLink}>
                Login
              </Text>
            </TouchableOpacity>

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
    paddingBottom: 30,
  },

  /* ================= HEADER ================= */

  header: {
    height: 130,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  backButton: {
    width: 45,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  backArrow: {
    fontSize: 28,
    color: "#4A4A4A",
    fontWeight: "300",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#191919",
  },

  headerSpacer: {
    width: 45,
  },

  /* ================= TITLE ================= */

  titleSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 24,
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
  },

  blueText: {
    color: "#2937D8",
  },

  coralText: {
    color: "#F76B57",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#654C43",
  },

  /* ================= FORM ================= */

  formContainer: {
    width: "90%",
    alignSelf: "center",
  },

  inputContainer: {
    height: 60,
    width: "100%",
    backgroundColor: "#F0F2F4",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 11,
  },

  inputIcon: {
    width: 30,
    fontSize: 24,
    color: "#9A9A9A",
    textAlign: "center",
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    color: "#333333",
  },

  eyeButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  eyeIcon: {
    fontSize: 21,
    color: "#999999",
  },

  /* ================= TERMS ================= */

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 5,
    marginBottom: 20,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#777777",
    borderRadius: 3,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6
  },

  checkboxChecked: {
    backgroundColor: "#2937D8",
    borderColor: "#2937D8",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    color: "#444444",
  },

  linkText: {
    color: "#0059B8",
  },

  /* ================= CREATE ================= */

  createButton: {
    height: 61,
    width: "100%",
    borderRadius: 15,
    backgroundColor: "#FF685F",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#FF685F",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.20,
    shadowRadius: 7,

    elevation: 4,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  /* ================= SECURITY ================= */

  securityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  securityIcon: {
    color: "#777777",
    fontSize: 13,
    marginRight: 5,
  },

  securityText: {
    color: "#8A7D77",
    fontSize: 12.5,
    fontWeight: "500",
  },

  /* ================= LOGIN ================= */

  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 75,
  },

  loginText: {
    fontSize: 14,
    color: "#654C43",
  },

  loginLink: {
    fontSize: 16,
    color: "#0066C5",
    fontWeight: "500",
  },
});