const express = require("express");
const Model = require("../models/users");
const bcrypt = require("bcryptjs");

module.exports.createUser = async (req, res) => {
  let hashedPassword = await bcrypt.hash(req.body.password, 8);

  const data = new Model({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    balance: req.body.balance,
    cbu: req.body.cbu,
    hashedPassword: hashedPassword,
    is_blocked: req.body.is_blocked,
    secret_token: crypto.randomUUID(),
  });
  try {
    const dataToSave = await data.save();
    delete dataToSave.hashedPassword;
    res.status(200).json({ message: "User created", data: dataToSave });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.getUser = async (req, res) => {
  const cbu = req.params.cbu;
  try {
    const data = Model.findOne({ cbu: cbu });
    res.status(200).json({ cbu: data.cbu, name: data.name });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports.isUser = async (req, res) => {
  const cbu = req.params.cbu;
  try {
    const data = Model.findOne({ cbu: cbu });
    res.status(200);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports.addFunds = async (req, res) => {
  try {
    const email = req.body.email;
    const amount = req.body.amount;
    const transactionID = req.body.transactionID;

    const data = await Model.findOneAndUpdate(
      { email: email },
      { $inc: { balance: amount } }
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.removeFunds = async (req, res) => {
  try {
    const email = req.body.email;
    const amount = req.body.amount;
    const data = await Model.findOneAndUpdate(
      { email: email },
      { $inc: { balance: -amount } }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.checkFunds = async (req, res) => {
  try {
    const email = req.body.email;
    const amount = req.body.amount;
    const data = await Model.findOneAndUpdate(
      { email: email },
      { $inc: { balance: -amount } }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
