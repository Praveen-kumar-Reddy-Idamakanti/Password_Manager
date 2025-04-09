const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User=require("../models/User")
const router = express.Router();

// Generate QR code and secret for Google Authenticator
router.post("/generate", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "email is required" });
    }

    const secret = speakeasy.generateSecret({
        name: `PasswordVault:${email}`,
    });

    try {
        // Store the secret in MongoDB
        await User.findOneAndUpdate(
            { email },
            { secret: secret.base32 },
            { upsert: true, new: true }
        );

        // Generate QR Code
        qrcode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
            if (err) return res.status(500).json({ error: "Error generating QR code" });

            res.json({ qrCodeUrl: imageUrl, secret: secret.base32 });
        });
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error.message });
    }
});

// Verify OTP
router.post("/verify", async (req, res) => {
    
    const { email, token } = req.body;
    //console.log(email,token);
    if (!email || !token) {
        return res.status(400).json({ error: "email and token are required" });
    }

    try {
        const user = await User.findOne({ email:email });

       
        const secret = user.secret; // Replace with actual stored secret

//console.log("TOTP Codes for Different Time Steps:");
for (let i = -3; i <= 3; i++) {  // Generate for past (-3) to future (+3) windows
    const token = speakeasy.totp({
        secret,
        encoding: "base32",
        step: 30,  // Default step size is 30 seconds
        time: Math.floor(Date.now() / 1000) + i * 30  // Shift time for different windows
    });
   // console.log(`Window ${i}: ${token}`);
}
        //console.log(user);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        
        const verified = speakeasy.totp.verify({
            secret: user.secret,
            encoding: "base32",
            token,
            window: 3, // Allows time drift
        });
        // console.log("Stored Secret:", user.secret);
        // console.log("Received OTP:", token);
        // console.log("OTP verification result:", verified);
        if (verified) {
            res.json({ success: true, message: "OTP verified successfully" });
        } else {
            res.status(400).json({ error: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error.message });
    }
});
const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // Read from cookies
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.userId = decoded.id;
      next();
    });
  };
router.get("/me", verifyToken, async (req, res) => {
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
  

module.exports = router;
