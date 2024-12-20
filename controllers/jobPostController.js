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
  const { title, description, location, job_type, skill_requirements } =
    req.body;

  try {
    const jobPost = await JobPost.findByIdAndUpdate(
      id,
      { title, description, location, job_type, skill_requirements },
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
