import Issue from "../models/issue.js";
import cloudinary from "../config/cloudinary.js";

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

    const result = await new Promise(
      (resolve, reject) => {

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType,
              folder,
            },

            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        uploadStream.end(req.file.buffer);
      }
    );

    return res.status(200).json({
      success: true,
      message: "Evidence uploaded successfully",

      file: {
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? "video" : "image",
        originalName: req.file.originalname,
      },
    });

  } catch (error) {

    console.error(
      "Cloudinary Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload evidence",
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
