const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    secret: { type: String, required: true }, // Store the TOTP secret
    password: { type: String, required: true },

});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
