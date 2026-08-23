import Issue from "../models/issue.js";
import cloudinary from "../config/cloudinary.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map model output labels -> DB category enum
const LABEL_MAP = {
  "electric / solar energy": "electricity",
  "energy": "electricity",
  "electricity": "electricity",
  "road infrastructure": "roads_traffic",
  "roads": "roads_traffic",
  "roads_traffic": "roads_traffic",
  "traffic": "roads_traffic",
  "urban development": "roads_traffic",
  "waste management": "sanitation",
  "sanitation": "sanitation",
  "water": "water_management",
  "water management": "water_management",
  "water_management": "water_management",
  "water related": "water_management",
  "digital infrastructure": "infrastructure",
  "infrastructure": "infrastructure",
  "accessibility": "infrastructure",
  "education": "education",
  "health": "health",
  "healthcare": "health",
  "environment": "environment",
  "public administration": "social",
  "rural livelihood": "social",
  "social": "social",
  "agriculture": "environment",
  "other": "other",
};

// ==========================================
// UPLOAD EVIDENCE TO CLOUDINARY
// ==========================================

export const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const isVideo =
      req.file.mimetype.startsWith("video/");

    const resourceType = isVideo
      ? "video"
      : "image";

    const folder = isVideo
      ? "jandrishti/citizen/videos"
      : "jandrishti/citizen/photos";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload evidence error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload evidence file",
    });
  }
};


// ==========================================
// CLASSIFY ISSUE VIA AI MODEL
// ==========================================

export const classifyIssue = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: "Title or description required for classification",
      });
    }

    const text = `${title || ""} ${description || ""}`.trim();
    let rawLabel = "other";

    // 1. Try FastAPI ML Service running on http://127.0.0.1:8000/analyze first
    try {
      const mlRes = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        if (mlData && mlData.category) {
          rawLabel = mlData.category.trim().toLowerCase();
        }
      }
    } catch (apiErr) {
      // FastAPI port 8000 not reachable, fallback to predict.py script
    }

    // 2. Fallback to predict.py python process if FastAPI service didn't return a category
    if (rawLabel === "other") {
      try {
        const predictScript = path.resolve(
          __dirname,
          "../../Text_Model/src/predict.py"
        );

        const result = await new Promise((resolve, reject) => {
          const py = spawn("python", [predictScript, text]);

          let stdout = "";
          let stderr = "";

          py.stdout.on("data", (d) => (stdout += d.toString()));
          py.stderr.on("data", (d) => (stderr += d.toString()));

          py.on("close", (code) => {
            if (code !== 0) {
              reject(new Error(stderr || "predict.py exited with code " + code));
            } else {
              resolve(stdout.trim());
            }
          });
        });

        const match = result.match(/Category:\s*(.+)/i);
        if (match) {
          rawLabel = match[1].trim().toLowerCase();
        }
      } catch (pyErr) {
        console.error("Predict script fallback error:", pyErr.message);
      }
    }

    let dbCategory = "other";
    const cleanRaw = (rawLabel || "").trim().toLowerCase();
    const MODEL_CATEGORIES = [
      "accessibility",
      "agriculture",
      "education",
      "energy",
      "environment",
      "healthcare",
      "public administration",
      "rural livelihood",
      "urban development",
      "water related",
      "other",
    ];

    if (MODEL_CATEGORIES.includes(cleanRaw)) {
      dbCategory = cleanRaw;
    } else {
      if (cleanRaw === "electric / solar energy" || cleanRaw === "electricity") dbCategory = "energy";
      else if (cleanRaw === "roads_traffic" || cleanRaw === "roads" || cleanRaw === "traffic") dbCategory = "urban development";
      else if (cleanRaw === "water_management" || cleanRaw === "water") dbCategory = "water related";
      else if (cleanRaw === "sanitation" || cleanRaw === "waste management") dbCategory = "urban development";
      else if (cleanRaw === "health") dbCategory = "healthcare";
      else if (cleanRaw === "social") dbCategory = "public administration";
      else if (cleanRaw === "infrastructure" || cleanRaw === "digital infrastructure") dbCategory = "accessibility";
    }

    return res.status(200).json({
      success: true,
      rawLabel,
      category: dbCategory,
    });

  } catch (error) {
    console.error("Classify Issue Error:", error.message);
    return res.status(200).json({
      success: true,
      rawLabel: "other",
      category: "other",
    });
  }
};

export const submitIssue = async (req, res) => {
  try {
    const { title, description, category, photos, videos, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const issue = await Issue.create({
      citizenId: req.user.userId,
      title: title.trim(),
      description: description.trim(),
      category: category || "other",
      photos: photos || [],
      videos: videos || [],
      location: location || {},
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      issue,
    });
  } catch (error) {
    console.error("Submit Issue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { citizenId: req.user.userId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("assignedUniversityId", "name code");

    const total = await Issue.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      issues,
    });
  } catch (error) {
    console.error("Get My Issues Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCitizenIssueById = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findOne({
      _id: issueId,
      citizenId: req.user.userId,
    })
      .populate("assignedUniversityId", "name code state district website")
      .populate("mergedInto", "title status");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error("Get Citizen Issue By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
