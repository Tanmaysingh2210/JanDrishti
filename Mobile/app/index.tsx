import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    image: require("../assets/onboarding1.png"),
    title1: "Better Streets,",
    title2: "Better Cities.",
    title1Color: "#F76B57",
    title2Color: "#2937D8",

    description: "Report issues. Alert authorities.\nBuild a better community together.",

    bottomText:
      "Spot a pothole, overflowing bin, or broken\nstreetlight? Capture it and let NagarDrishti\ntake care of the rest.",
  },

  {
    image: require("../assets/onboarding2.png"),
    title1: "AI turns",
    title2: "Reports into Actions.",
    title1Color: "#2937D8",
    title2Color: "#F76B57",

    description:
      "NagarDrishti automatically understands your\nreports and routes them to the right\ndepartments.",

    features: [
      {
        icon: "✣",
        text: "AI Detection",
      },
      {
        icon: "!",
        text: "Smart Priority",
      },
      {
        icon: "⌁",
        text: "Intelligent Routing",
      },
    ],
  },

  {
    image: require("../assets/onboarding3.png"),
    title1: "One Problem.",
    title2: "One Powerful Voice",
    title1Color: "#F76B57",
    title2Color: "#2937D8",

    description:
      "We consolidate duplicate reports into a single\nactionable issue, making the community voice\nstronger.",

    features: [
      {
        icon: "✣",
        text: "AI Duplicate Detection",
      },
      {
        icon: "👍",
        text: "Community Upvotes",
      },
      {
        icon: "⌁",
        text: "Hotspot Detection",
      },
    ],
  },

  {
    image: require("../assets/onboarding4.png"),
    title1: "From Report to Resolution",
    title1Color: "#F76B57",

    description:
      "Track every step of your report in real-time and\nverify when the work is done.",
  },
];

export default function Index() {
    const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const current = onboardingData[currentPage];

  const goNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const skipOnboarding = () => {
    setCurrentPage(3);
  };


const handleCreateAccount = () => {
  router.push("/signup");
};

const handleLogin = () => {
  router.push("/login");
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
          {currentPage !== 3 && (
            <TouchableOpacity
              onPress={skipOnboarding}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ================= MAIN CONTENT ================= */}

        <View style={styles.content}>

          {/* TITLE */}

          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
              <Text
                style={{
                  color: current.title1Color,
                }}
              >
                {current.title1}
              </Text>

              {current.title2 && "\n"}

              {current.title2 && (
                <Text
                  style={{
                    color: current.title2Color,
                  }}
                >
                  {current.title2}
                </Text>
              )}
            </Text>
          </View>

          {/* DESCRIPTION */}

          <Text style={styles.description}>
            {current.description}
          </Text>

          {/* ================= ILLUSTRATION ================= */}

          <Image
            source={current.image}
            style={[
              styles.illustration,
              currentPage === 0 && styles.pageOneImage,
              currentPage === 1 && styles.pageTwoImage,
              currentPage === 2 && styles.pageThreeImage,
              currentPage === 3 && styles.pageFourImage,
            ]}
            resizeMode="contain"
          />

          {/* ================= FEATURES ================= */}

          {current.features && (
            <View style={styles.featuresContainer}>
              {current.features.map((feature, index) => (
                <View
                  key={index}
                  style={styles.featureBox}
                >
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>
                      {feature.icon}
                    </Text>
                  </View>

                  <Text style={styles.featureText}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ================= PAGE 1 TEXT ================= */}

          {current.bottomText && (
            <Text style={styles.bottomDescription}>
              {current.bottomText}
            </Text>
          )}

          {/* ================= FINAL PAGE ================= */}

          {currentPage === 3 && (
            <View style={styles.finalButtons}>

              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={handleCreateAccount}
                activeOpacity={0.8}
              >
                <Text style={styles.createAccountText}>
                  Create account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginText}>
                  Login
                </Text>
              </TouchableOpacity>

            </View>
          )}

        </View>

        {/* ================= BOTTOM NAVIGATION ================= */}

        <View style={styles.bottomNavigation}>

          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            disabled={currentPage === 0}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.backText,
                currentPage === 0 && styles.disabledBackText,
              ]}
            >
              ← Back
            </Text>
          </TouchableOpacity>

          {/* DOTS */}

          <View style={styles.dotsContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentPage && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* NEXT */}

          {currentPage < 3 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={goNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>
                Next &gt;
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.nextPlaceholder} />
          )}

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

  /* ================= TOP BAR ================= */

  topBar: {
    height: 48,
    paddingHorizontal: 25,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  skipText: {
    fontSize: 16,
    marginTop: 25,
    fontWeight: "500",
    color: "#F76B57",
  },

  /* ================= CONTENT ================= */

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  /* ================= TITLE ================= */

  titleContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 9,
  },

  titleText: {
    textAlign: "center",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "400",
  },

  /* ================= DESCRIPTION ================= */

  description: {
    width: "100%",
    textAlign: "center",
    color: "#111111",
    fontSize: 15.5,
    lineHeight: 19,
    marginTop: 20,
    fontWeight: "400",
  },

  /* ================= IMAGES ================= */

  illustration: {
    width: width * 0.86,
    height: height * 0.40,
    marginTop: 10,
  },

  /*
     Each image has a different original aspect ratio,
     so these small adjustments make them look closer
     to your screenshots.
  */

  pageOneImage: {
    height: height * 0.59,
    marginTop: 5,
  },

  pageTwoImage: {
    height: height * 0.54,
    marginTop: 8,
  },

  pageThreeImage: {
    height: height * 0.54,
    marginTop: 8,
  },

  pageFourImage: {
    height: height * 0.65,
    marginTop: 5,
  },

  /* ================= FEATURES ================= */

  featuresContainer: {
    width: "94%",
    marginTop: -2,
    gap: 9,
  },

  featureBox: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#999999",
    borderRadius: 10,
    backgroundColor: "#F5F6F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#B7B7B7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },

  featureIconText: {
    color: "#2852D9",
    fontSize: 17,
    fontWeight: "600",
  },

  featureText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "400",
  },

  /* ================= PAGE 1 TEXT ================= */

  bottomDescription: {
    width: "100%",
    textAlign: "center",
    fontSize: 15.5,
    lineHeight: 19,
    color: "#111111",
    marginTop: 12,
  },

  /* ================= FINAL PAGE ================= */

  finalButtons: {
    width: "90%",
    marginTop: 7,
    gap: 10,
  },

  createAccountButton: {
    width: "100%",
    height: 32,
    borderRadius: 18,
    backgroundColor: "#F76B57",
    alignItems: "center",
    justifyContent: "center",
  },

  createAccountText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },

  loginButton: {
    width: "100%",
    height: 32,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#1717A8",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#1717A8",
    fontSize: 17,
    fontWeight: "500",
  },

  /* ================= BOTTOM NAV ================= */

  bottomNavigation: {
    height: 81,
    borderTopWidth: 1,
    borderTopColor: "#BBBBBB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  /* ================= BACK ================= */

  backButton: {
    width: 85,
  },

  backText: {
    color: "#777777",
    fontSize: 16,
    fontWeight: "400",
  },

  disabledBackText: {
    color: "#CCCCCC",
  },

  /* ================= DOTS ================= */

  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDDDDD",
  },

  activeDot: {
    backgroundColor: "#F76B57",
  },

  /* ================= NEXT ================= */

  nextButton: {
    width: 87,
    height: 39,
    borderRadius: 6,
    backgroundColor: "#F76B57",
    alignItems: "center",
    justifyContent: "center",
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  nextPlaceholder: {
    width: 87,
    height: 39,
  },
});