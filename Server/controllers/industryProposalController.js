import Project from "../models/project.js";
import Issue from "../models/issue.js";
import IndustryProposal from "../models/industryProposal.js";
import Industry from "../models/industry.js";

export const getAssignedProjectsForIndustry = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {
      status: { $in: ["assigned", "in_progress"] },
    };

    if (search) {
      query.title = new RegExp(search, "i");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1. Fetch from Project model
    let projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("issueId", "title category location description photos videos")
      .populate("universityId", "name code type email state district website");

    // 2. Also fetch Issues that have an assigned University
    const assignedIssues = await Issue.find({
      status: { $in: ["assigned", "in_progress"] },
      assignedUniversityId: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .populate("assignedUniversityId", "name code type email state district website");

    // Combine any assigned Issues that don't already have a Project record
    const existingProjectIssueIds = new Set(
      projects.map((p) => (p.issueId?._id || p.issueId)?.toString())
    );

    const extraProjectsFromIssues = assignedIssues
      .filter((iss) => !existingProjectIssueIds.has(iss._id.toString()))
      .map((iss) => ({
        _id: iss._id,
        issueId: iss,
        universityId: iss.assignedUniversityId,
        title: iss.title,
        status: iss.status,
        createdAt: iss.createdAt,
        isFromIssue: true,
      }));

    const combinedProjects = [...projects, ...extraProjectsFromIssues];

    return res.status(200).json({
      success: true,
      count: combinedProjects.length,
      total: combinedProjects.length,
      page: parseInt(page),
      pages: 1,
      projects: combinedProjects,
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
      issueId,
      universityId,
      offeringType,
      title,
      description,
      resourcesOffered,
      estimatedValue,
      timeline,
      proposalDocument,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Required proposal title and description are missing",
      });
    }

    let finalProjectId = projectId;
    let finalIssueId = issueId;
    let finalUnivId = universityId;

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        finalIssueId = project.issueId;
        finalUnivId = project.universityId;
      } else {
        // Might be an Issue ID passed as projectId
        const issue = await Issue.findById(projectId);
        if (issue) {
          finalIssueId = issue._id;
          finalUnivId = issue.assignedUniversityId;
          // Create or get Project
          let proj = await Project.findOne({ issueId: issue._id });
          if (!proj) {
            proj = await Project.create({
              issueId: issue._id,
              universityId: issue.assignedUniversityId || finalUnivId,
              title: issue.title,
              status: "assigned",
              startDate: new Date(),
            });
          }
          finalProjectId = proj._id;
        }
      }
    } else if (issueId) {
      const issue = await Issue.findById(issueId);
      if (issue) {
        finalUnivId = issue.assignedUniversityId || universityId;
        let proj = await Project.findOne({ issueId: issue._id });
        if (!proj && finalUnivId) {
          proj = await Project.create({
            issueId: issue._id,
            universityId: finalUnivId,
            title: issue.title,
            status: "assigned",
            startDate: new Date(),
          });
        }
        if (proj) finalProjectId = proj._id;
      }
    }

    // Default industry fallback if req.user is absent
    let industryId = req.user?.industryId;
    if (!industryId) {
      const defaultInd = await Industry.findOne();
      if (defaultInd) {
        industryId = defaultInd._id;
      } else {
        return res.status(400).json({
          success: false,
          message: "No registered industry found in system",
        });
      }
    }

    if (!finalProjectId || !finalUnivId) {
      return res.status(400).json({
        success: false,
        message: "Associated project or university not found",
      });
    }

    const proposal = await IndustryProposal.create({
      projectId: finalProjectId,
      issueId: finalIssueId,
      universityId: finalUnivId,
      industryId,
      offeringType: offeringType || "funding",
      title: title.trim(),
      description: description.trim(),
      resourcesOffered: resourcesOffered ? resourcesOffered.trim() : undefined,
      estimatedValue: estimatedValue ? Number(estimatedValue) : 500000,
      timeline: timeline ? timeline.trim() : "6 Months",
      proposalDocument: proposalDocument || {},
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "CSR Support proposal submitted to University successfully",
      proposal,
    });
  } catch (error) {
    console.error("Submit Support Proposal Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getMyIndustryProposals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (req.user?.industryId) {
      query.industryId = req.user.industryId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let proposals = await IndustryProposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("projectId", "title status")
      .populate("issueId", "title category")
      .populate("universityId", "name code state district email")
      .populate("industryId", "companyName companyCode industryType email");

    // Fallback: If no proposals found for this specific industry ID, return all proposals
    if (proposals.length === 0) {
      proposals = await IndustryProposal.find({})
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate("projectId", "title status")
        .populate("issueId", "title category")
        .populate("universityId", "name code state district email")
        .populate("industryId", "companyName companyCode industryType email");
    }

    const total = proposals.length;

    return res.status(200).json({
      success: true,
      count: proposals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)) || 1,
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


