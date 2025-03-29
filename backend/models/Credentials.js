const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  url: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Credential", CredentialSchema);
