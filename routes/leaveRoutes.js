const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register a user
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      rollNumber,
      casualLeave = 10,
      medicalLeave = 10
    } = req.body;

    if (!username?.trim() || !email?.trim() || !rollNumber?.trim()) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const casual = Number(casualLeave);
    const medical = Number(medicalLeave);

    if (
      !Number.isInteger(casual) || !Number.isInteger(medical) ||
      casual < 0 || medical < 0
    ) {
      return res.status(400).json({
        message: "Leave balances must be non-negative whole numbers"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email"
      });
    }

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      rollNumber: rollNumber.trim(),
      casualLeave: casual,
      medicalLeave: medical
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists with this email"
      });
    }
    return res.status(500).json({
      message: "Server error while registering user"
    });
  }
});

// Login using email (demo/classroom use only)
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first."
      });
    }

    return res.json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      rollNumber: user.rollNumber,
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get leave balance
router.get("/leave-balance/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
});

// Apply for leave: deduct requested days from balance
router.post("/apply-leave/:id", async (req, res) => {
  try {
    const { type, days } = req.body;
    const leaveDays = Number(days);

    if (!Number.isInteger(leaveDays) || leaveDays <= 0) {
      return res.status(400).json({
        message: "Enter a valid positive number of days"
      });
    }

    if (!["casual", "medical"].includes(type)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const balanceField = type === "casual" ? "casualLeave" : "medicalLeave";

    if (user[balanceField] < leaveDays) {
      return res.status(400).json({
        message: "Insufficient leave balance"
      });
    }

    user[balanceField] -= leaveDays;
    await user.save();

    return res.json({
      message: "Leave applied successfully",
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });
  } catch (error) {
    console.error("Apply leave error:", error);
    return res.status(400).json({
      message: "Unable to apply for leave"
    });
  }
});

module.exports = router;
