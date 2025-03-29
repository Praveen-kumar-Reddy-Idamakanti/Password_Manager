require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const authRoutes = require("./Routes/authRoutes");
const User = require("./models/User");
const Credential = require("./models/Credentials");
const app = express();
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8080", // Change to frontend URL
    credentials: true, // Allow sending cookies
  })
);


// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/my_password_manager", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Register Route
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const secret = speakeasy.generateSecret().base32;
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ email, password: hashedPassword, secret }).save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" }); // ✅ Return here
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.json({ token, user }); // ✅ Return here
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" }); // ✅ Return error response
  }
});



// Middleware for Authentication


const verifyToken = (req, res, next) => {
  console.log(req.cookies);
  const token = req.cookies.token; // Read from cookies
  console.log(token)
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};


// CRUD Routes for Credentials

// Get all credentials
app.get("/api/credentials", verifyToken, async (req, res) => {
  const credentials = await Credential.find({ userId: req.userId });
  res.json(credentials);
});

// Add a new credential
app.post("/api/credentials", verifyToken, async (req, res) => {
  const newCredential = new Credential({ ...req.body, userId: req.userId });
  await newCredential.save();
  res.json(newCredential);
});

// Update a credential
app.put("/api/credentials/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!id || id.length !== 24) {
    return res.status(400).json({ error: "Invalid ID provided" });
  }

  try {
    const updatedCredential = await Credential.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedCredential) {
      return res.status(404).json({ error: "Credential not found" });
    }

    res.json(updatedCredential);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a credential
app.delete("/api/credentials/:id", verifyToken, async (req, res) => {
  console.log("Headers received:", req.headers); // Debugging
  console.log("Deleting credential ID:", req.params.id);

  try {
    const deletedCredential = await Credential.findByIdAndDelete(req.params.id);
    if (!deletedCredential) {
      return res.status(404).json({ message: "Credential not found" });
    }
    res.json({ message: "Credential deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict", secure: process.env.NODE_ENV === "production" });
  res.json({ message: "Logged out successfully" });
});
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        mfaCompleted: user.mfaCompleted || {
          password: false,
          biometrics: false,
          googleAuth: false,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.use("/auth",authRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
