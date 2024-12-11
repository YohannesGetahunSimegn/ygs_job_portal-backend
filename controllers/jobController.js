const JobPost = require("../models/JobPost");
const User = require("../models/User");

// Controller to handle job application
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId, contact, applicationDate } = req.body;

    // Validation
    if (!userId || !contact || !applicationDate) {
      return res.status(400).json({
        error: "User ID, contact, and application date are required.",
      });
    }

    // Find user and job post
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const jobPost = await JobPost.findById(jobId);
    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found." });
    }

    // Check if user has already applied
    const alreadyApplied = jobPost.candidates.some(
      (candidate) => candidate.name === user.name
    );
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ error: "User has already applied for this job." });
    }

    // Add user as a candidate
    const candidate = {
      userId: user._id, // Add the userId field
      name: user.name,
      contact,
      applicationDate,
    };
    jobPost.candidates.push(candidate);
    await jobPost.save();

    res
      .status(200)
      .json({ message: "Successfully applied for the job.", jobPost });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while applying for the job." });
  }
};
