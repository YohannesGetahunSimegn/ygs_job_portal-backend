const User = require("../models/User");

// Controller to list all users
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users and return only the necessary fields (name, email, role, isVerified)
    const users = await User.find().select("name email role isVerified");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
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

//Get all applied jobs by a single user

exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query to find jobs where the user is a candidate
    const appliedJobs = await JobPost.find(
      { "candidates._id": userId }, // Check if user ID exists in the candidates array
      {
        jobTitle: 1,
        companyName: 1,
        pay: 1,
      }
    ).lean();

    if (!appliedJobs || appliedJobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No applied jobs found for this user." });
    }

    // Return the applied jobs as a response
    res.status(200).json(appliedJobs);
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
