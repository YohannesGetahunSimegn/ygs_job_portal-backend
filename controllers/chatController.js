const Message = require("../models/Message");

// get users who sent messages
exports.getUserMessages = async (req, res) => {
  try {
    const users = await Message.aggregate([
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $last: "$content" },
          lastTimestamp: { $last: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming you have a users collection
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          userDetails: { $arrayElemAt: ["$userDetails", 0] }, // Include user details
        },
      },
      {
        $match: {
          "userDetails.role": { $ne: "admin" }, // Exclude users with role 'admin'
        },
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          userDetails: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            phone: 1,
            avator: 1,
            gender: 1,
            address: 1,
            birthdate: 1,
            isVerified: 1,
          }, // Exclude 'otp' field here
        },
      },
      { $sort: { lastTimestamp: -1 } }, // Sort by most recent messages
    ]);

    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

//  to get chat between admin and user
exports.getChat = async (req, res) => {
  const { userId, adminId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 }); // Sort by oldest first
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// to send message from user to admin or vice versa
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  // Validate required fields
  if (!senderId || !receiverId || !content) {
    return res
      .status(400)
      .json({ error: "Sender, receiver, and content are required" });
  }

  try {
    // Save the message to the database
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
    });
    await newMessage.save();

    // Access activeUsers map from app instance
    const activeUsers = req.app.get("activeUsers");

    // Emit the message to the recipient if they're online
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      const io = req.app.get("io"); // Access io from app instance
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send message", details: error.message });
  }
};
