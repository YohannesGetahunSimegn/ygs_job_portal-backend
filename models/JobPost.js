const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  applicationDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

const jobPostSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  location: { type: String },
  jobType: { type: String, required: true },
  description: { type: String },
  skills: { type: [String], required: true },
  vacancy: { type: Number },
  email: { type: String },
  companyName: { type: String, required: true },
  companyWebsite: { type: String, default: null },
  pay: { type: String }, // Field for pay value
  candidates: [candidateSchema],
  rejectedCandidates: [candidateSchema],
  hiredCandidates: [candidateSchema],
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Linked to User
  createdAt: { type: Date, default: Date.now },
  expires_at: { type: Date },
});

module.exports = mongoose.model("JobPost", jobPostSchema);
