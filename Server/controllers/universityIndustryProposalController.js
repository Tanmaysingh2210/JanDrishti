import IndustryProposal from "../models/industryProposal.js";

export const getIndustryProposalsForUniversity = async (req, res) => {
  try {
    const { status, projectId, page = 1, limit = 20 } = req.query;

    let query = {};
    if (req.user?.universityId) {
      query.universityId = req.user.universityId;
    }

    if (status) {
      query.status = status;
    }

    if (projectId) {
      query.projectId = projectId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let proposals = await IndustryProposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("industryId", "companyName companyCode industryType email phone website contactPerson")
      .populate("universityId", "name code state district email")
      .populate("projectId", "title status")
      .populate("issueId", "title category");

    // Fallback: If no proposals found for this specific university ID, fetch all industry proposals
    if (proposals.length === 0) {
      proposals = await IndustryProposal.find({})
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate("industryId", "companyName companyCode industryType email phone website contactPerson")
        .populate("universityId", "name code state district email")
        .populate("projectId", "title status")
        .populate("issueId", "title category");
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
    console.error("Get Industry Proposals For University Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const reviewIndustryProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status, notes } = req.body;

    if (!["accepted", "rejected", "revision_requested"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'accepted', 'rejected', or 'revision_requested'",
      });
    }

    let query = { _id: proposalId };
    if (req.user?.universityId) {
      query.universityId = req.user.universityId;
    }

    const proposal = await IndustryProposal.findOne(query);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Industry support proposal not found",
      });
    }

    proposal.status = status;
    proposal.universityResponse = {
      reviewedBy: req.user?.userId || undefined,
      reviewedAt: new Date(),
      notes: notes ? notes.trim() : "Reviewed by university",
    };

    await proposal.save();

    return res.status(200).json({
      success: true,
      message: `Industry CSR proposal status updated to '${status}'`,
      proposal,
    });
  } catch (error) {
    console.error("Review Industry Proposal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

