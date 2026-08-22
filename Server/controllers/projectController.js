import Project from "../models/project.js";
import Issue from "../models/issue.js";

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

    const project = await Project.findById(projectId)
      .populate("issueId")
      .populate("universityId", "name code state district email phone website")
      .populate("acceptedProposalId")
      .populate("updates.postedBy", "fullName email designation role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
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

    project.updates.push({
      title: title.trim(),
      description: description.trim(),
      postedBy: req.user.userId,
      media: media || [],
      createdAt: new Date(),
    });

    if (project.status === "assigned") {
      project.status = "in_progress";
      await Issue.findByIdAndUpdate(project.issueId, { status: "in_progress" });
    }

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Project update posted successfully",
      project,
    });
  } catch (error) {
    console.error("Add Project Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
