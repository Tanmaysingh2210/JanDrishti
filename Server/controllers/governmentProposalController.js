import Issue from "../models/issue.js";
import UniversityProposal from "../models/universityProposal.js";
import Project from "../models/project.js";

export const getProposalsForIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const proposals = await UniversityProposal.find({ issueId })
      .populate("universityId", "name code type email phone website state district")
      .populate("departmentId", "name code expertise")
      .populate("submittedBy", "fullName email mobileNumber designation");

    return res.status(200).json({
      success: true,
      count: proposals.length,
      issue: {
        id: issue._id,
        title: issue.title,
        status: issue.status,
        category: issue.category,
      },
      proposals,
    });
  } catch (error) {
    console.error("Get Proposals For Issue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const selectUniversityProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { selectionNotes } = req.body;

    const selectedProposal = await UniversityProposal.findById(proposalId);

    if (!selectedProposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    const issue = await Issue.findById(selectedProposal.issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Associated issue not found",
      });
    }

    if (issue.status === "assigned") {
      return res.status(400).json({
        success: false,
        message: "This issue has already been assigned to a university",
      });
    }

    // Mark selected proposal as accepted
    selectedProposal.status = "accepted";
    selectedProposal.governmentReview = {
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      notes: selectionNotes || "Proposal accepted and assigned by government",
    };
    await selectedProposal.save();

    // Reject all other proposals for this issue
    await UniversityProposal.updateMany(
      {
        issueId: issue._id,
        _id: { $ne: selectedProposal._id },
      },
      {
        $set: {
          status: "rejected",
          "governmentReview.reviewedBy": req.user.userId,
          "governmentReview.reviewedAt": new Date(),
          "governmentReview.notes": "Another proposal was selected for this issue",
        },
      }
    );

    // Update Issue status & assign university
    issue.status = "assigned";
    issue.assignedUniversityId = selectedProposal.universityId;
    issue.assignedAt = new Date();
    await issue.save();

    // Calculate target completion date based on timelineMonths
    const startDate = new Date();
    const targetCompletionDate = new Date(startDate);
    targetCompletionDate.setMonth(
      targetCompletionDate.getMonth() + (selectedProposal.timelineMonths || 6)
    );

    // Create Project assignment record
    const project = await Project.create({
      issueId: issue._id,
      universityId: selectedProposal.universityId,
      acceptedProposalId: selectedProposal._id,
      title: issue.title,
      status: "assigned",
      startDate,
      targetCompletionDate,
      milestones: [
        {
          title: "Initial Project Kickoff & Setup",
          description: "Form team, establish communication channels, and review requirements.",
          targetDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000), // +2 weeks
          status: "pending",
        },
        {
          title: "Final Implementation & Delivery",
          description: "Complete solution deployment and hand over report to government.",
          targetDate: targetCompletionDate,
          status: "pending",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message:
        "University selected successfully! Issue assigned and Project created.",
      selectedProposal,
      issue,
      project,
    });
  } catch (error) {
    console.error("Select University Proposal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
