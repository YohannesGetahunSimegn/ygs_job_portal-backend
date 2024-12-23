const Company = require("../models/Company");

exports.getCompany = async (req, res) => {
  try {
    // Fetch only verified users and select necessary fields
    const companies = await Company.find();

    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch companies", error });
  }
};
