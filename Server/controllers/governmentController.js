import Government from "../models/government.js";

export const getGovernmentProfile = async (req, res) => {
  try {
    const government = await Government.findById(
      req.user.governmentId
    );

    if (!government) {
      return res.status(404).json({
        success: false,
        message: "Government organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      government,
    });
  } catch (error) {
    console.error("Get Government Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateGovernmentProfile = async (req, res) => {
  try {
    if (req.user.role !== "government_admin") {
      return res.status(403).json({
        success: false,
        message: "Only government admin can update government profile",
      });
    }

    const {
      name,
      department,
      officeType,
      district,
      state,
    } = req.body;

    const government = await Government.findById(
      req.user.governmentId
    );

    if (!government) {
      return res.status(404).json({
        success: false,
        message: "Government organization not found",
      });
    }

    if (name !== undefined) {
      government.name = name.trim();
    }

    if (department !== undefined) {
      government.department = department.trim();
    }

    if (officeType !== undefined) {
      const allowedOfficeTypes = [
        "state",
        "district",
        "department",
        "other",
      ];

      if (!allowedOfficeTypes.includes(officeType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid office type",
        });
      }

      government.officeType = officeType;
    }

    if (district !== undefined) {
      government.district = district.trim();
    }

    if (state !== undefined) {
      government.state = state.trim();
    }

    await government.save();

    return res.status(200).json({
      success: true,
      message: "Government profile updated successfully",
      government,
    });
  } catch (error) {
    console.error("Update Government Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};