// const JobPost = require("../models/JobPost");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const Company = require("../models/Company");

exports.submitJobPost = async (req, res) => {
  try {
    const {
      aboutCompany,
      companyLocation,
      jobTitle,
      jobLocation,
      jobType,
      workplace,
      jobDescription,
      skills,
      employee,
      email,
      phone,
      companyName,
      expires_at,
      website,
      socialMedialLink,
    } = req.body;

    if (
      !aboutCompany ||
      !companyLocation ||
      !jobTitle ||
      !jobLocation ||
      !jobType ||
      !workplace ||
      !jobDescription ||
      !skills ||
      !employee ||
      !email ||
      !phone ||
      !companyName ||
      !expires_at
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      const newJobPost = await Company.findByIdAndUpdate(
        id,
        {
          aboutCompany,
          companyLocation,
          jobTitle,
          jobLocation,
          jobType,
          workplace,
          jobDescription,
          skills,
          employee,
          email,
          phone,
          companyName,
          expires_at,
          website,
          socialMedialLink,
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "job is accepted successfully!", newJobPost });
    }

    const newCompany = new Company({
      aboutCompany,
      companyLocation,
      jobTitle,
      jobLocation,
      jobType,
      workplace,
      jobDescription,
      skills,
      employee,
      email,
      phone,
      companyName,
      expires_at,
      website,
      socialMedialLink,
    });

    await newCompany.save();
    return res.status(201).json({ message: " job is accepted successfully!" });
  } catch (error) {
    console.error("Failed to accept the form ", error);
  }
};

// const JWT_SECRET = process.env.JWT_SECRET;

// exports.signUp = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       address,
//       linkedin,
//       facebook,
//       twitter,
//       password,
//     } = req.body;

//     // Check if the company already exists
//     const existingCompany = await Company.findOne({ email });
//     if (existingCompany) {
//       return res
//         .status(400)
//         .json({ message: "Company already exists with this email." });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new company
//     const newCompany = new Company({
//       name,
//       email,
//       phone,
//       address,
//       linkedin,
//       facebook,
//       twitter,
//       password: hashedPassword,
//     });

//     // Save to the database
//     await newCompany.save();

//     res.status(201).json({ message: "Company registered successfully!" });
//   } catch (error) {
//     console.error("Error during signup:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the company by email
//     const company = await Company.findOne({ email });
//     if (!company) {
//       return res.status(404).json({ message: "Company not found." });
//     }

//     // Compare passwords
//     const isPasswordValid = await bcrypt.compare(password, company.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Generate a JWT token
//     const token = jwt.sign(
//       { id: company._id, email: company.email },
//       JWT_SECRET,
//       { expiresIn: "1d" } // Token valid for 1 day
//     );

//     res.status(200).json({
//       message: "Login successful!",
//       token,
//       company: {
//         id: company._id,
//         name: company.name,
//         email: company.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };
