const JobPost = require("../models/JobPost");

exports.updateApplicationStatus = async (req, res) => {
  const { jobPostId, applicationId } = req.params;
  const { status } = req.body; // The status should be passed in the body ('accepted' or 'rejected')

  // Validate status
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    // Find the job post
    const jobPost = await JobPost.findById(jobPostId);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Find the application within the candidates array
    const candidateIndex = jobPost.candidates.findIndex(
      (candidate) => candidate._id.toString() === applicationId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update the status of the application
    jobPost.candidates[candidateIndex].status = status;

    // Move the candidate to the corresponding list (hired or rejected)
    if (status === "accepted") {
      jobPost.hiredCandidates.push(jobPost.candidates[candidateIndex]);
    } else if (status === "rejected") {
      jobPost.rejectedCandidates.push(jobPost.candidates[candidateIndex]);
    }

    // Save the job post with the updated candidate status
    await jobPost.save();

    res.status(200).json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
