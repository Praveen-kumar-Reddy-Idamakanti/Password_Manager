const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const router = express.Router();

// Store user secrets (Replace with DB storage in production)
const userSecrets = {};

// Generate QR code and secret for Google Authenticator
router.post("/generate", async (req, res) => {
    const { username } = req.body; // Get username from request

    const secret = speakeasy.generateSecret({
        name: `PasswordVault:${username}`
    });

    // Store secret (Replace with a DB in production)
    userSecrets[username] = secret.base32;

    // Generate QR Code URL
    const otpAuthUrl = secret.otpauth_url;

    // Generate QR Code
    qrcode.toDataURL(otpAuthUrl, (err, imageUrl) => {
        if (err) return res.status(500).json({ error: "Error generating QR code" });

        res.json({ qrCodeUrl: imageUrl, secret: secret.base32 });
    });
});

// Verify OTP
router.post("/verify", (req, res) => {
    const { username, token } = req.body;
    
    const secret = userSecrets[username];
    if (!secret) return res.status(400).json({ error: "User not found" });

    const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 1 // Allows 1 previous and 1 next token for time drift
    });

    console.log("Stored Secret:", secret);
    console.log("Received OTP:", token);
    console.log("OTP verification result:", verified);

    if (verified) {
        console.log(success);
        res.json({ success: true, message: "OTP verified successfully" });
    } else {
        res.status(400).json({ error: "Invalid OTP" });
    }
});

module.exports = router;
