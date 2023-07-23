const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  phone: {
    required: true,
    type: Number,
    unique: true,
  },
  balance: {
    required: true,
    type: Number,
  },
  cbu: {
    required: true,
    type: Number,
    unique: true,
  },
  hashedPassword: {
    required: true,
    type: String,
  },
  is_blocked: {
    required: true,
    type: Boolean,
  },
});

module.exports = mongoose.model("Data", dataSchema);