require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");

const authRoutes = require("./Routes/authRoutes");
const router = express.Router(); // ✅ Define router
const app = express();
const User=require("./models/User")

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/my_passwword_manager", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));




// Register Route
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }
    const secret = speakeasy.generateSecret().base32;
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ email, password: hashedPassword,secret }).save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password)
  
    try {
        console.log("hello");

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid email or password" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });
  
      // Update MFA status
      await user.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Auth Routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
