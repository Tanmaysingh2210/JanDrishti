import Issue from "../models/issue.js";
import cloudinary from "../config/cloudinary.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed ML Model & DB categories
const ALLOWED_CATEGORIES = [
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

// ==========================================
// UPLOAD EVIDENCE TO CLOUDINARY
// ==========================================

export const uploadEvidence = async (req, res) => {
  try {
    console.log("uploadEvidence hit - req.file:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length,
    } : "UNDEFINED");
    console.log("Content-Type header:", req.headers["content-type"]);

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
    console.error("Upload evidence error:", error?.message || error);
    console.error("Cloudinary config check:", {
      name: !!process.env.CLOUDINARY_NAME,
      key: !!process.env.CLOUDINARY_KEY,
      secret: !!process.env.CLOUDINARY_SECRET,
      nameVal: process.env.CLOUDINARY_NAME,
    });
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to upload evidence file",
    });
  }
};


// ==========================================
// ML SERVICE INTEGRATION HELPER
// ==========================================

async function analyzeComplaint(text) {
  let primaryUrl = process.env.ML_SERVICE_URL || "http://192.168.29.147:8000/analyze";
  if (!primaryUrl.endsWith("/analyze")) {
    primaryUrl = primaryUrl.replace(/\/+$/, "") + "/analyze";
  }
  try {
    const r = await fetch(primaryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`ML service ${r.status}`);
    return await r.json();
  } catch (primaryErr) {
    // If primary IP fails, attempt localhost fallback
    try {
      const localR = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(3000),
      });
      if (localR.ok) return await localR.json();
    } catch (_) {}
    throw primaryErr;
  }
}


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
    let mlData = null;

    // 1. Try FastAPI ML Service (http://192.168.29.147:8000/analyze with fallback)
    mlData = await analyzeComplaint(text).catch(() => null);
    if (mlData && mlData.category) {
      rawLabel = mlData.category.trim().toLowerCase();
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

    const cleanRaw = (rawLabel || "").trim().toLowerCase();
    const dbCategory = ALLOWED_CATEGORIES.includes(cleanRaw) ? cleanRaw : "other";

    return res.status(200).json({
      success: true,
      rawLabel,
      category: dbCategory,
      ml: mlData ? {
        originalComplaintIndex: mlData.original_complaint_index ?? null,
        similarityScore: mlData.similarity_score ?? null,
        similarComplaint: mlData.similar_complaint ?? null,
        isDuplicate: Boolean(mlData.similarity_score && mlData.similarity_score >= 0.85),
      } : null,
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
    const { title, description, category: userCategory, photos, videos, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Call ML service from server side with safety catch
    const textToAnalyze = `${title}. ${description}`;
    const ml = await analyzeComplaint(textToAnalyze).catch(() => null);

    let rawCategory = ml?.category ? ml.category.trim().toLowerCase() : null;
    let finalCategory = userCategory || "other";

    if (rawCategory && ALLOWED_CATEGORIES.includes(rawCategory)) {
      finalCategory = rawCategory;
    } else if (userCategory && ALLOWED_CATEGORIES.includes(userCategory)) {
      finalCategory = userCategory;
    } else {
      finalCategory = "other";
    }

    const duplicateOf = ml?.original_complaint_index ?? null;
    const similarityScore = ml?.similarity_score ?? null;
    const isDuplicate = Boolean(similarityScore !== null && similarityScore >= 0.85);

    const issue = await Issue.create({
      citizenId: req.user.userId,
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      photos: photos || [],
      videos: videos || [],
      location: location || {},
      status: "submitted",
      mlAnalysis: ml ? {
        rawCategory,
        category: finalCategory,
        similarityScore,
        originalComplaintIndex: duplicateOf,
        similarComplaint: ml.similar_complaint || null,
        isDuplicate,
      } : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      issue,
      mlAnalysis: ml ? {
        category: finalCategory,
        originalComplaintIndex: duplicateOf,
        similarityScore,
        isDuplicate,
      } : null,
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
