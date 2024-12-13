require("dotenv").config();
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobPostRoutes = require("./routes/jobPostRoutes"); // New job routes
const userManageRoutes = require("./routes/userManageRoutes"); // manage user route
const jobRoutes = require("./routes/jobRoutes"); // job application route
const hiringCompanyRoutes = require("./routes/hiringCompanyRoutes");

require("./config/PassportConfig");

const app = express();

// Configure session
app.use(
  session({
    secret: "your_unsecret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", authRoutes);
app.use("/api/jobs", jobPostRoutes); // New route for job functionalities
app.use("/api/admin", userManageRoutes); // for admin to manage users
app.use("/api/user", jobRoutes); // for users to apply to a job posting
// app.use("/api/company", hiringCompanyRoutes); // for hiring company

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
