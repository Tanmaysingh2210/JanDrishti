import Issue from "../models/issue.js";
import UniversityProposal from "../models/universityProposal.js";

export const getAllIssues = async (req, res) => {
  try {
    const {
      status,
      category,
      district,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

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
      .populate("citizenId", "fullName email mobileNumber")
      .populate("assignedUniversityId", "name code")
      .populate("mergedInto", "title status");

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
    console.error("Get All Issues Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getIssueDetails = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId)
      .populate("citizenId", "fullName email mobileNumber")
      .populate("assignedUniversityId", "name code type email phone website")
      .populate("governmentReview.reviewedBy", "fullName role designation")
      .populate("mergedInto", "title status createdAt");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Find any duplicate issues that were merged INTO this issue
    const mergedDuplicates = await Issue.find({ mergedInto: issue._id })
      .select("title description category status createdAt citizenId")
      .populate("citizenId", "fullName");

    // Find proposals submitted for this issue
    const proposals = await UniversityProposal.find({ issueId })
      .populate("universityId", "name code type state district")
      .populate("submittedBy", "fullName email designation");

    return res.status(200).json({
      success: true,
      issue,
      mergedDuplicates,
      proposalsCount: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get Issue Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const approveIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { notes } = req.body;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (issue.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Issue is already approved",
      });
    }

    issue.status = "approved";
    issue.governmentReview = {
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      status: "approved",
      notes: notes || undefined,
    };

    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Issue approved successfully and is now visible to universities",
      issue,
    });
  } catch (error) {
    console.error("Approve Issue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { rejectionReason, notes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.status = "rejected";
    issue.governmentReview = {
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      status: "rejected",
      notes: notes || undefined,
      rejectionReason: rejectionReason.trim(),
    };

    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Issue rejected successfully",
      issue,
    });
  } catch (error) {
    console.error("Reject Issue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const mergeIssue = async (req, res) => {
  try {
    const { sourceIssueId, targetIssueId, notes } = req.body;

    if (!sourceIssueId || !targetIssueId) {
      return res.status(400).json({
        success: false,
        message: "Both sourceIssueId and targetIssueId are required",
      });
    }

    if (sourceIssueId === targetIssueId) {
      return res.status(400).json({
        success: false,
        message: "Cannot merge an issue into itself",
      });
    }

    const sourceIssue = await Issue.findById(sourceIssueId);
    const targetIssue = await Issue.findById(targetIssueId);

    if (!sourceIssue || !targetIssue) {
      return res.status(404).json({
        success: false,
        message: "One or both issues were not found",
      });
    }

    if (sourceIssue.mergedInto) {
      return res.status(400).json({
        success: false,
        message: "Source issue is already merged into another issue",
      });
    }

    // Link source issue to target issue
    sourceIssue.mergedInto = targetIssue._id;
    sourceIssue.mergeInfo = {
      mergedAt: new Date(),
      mergedBy: req.user.userId,
      originalIssueId: sourceIssue._id,
    };
    sourceIssue.governmentReview = {
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      status: "merged",
      notes: notes || `Merged into issue #${targetIssue._id}`,
    };

    await sourceIssue.save();

    return res.status(200).json({
      success: true,
      message: `Issue successfully merged into Target Issue #${targetIssue._id}`,
      sourceIssue,
      targetIssue,
    });
  } catch (error) {
    console.error("Merge Issue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
