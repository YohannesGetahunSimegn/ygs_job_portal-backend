const JobPost = require("../models/JobPost");
const User = require("../models/User");

// Controller to list all users
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch only verified users and select necessary fields
    const users = await User.find({ isVerified: true, role: "user" }).select(
      "name email role isVerified"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch verified users", error });
  }
};

// Controller to deactivate a user
exports.deactivateUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Deactivate the user by setting isVerified to false
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deactivated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate user", error });
  }
};

// Controller to activate a user
exports.activateUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Activate the user by setting isVerified to true
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User activated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to activate user", error });
  }
};

// to get one user
exports.getOneUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// Admin:  Get all applied jobs by a single user
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query to find jobs where the userId exists in the candidates array, and fetch applicationDate
    const appliedJobs = await JobPost.find(
      { "candidates.userId": userId }, // Filter jobs by userId in candidates
      {
        jobTitle: 1,
        companyName: 1,
        pay: 1,
        "candidates.$": 1, // Get the candidate object that matches the userId
      }
    ).lean();

    // Check if there are no applied jobs for the user
    if (!appliedJobs || appliedJobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No applied jobs found for this user." });
    }

    // Extract the applicationDate from the candidates array
    const jobsWithApplicationDate = appliedJobs.map((job) => {
      const candidate = job.candidates[0]; // There should be only one candidate matching the userId
      return {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        pay: job.pay,
        applicationDate: candidate.applicationDate,
        candidateName: candidate.name,
        status: candidate.status,
      };
    });

    const sortedJobs = jobsWithApplicationDate.sort(
      (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
    );

    // Return the applied jobs with application date as a response
    res.status(200).json(sortedJobs);
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
