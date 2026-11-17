
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      rollNumber,
      casualLeave = 10,
      medicalLeave = 10
    } = req.body;

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!username || !email || !rollNumber) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format."
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email."
      });
    }

    const user = await User.create({
      username: username.trim(),
      email,
      rollNumber: String(rollNumber).trim(),
      casualLeave: Number(casualLeave),
      medicalLeave: Number(medicalLeave)
    });

    res.status(201).json({
      message: "User created successfully.",
      userId: user._id,
      username: user.username,
      rollNumber: user.rollNumber,
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(error.code === 11000 ? 409 : 500).json({
      message: error.code === 11000
        ? "Email is already registered."
        : "Server error."
    });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first."
      });
    }

    res.json({
      message: "Login successful.",
      userId: user._id,
      username: user.username,
      rollNumber: user.rollNumber,
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error."
    });
  }
});

// GET LEAVE BALANCE
router.get("/leave-balance/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json({
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid user ID."
    });
  }
});

// APPLY FOR LEAVE
router.post("/apply-leave/:id", async (req, res) => {
  try {
    const { type, days } = req.body;
    const leaveDays = Number(days);

    if (!Number.isInteger(leaveDays) || leaveDays <= 0) {
      return res.status(400).json({
        message: "Enter a valid number of leave days."
      });
    }

    if (!["casual", "medical"].includes(type)) {
      return res.status(400).json({
        message: "Invalid leave type."
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const field =
      type === "casual" ? "casualLeave" : "medicalLeave";

    if (user[field] < leaveDays) {
      return res.status(400).json({
        message: `Insufficient ${type} leave balance.`
      });
    }

    user[field] -= leaveDays;

    await user.save();

    res.json({
      message: "Leave application submitted successfully.",
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });

  } catch (error) {
    console.error("Leave application error:", error);

    res.status(400).json({
      message: "Unable to process leave application."
    });
  }
});

module.exports = router;
