const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  aboutCompany: { type: String, required: true },
  jobTitle: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  workplace: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  skills: { type: [String], required: true },
  employee: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  expires_at: {
    type: String,
    required: true,
  },

  website: {
    type: String,
  },
  socialMedialLink: {
    type: String,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Company", companySchema);
