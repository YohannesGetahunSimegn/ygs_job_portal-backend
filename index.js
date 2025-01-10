require("dotenv").config();
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobPostRoutes = require("./routes/jobPostRoutes"); // New job routes
const userManageRoutes = require("./routes/userManageRoutes"); // manage user route
const manageCompanyRoutes = require("./routes/companyManagementRoute"); // manage company route
const jobRoutes = require("./routes/jobRoutes"); // job application route
const companyRoutes = require("./routes/companyRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");

require("./config/PassportConfig");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to match your client's URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set io as a property of the app
app.set("io", io);

// Socket.IO integration
const activeUsers = new Map(); // Map to store online users
app.set("activeUsers", activeUsers); // Set activeUsers as a property of the app

// Socket.IO Integration
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register user when they join
  socket.on("join", ({ userId }) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ID: ${socket.id}`);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

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
app.use("/api/chat", chatRoutes); // chat user and admin
app.use("/api", authRoutes);
app.use("/api/jobs", jobPostRoutes); // New route for job functionalities
app.use("/api/admin", userManageRoutes); // for admin to manage users
app.use("/api/admin", manageCompanyRoutes); // for admin to manage companies
app.use("/api/user", jobRoutes); // for users to apply to a job posting
app.use("/api/company", companyRoutes); // for hiring company

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
