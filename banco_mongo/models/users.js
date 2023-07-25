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
  secret_token: {
    required: true,
    type: String,
  },
  transaction: {
    transactionID: {
      type: String,
    },
    amount: {
      type: Number,
    },
  },
});

module.exports = mongoose.model("Data", dataSchema);
