const JobPost = require("../models/JobPost");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../models/Company");

const JWT_SECRET = process.env.JWT_SECRET;

exports.signUp = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      linkedin,
      facebook,
      twitter,
      password,
    } = req.body;

    // Check if the company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res
        .status(400)
        .json({ message: "Company already exists with this email." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new company
    const newCompany = new Company({
      name,
      email,
      phone,
      address,
      linkedin,
      facebook,
      twitter,
      password: hashedPassword,
    });

    // Save to the database
    await newCompany.save();

    res.status(201).json({ message: "Company registered successfully!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the company by email
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: company._id, email: company.email },
      JWT_SECRET,
      { expiresIn: "1d" } // Token valid for 1 day
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error." });
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
