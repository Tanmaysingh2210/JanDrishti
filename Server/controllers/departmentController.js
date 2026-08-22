import mongoose from "mongoose";

import Department from "../models/department.js";
import University from "../models/university.js";


// =====================================================
// CREATE DEPARTMENT
// =====================================================

export const createDepartment = async (req, res) => {
  try {
    const currentUser = req.user;

    const {
      name,
      code,
      description,
      expertise,
    } = req.body;


    // =================================================
    // AUTHENTICATION
    // =================================================

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // =================================================
    // ONLY UNIVERSITY ADMIN
    // =================================================

    if (
      currentUser.role !== "university_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only university admin can create departments",
      });
    }


    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }


    // =================================================
    // VALIDATE UNIVERSITY ID FROM JWT
    // =================================================

    if (
      !currentUser.universityId ||
      !mongoose.Types.ObjectId.isValid(
        currentUser.universityId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid university information",
      });
    }


    // =================================================
    // FIND UNIVERSITY
    // =================================================

    const university =
      await University.findById(
        currentUser.universityId
      );


    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }


    // =================================================
    // UNIVERSITY MUST BE VERIFIED
    // =================================================

    if (
      university.verificationStatus !==
      "verified"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "University is not verified by the government",
      });
    }


    if (!university.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "University account is inactive",
      });
    }


    // =================================================
    // NORMALIZE DATA
    // =================================================

    const normalizedName =
      name.trim();

    const normalizedCode =
      code?.trim().toUpperCase();


    // =================================================
    // CHECK DUPLICATE DEPARTMENT
    // =================================================

    const duplicateQuery = {
      universityId:
        currentUser.universityId,

      name: {
        $regex: `^${normalizedName}$`,
        $options: "i",
      },
    };


    const existingDepartment =
      await Department.findOne(
        duplicateQuery
      );


    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message:
          "Department already exists in this university",
      });
    }


    // =================================================
    // CHECK DUPLICATE CODE
    // =================================================

    if (normalizedCode) {

      const existingCode =
        await Department.findOne({
          universityId:
            currentUser.universityId,

          code: normalizedCode,
        });


      if (existingCode) {
        return res.status(409).json({
          success: false,
          message:
            "Department code already exists in this university",
        });
      }
    }


    // =================================================
    // VALIDATE EXPERTISE
    // =================================================

    let normalizedExpertise = [];

    if (expertise !== undefined) {

      if (!Array.isArray(expertise)) {
        return res.status(400).json({
          success: false,
          message:
            "Expertise must be an array",
        });
      }


      normalizedExpertise =
        expertise
          .filter(
            (item) =>
              typeof item === "string"
          )
          .map(
            (item) =>
              item.trim().toLowerCase()
          )
          .filter(Boolean);


      // Remove duplicates
      normalizedExpertise = [
        ...new Set(
          normalizedExpertise
        ),
      ];
    }


    // =================================================
    // CREATE DEPARTMENT
    // =================================================

    const department =
      await Department.create({
        universityId:
          currentUser.universityId,

        name:
          normalizedName,

        code:
          normalizedCode || undefined,

        description:
          description?.trim() || "",

        expertise:
          normalizedExpertise,

        isActive: true,
      });


    // =================================================
    // ADD DEPARTMENT TO UNIVERSITY
    // =================================================

    await University.findByIdAndUpdate(
      currentUser.universityId,
      {
        $addToSet: {
          departments: department._id,
        },
      }
    );


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Department created successfully",

      department,
    });

  } catch (error) {

    console.error(
      "Create Department Error:",
      error
    );


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Department with this information already exists",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// GET ALL DEPARTMENTS
// =====================================================

export const getDepartments = async (
  req,
  res
) => {
  try {
    const currentUser = req.user;


    // =================================================
    // AUTHENTICATION
    // =================================================

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // =================================================
    // UNIVERSITY SCOPE
    // =================================================

    const departments =
      await Department.find({
        universityId:
          currentUser.universityId,
      })
        .sort({
          name: 1,
        });


    return res.status(200).json({
      success: true,

      count:
        departments.length,

      departments,
    });

  } catch (error) {

    console.error(
      "Get Departments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// GET ACTIVE DEPARTMENTS
// =====================================================

export const getActiveDepartments = async (
  req,
  res
) => {
  try {
    const currentUser = req.user;


    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    const departments =
      await Department.find({
        universityId:
          currentUser.universityId,

        isActive: true,
      })
        .sort({
          name: 1,
        });


    return res.status(200).json({
      success: true,

      count:
        departments.length,

      departments,
    });

  } catch (error) {

    console.error(
      "Get Active Departments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// GET DEPARTMENT BY ID
// =====================================================

export const getDepartmentById = async (
  req,
  res
) => {
  try {
    const currentUser = req.user;

    const { departmentId } =
      req.params;


    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        departmentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }


    const department =
      await Department.findOne({
        _id: departmentId,

        // Critical:
        // Only fetch from current user's university
        universityId:
          currentUser.universityId,
      });


    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }


    return res.status(200).json({
      success: true,

      department,
    });

  } catch (error) {

    console.error(
      "Get Department Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// UPDATE DEPARTMENT
// =====================================================

export const updateDepartment = async (
  req,
  res
) => {
  try {
    const currentUser = req.user;

    const { departmentId } =
      req.params;

    const {
      name,
      code,
      description,
      expertise,
    } = req.body;


    // =================================================
    // AUTHENTICATION
    // =================================================

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // =================================================
    // ADMIN ONLY
    // =================================================

    if (
      currentUser.role !==
      "university_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only university admin can update departments",
      });
    }


    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        departmentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }


    // =================================================
    // FIND DEPARTMENT
    // =================================================

    const department =
      await Department.findOne({
        _id: departmentId,

        universityId:
          currentUser.universityId,
      });


    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }


    // =================================================
    // UPDATE NAME
    // =================================================

    if (name !== undefined) {

      const normalizedName =
        name.trim();


      if (!normalizedName) {
        return res.status(400).json({
          success: false,
          message:
            "Department name cannot be empty",
        });
      }


      const duplicateName =
        await Department.findOne({
          _id: {
            $ne: departmentId,
          },

          universityId:
            currentUser.universityId,

          name: {
            $regex:
              `^${normalizedName}$`,

            $options: "i",
          },
        });


      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message:
            "Another department with this name already exists",
        });
      }


      department.name =
        normalizedName;
    }


    // =================================================
    // UPDATE CODE
    // =================================================

    if (code !== undefined) {

      const normalizedCode =
        code.trim().toUpperCase();


      if (normalizedCode) {

        const duplicateCode =
          await Department.findOne({
            _id: {
              $ne: departmentId,
            },

            universityId:
              currentUser.universityId,

            code:
              normalizedCode,
          });


        if (duplicateCode) {
          return res.status(409).json({
            success: false,
            message:
              "Another department with this code already exists",
          });
        }
      }


      department.code =
        normalizedCode || undefined;
    }


    // =================================================
    // UPDATE DESCRIPTION
    // =================================================

    if (
      description !== undefined
    ) {
      department.description =
        description.trim();
    }


    // =================================================
    // UPDATE EXPERTISE
    // =================================================

    if (
      expertise !== undefined
    ) {

      if (!Array.isArray(expertise)) {
        return res.status(400).json({
          success: false,
          message:
            "Expertise must be an array",
        });
      }


      department.expertise = [
        ...new Set(
          expertise
            .filter(
              (item) =>
                typeof item === "string"
            )
            .map(
              (item) =>
                item.trim().toLowerCase()
            )
            .filter(Boolean)
        ),
      ];
    }


    await department.save();


    return res.status(200).json({
      success: true,

      message:
        "Department updated successfully",

      department,
    });

  } catch (error) {

    console.error(
      "Update Department Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// TOGGLE DEPARTMENT STATUS
// =====================================================

export const toggleDepartmentStatus = async (
  req,
  res
) => {
  try {
    const currentUser = req.user;

    const { departmentId } =
      req.params;


    // =================================================
    // AUTHENTICATION
    // =================================================

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    // =================================================
    // ADMIN ONLY
    // =================================================

    if (
      currentUser.role !==
      "university_admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only university admin can change department status",
      });
    }


    // =================================================
    // VALIDATE ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        departmentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }


    // =================================================
    // FIND DEPARTMENT
    // =================================================

    const department =
      await Department.findOne({
        _id: departmentId,

        universityId:
          currentUser.universityId,
      });


    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }


    // =================================================
    // TOGGLE
    // =================================================

    department.isActive =
      !department.isActive;


    await department.save();


    return res.status(200).json({
      success: true,

      message:
        department.isActive
          ? "Department activated successfully"
          : "Department deactivated successfully",

      department: {
        id: department._id,
        name: department.name,
        isActive:
          department.isActive,
      },
    });

  } catch (error) {

    console.error(
      "Toggle Department Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};