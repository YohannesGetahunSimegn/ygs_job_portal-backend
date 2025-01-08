const JobPost = require("../models/JobPost");

exports.createJobPost = async (req, res) => {
  const {
    jobTitle,
    location,
    jobType,
    description,
    vacancy,
    email,
    companyName,
    companyWebsite,
    expires_at,
    pay,
    skills,
  } = req.body;

  const admin_id = req.user?.userId; // Retrieve authenticated user's ID

  // Check if the user is authenticated
  if (!admin_id) {
    return res.status(401).json({ message: "Unauthorized: Admin ID required" });
  }

  // Ensure all required fields are provided
  if (!jobTitle || !location || !jobType || !email || !companyName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create a new job post instance
    const jobPost = new JobPost({
      jobTitle,
      location,
      jobType,
      description,
      vacancy,
      email,
      companyName,
      companyWebsite,
      admin_id,
      expires_at,
      pay,
      skills,
    });

    // Save the job post to the database
    await jobPost.save();

    res.status(201).json({ message: "Job post created successfully", jobPost });
  } catch (error) {
    console.error("Error creating job post:", error);
    // Check for validation errors and respond accordingly
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", error: error.message });
    }
    res
      .status(500)
      .json({ message: "Error creating job post", error: error.message });
  }
};

// Get all job posts (admin-only can see unapproved jobs)
exports.getAllJobPosts = async (req, res) => {
  const filter = req.user?.role === "admin" ? {} : { approved: true };

  try {
    const jobPosts = await JobPost.find(filter)
      .populate("admin_id", "name email") // Fetch admin's name and email
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();

    res.status(200).json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job posts", error });
  }
};

// Approve a job post (admin only)
exports.approveJobPost = async (req, res) => {
  const { id } = req.params;

  try {
    const jobPost = await JobPost.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ message: "Job post approved", jobPost });
  } catch (error) {
    res.status(500).json({ message: "Error approving job post", error });
  }
};

// Update a job post (admin only)
exports.updateJobPost = async (req, res) => {
  const { id } = req.params;
  const {
    jobTitle,
    location,
    jobType,
    description,
    skills,
    vacancy,
    email,

    companyName,
    companyWebsite,
    pay,
  } = req.body;

  try {
    const jobPost = await JobPost.findByIdAndUpdate(
      id,
      {
        jobTitle,
        location,
        jobType,
        description,
        skills,
        vacancy,
        email,

        companyName,
        companyWebsite,
        pay,
      },
      { new: true }
    );

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ message: "Job post updated", jobPost });
  } catch (error) {
    res.status(500).json({ message: "Error updating job post", error });
  }
};

// Delete a job post (admin only)
exports.deleteJobPost = async (req, res) => {
  const { id } = req.params;

  try {
    const jobPost = await JobPost.findByIdAndDelete(id);

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ message: "Job post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job post", error });
  }
};

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

    // Check if the application is already in hiredCandidates or rejectedCandidates
    const isInHired = jobPost.hiredCandidates.some(
      (candidate) => candidate._id.toString() === applicationId
    );
    const isInRejected = jobPost.rejectedCandidates.some(
      (candidate) => candidate._id.toString() === applicationId
    );

    if (isInHired || isInRejected) {
      return res.status(400).json({ message: "Application already processed" });
    }

    // Find the application within the candidates array
    const candidateIndex = jobPost.candidates.findIndex(
      (candidate) => candidate._id.toString() === applicationId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Extract the candidate from the candidates array
    const [candidate] = jobPost.candidates.splice(candidateIndex, 1);

    // Update the status of the candidate
    candidate.status = status;

    // Move the candidate to the corresponding list (hired or rejected)
    if (status === "accepted") {
      jobPost.hiredCandidates.push(candidate);
    } else if (status === "rejected") {
      jobPost.rejectedCandidates.push(candidate);
    }

    // Save the job post with the updated candidate lists
    await jobPost.save();

    res.status(200).json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
