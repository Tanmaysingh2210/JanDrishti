import Citizen from "../models/citizen.js";


// ==========================================
// UPDATE CITIZEN LOCATION
// ==========================================

export const updateCitizenLocation = async (req, res) => {
  try {

    const {
      latitude,
      longitude,
    } = req.body;

    // -----------------------------
    // Validate
    // -----------------------------

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    // -----------------------------
    // Validate coordinates
    // -----------------------------

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    // -----------------------------
    // Find logged-in citizen
    // -----------------------------

    const citizen = await Citizen.findById(
      req.user.userId
    );

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    // -----------------------------
    // Save GeoJSON location
    // IMPORTANT:
    // MongoDB = [longitude, latitude]
    // -----------------------------

    citizen.location = {
      type: "Point",
      coordinates: [
        longitude,
        latitude,
      ],
    };

    await citizen.save();

    // -----------------------------
    // Response
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: citizen.location,
    });

  } catch (error) {

    console.error(
      "Update Citizen Location Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update location",
    });
  }
};