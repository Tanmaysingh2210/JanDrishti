import Issue from "../models/issue.js";
import UniversityProposal from "../models/universityProposal.js";
import University from "../models/university.js";

export const getApprovedIssuesForUniversity = async (req, res) => {
  try {
    const { category, district, search, page = 1, limit = 10 } = req.query;

    const query = {
      status: "approved",
      mergedInto: null,
    };

    if (category) {
      query.category = category;
    }

    if (district) {
      query["location.district"] = new RegExp(district, "i");
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("citizenId", "fullName");

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
    console.error("Get Approved Issues Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const submitProposal = async (req, res) => {
  try {
    const {
      issueId,
      departmentId,
      title,
      solutionDescription,
      teamInformation,
      facultyInformation,
      estimatedCost,
      timelineMonths,
      proposalPdf,
    } = req.body;

    if (
      !issueId ||
      !title ||
      !solutionDescription ||
      estimatedCost === undefined ||
      !timelineMonths
    ) {
      return res.status(400).json({
        success: false,
        message: "Required proposal fields are missing",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Approved issue not found",
      });
    }

    // Find default university if req.user is absent
    let universityId = req.user?.universityId;
    let submittedBy = req.user?.userId;

    if (!universityId) {
      const defaultUniv = await University.findOne();
      if (defaultUniv) {
        universityId = defaultUniv._id;
        submittedBy = defaultUniv.representative?._id || defaultUniv._id;
      }
    }

    const proposal = await UniversityProposal.create({
      issueId,
      universityId,
      departmentId: departmentId || undefined,
      submittedBy,
      title: title.trim(),
      solutionDescription: solutionDescription.trim(),
      teamInformation: teamInformation || [],
      facultyInformation: facultyInformation || [],
      estimatedCost: Number(estimatedCost),
      timelineMonths: Number(timelineMonths),
      proposalPdf: proposalPdf || {},
      status: "submitted",
    });

    await Issue.findByIdAndUpdate(issueId, {
      status: "in_progress",
      assignedUniversityId: universityId,
      assignedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Solution proposal submitted successfully",
      proposal,
    });
  } catch (error) {
    console.error("Submit Proposal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const submitUniversityProposalDirect = async (req, res) => {
  try {
    const {
      issueId,
      departmentId,
      title,
      solutionDescription,
      teamInformation,
      facultyInformation,
      estimatedCost,
      timelineMonths,
      proposalPdf,
    } = req.body;

    if (
      !issueId ||
      !title ||
      !solutionDescription ||
      estimatedCost === undefined ||
      !timelineMonths
    ) {
      return res.status(400).json({
        success: false,
        message: "Required proposal fields are missing",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    let universityId = req.user?.universityId;
    let submittedBy = req.user?.userId;

    if (!universityId) {
      const defaultUniv = await University.findOne();
      if (defaultUniv) {
        universityId = defaultUniv._id;
        submittedBy = defaultUniv.representative?._id || defaultUniv._id;
      } else {
        return res.status(400).json({
          success: false,
          message: "No registered university found in system",
        });
      }
    }

    const proposal = await UniversityProposal.create({
      issueId,
      universityId,
      departmentId: departmentId || undefined,
      submittedBy,
      title: title.trim(),
      solutionDescription: solutionDescription.trim(),
      teamInformation: teamInformation || [],
      facultyInformation: facultyInformation || [],
      estimatedCost: Number(estimatedCost),
      timelineMonths: Number(timelineMonths),
      proposalPdf: proposalPdf || {},
      status: "submitted",
    });

    await Issue.findByIdAndUpdate(issueId, {
      status: "in_progress",
      assignedUniversityId: universityId,
      assignedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "R&D Proposal submitted successfully to database",
      proposal,
    });
  } catch (error) {
    console.error("Submit Proposal Direct Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (req.user?.universityId) {
      query.universityId = req.user.universityId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const proposals = await UniversityProposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("issueId", "title category status location")
      .populate("universityId", "name code type")
      .populate("departmentId", "name code")
      .populate("submittedBy", "fullName email designation");

    const total = await UniversityProposal.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: proposals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      proposals,
    });
  } catch (error) {
    console.error("Get My Proposals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const proposal = await UniversityProposal.findById(proposalId)
      .populate("issueId")
      .populate("universityId", "name code type email phone")
      .populate("departmentId", "name code description expertise")
      .populate("submittedBy", "fullName email mobileNumber designation role");

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    return res.status(200).json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("Get Proposal By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
