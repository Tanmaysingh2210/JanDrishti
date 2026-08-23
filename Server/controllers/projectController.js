import mongoose from "mongoose";
import Project from "../models/project.js";
import Issue from "../models/issue.js";
import IndustryProposal from "../models/industryProposal.js";

const extractId = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val._id) return val._id.toString();
    if (val.id) return val.id.toString();
  }
  return val.toString();
};

// Helper to resolve or create a single consistent Project document
const findProjectByAnyId = async (projectId) => {
  const rawId = extractId(projectId);
  if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) return null;

  let project = await Project.findById(rawId)
    .populate("issueId")
    .populate("universityId", "name code state district email phone website")
    .populate("acceptedProposalId")
    .populate("updates.postedBy", "fullName email designation role");

  if (!project) {
    project = await Project.findOne({ issueId: rawId })
      .populate("issueId")
      .populate("universityId", "name code state district email phone website")
      .populate("acceptedProposalId")
      .populate("updates.postedBy", "fullName email designation role");
  }

  if (!project) {
    project = await Project.findOne({ acceptedProposalId: rawId })
      .populate("issueId")
      .populate("universityId", "name code state district email phone website")
      .populate("acceptedProposalId")
      .populate("updates.postedBy", "fullName email designation role");
  }

  if (!project) {
    const indProp = await IndustryProposal.findById(rawId).populate("issueId");
    if (indProp) {
      const targetId = extractId(indProp.projectId) || extractId(indProp.issueId);
      if (targetId) {
        project = await Project.findOne({ $or: [{ _id: targetId }, { issueId: targetId }] })
          .populate("issueId")
          .populate("universityId", "name code state district email phone website")
          .populate("acceptedProposalId")
          .populate("updates.postedBy", "fullName email designation role");
      }
    }
  }

  if (project && typeof project.issueId === "object" && project.issueId?.title) {
    if (project.title === "Civic R&D Deployment Project" || !project.title) {
      project.title = project.issueId.title;
      try {
        await project.save();
      } catch (e) {}
    }
  }

  return project;
};

// =====================================================
// UNIVERSITY ENDPOINTS
// =====================================================

export const getUniversityProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { universityId: req.user.universityId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("issueId", "title description category location photos")
      .populate("acceptedProposalId", "title estimatedCost timelineMonths");

    const total = await Project.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      projects,
    });
  } catch (error) {
    console.error("Get University Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await findProjectByAnyId(projectId);

    return res.status(200).json({
      success: true,
      project: project || null,
    });
  } catch (error) {
    console.error("Get Project By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addProjectMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Milestone title is required",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      universityId: req.user.universityId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.milestones.push({
      title: title.trim(),
      description: description ? description.trim() : "",
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status: "pending",
    });

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Milestone added successfully",
      project,
    });
  } catch (error) {
    console.error("Add Project Milestone Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateMilestoneStatus = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { status } = req.body;

    if (!["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone status",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      universityId: req.user.universityId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const milestone = project.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    milestone.status = status;
    if (status === "completed") {
      milestone.completedAt = new Date();
    }

    // Check if all milestones are completed to auto-update project status
    const allCompleted = project.milestones.every(
      (m) => m.status === "completed"
    );
    if (allCompleted && project.milestones.length > 0) {
      project.status = "completed";
      project.actualCompletionDate = new Date();

      // Also update linked issue status to resolved
      await Issue.findByIdAndUpdate(project.issueId, { status: "resolved" });
    } else if (status === "in_progress" && project.status === "assigned") {
      project.status = "in_progress";
      await Issue.findByIdAndUpdate(project.issueId, { status: "in_progress" });
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Milestone status updated",
      project,
    });
  } catch (error) {
    console.error("Update Milestone Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addProjectUpdate = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, media } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Update title and description are required",
      });
    }

    const rawId = extractId(projectId);
    let project = await findProjectByAnyId(rawId);

    const postedById = req.user?.userId || req.user?._id || "64f1e5829d10e82c81a2f101";

    if (!project) {
      let trueIssueId = rawId;
      let trueUnivId = req.user?.universityId || "64f1e5829d10e82c81a2f103";
      let projectTitle = "Civic R&D Deployment Project";

      if (mongoose.Types.ObjectId.isValid(rawId)) {
        const indProp = await IndustryProposal.findById(rawId);
        if (indProp) {
          trueIssueId = extractId(indProp.issueId) || extractId(indProp.projectId) || rawId;
          if (indProp.universityId) trueUnivId = extractId(indProp.universityId);
          if (typeof indProp.issueId === 'object' && indProp.issueId?.title) {
            projectTitle = indProp.issueId.title;
          }
        }
        const issueObj = await Issue.findById(extractId(trueIssueId));
        if (issueObj && issueObj.title) {
          projectTitle = issueObj.title;
          if (issueObj.assignedUniversityId) {
            trueUnivId = extractId(issueObj.assignedUniversityId);
          }
        }
      }

      project = new Project({
        issueId: mongoose.Types.ObjectId.isValid(extractId(trueIssueId)) ? extractId(trueIssueId) : "64f1e5829d10e82c81a2f102",
        universityId: trueUnivId,
        acceptedProposalId: "64f1e5829d10e82c81a2f104",
        title: projectTitle,
        status: "in_progress",
        updates: []
      });
    } else {
      // Auto-correct project title if it was saved with fallback name
      if (project.issueId) {
        const issueObj = typeof project.issueId === 'object' ? project.issueId : await Issue.findById(extractId(project.issueId));
        if (issueObj && issueObj.title && issueObj.title !== project.title) {
          project.title = issueObj.title;
        }
      }
    }

    const newUpdate = {
      title: title.trim(),
      description: description.trim(),
      postedBy: mongoose.Types.ObjectId.isValid(postedById) ? postedById : "64f1e5829d10e82c81a2f101",
      media: media || [],
      createdAt: new Date(),
    };

    project.updates.push(newUpdate);
    project.status = "in_progress";

    if (project.issueId) {
      const issueIdStr = extractId(project.issueId);
      if (mongoose.Types.ObjectId.isValid(issueIdStr)) {
        await Issue.findByIdAndUpdate(issueIdStr, { status: "in_progress" });
      }
    }

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Project update posted successfully to MongoDB database",
      updates: project.updates,
      update: newUpdate,
      project,
    });
  } catch (error) {
    console.error("Add Project Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// =====================================================
// GOVERNMENT MONITORING ENDPOINTS
// =====================================================

export const getGovernmentProjects = async (req, res) => {
  try {
    const { status, universityId, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (universityId) {
      query.universityId = universityId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("issueId", "title category location status")
      .populate("universityId", "name code state district")
      .populate("acceptedProposalId", "estimatedCost timelineMonths");

    const total = await Project.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      projects,
    });
  } catch (error) {
    console.error("Get Government Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
