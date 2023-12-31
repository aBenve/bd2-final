const express = require("express");
const Model = require("../models/users");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { log } = require("console");

//* DONE
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

module.exports.deleteUser = async (req, res) => {
  try{
    console.log("here")
    const r = await Model.deleteOne({name: req.body.name});
    console.log("Dfsdfsdafdasf", r)
    res.send()
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

//* DONE
module.exports.getUser = async (req, res) => {
  const cbu = req.query.cbu;
  try {
    const data = await Model.findOne({ cbu: cbu });
    if (data) {
      res.status(200).json({cbu: data.cbu, name: data.name });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//* DONE
module.exports.isUser = async (req, res) => {
  console.log("Here")
  const cbu = req.query.cbu;
  try {
    const data = await Model.findOne({ cbu });
    console.log("ADFDSAFADS")
    res.status(200);
    res.send()
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports.addFunds = async (req, res) => {
  try {
    const cbu = req.body.cbu;
    const amount = req.body.amount;
    const token = req.body.secretToken;
    const transactionID = req.body.transactionId;

    const data = await Model.findOneAndUpdate(
      {
        cbu: cbu,
        secret_token: token,
        is_blocked: true,
        "transaction.transactionID": transactionID,
        "transaction.amount": { $eq: amount },
      },
      { $inc: { balance: amount } },
      {new: true}
    );
    if (data) {
      res.status(200).json({ description: "Funds added" });
    } else {
      res
        .status(404)
        .json({ description: " No valid account or active transaction found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.removeFunds = async (req, res) => {
  try {
    const cbu = req.body.cbu;
    const amount = req.body.amount;
    const token = req.body.secretToken;
    const transactionID = req.body.transactionId;
    console.log("removeFunds", {
      cbu,
      amount,
      token,
      transactionID})
    const data = await Model.findOneAndUpdate(
      {
        cbu: cbu,
        secret_token: token,
        is_blocked: true,
        "transaction.transactionID": transactionID,
        "transaction.amount": { $eq: amount },
      },
      { $inc: { balance: -amount } },
      {new: true}
    );
    console.log("After Update", data);
    if (data) {
      res.status(200).json({ description: "Valid credentials" });
    } else {
      res
        .status(404)
        .json({ message: " No valid account or active transaction found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//* DONE
module.exports.checkFunds = async (req, res) => {
  try {
    const cbu = req.query.cbu;
    // const amount = req.query.amount;
    const token = req.query.secretToken;
    const data = await Model.findOne({ cbu: cbu, secret_token: token });
    if (data) {
      // if (data.balance >= amount) {
      res.status(200).send(data.balance + '');
      // } else {
      //   res.status(404).json({ message: "Insufficient funds" });
      // }
    } else {
      res.status(400).json({ message: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
