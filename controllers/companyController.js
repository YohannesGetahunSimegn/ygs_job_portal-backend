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
