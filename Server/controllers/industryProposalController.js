import Project from "../models/project.js";
import IndustryProposal from "../models/industryProposal.js";

export const getAssignedProjectsForIndustry = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {
      status: { $in: ["assigned", "in_progress"] },
    };

    if (search) {
      query.title = new RegExp(search, "i");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("issueId", "title category location description")
      .populate("universityId", "name code type email state district website");

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
    console.error("Get Assigned Projects For Industry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const submitSupportProposal = async (req, res) => {
  try {
    const {
      projectId,
      offeringType,
      title,
      description,
      resourcesOffered,
      estimatedValue,
      timeline,
      proposalDocument,
    } = req.body;

    if (!projectId || !offeringType || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Required proposal fields are missing",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Assigned project not found",
      });
    }

    const proposal = await IndustryProposal.create({
      projectId: project._id,
      issueId: project.issueId,
      universityId: project.universityId,
      industryId: req.user.industryId,
      offeringType,
      title: title.trim(),
      description: description.trim(),
      resourcesOffered: resourcesOffered ? resourcesOffered.trim() : undefined,
      estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
      timeline: timeline ? timeline.trim() : undefined,
      proposalDocument: proposalDocument || {},
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Support proposal submitted to university successfully",
      proposal,
    });
  } catch (error) {
    console.error("Submit Support Proposal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyIndustryProposals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { industryId: req.user.industryId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const proposals = await IndustryProposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("projectId", "title status")
      .populate("universityId", "name code state district email");

    const total = await IndustryProposal.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: proposals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      proposals,
    });
  } catch (error) {
    console.error("Get My Industry Proposals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
