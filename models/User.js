const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  googleId: String,
  otp: String,
  isVerified: { type: Boolean, default: false },
  phone: String,
  gender: String,
  address: String,
  birthdate: String,
  avatar: String,
});

module.exports = mongoose.model("User", userSchema);
