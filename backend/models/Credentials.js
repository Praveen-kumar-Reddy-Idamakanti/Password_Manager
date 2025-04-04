const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String},
  username: { type: String, required: true },
  password: { type: String, required: true },
  url: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  iv: {type: String},       // AES IV
});

module.exports = mongoose.model("Credential", CredentialSchema);
