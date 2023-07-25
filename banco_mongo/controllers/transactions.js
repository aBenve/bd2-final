const express = require("express");
const mongoose = require("mongoose");
const Model = require("../models/users");

module.exports.initiateTransaction = async (req, res) => {
  try {
    const cbu = req.body.cbu;
    const amount = req.body.amount;
    const token = req.body.secretToken;
    const data = await Model.findOne({ cbu: cbu, secret_token: token });
    if (data) {
      if (!data.is_blocked) {
        const transactionID = uuidv4();
        const data = await Model.findOneAndUpdate(
          { cbu: cbu, secret_token: token },
          {
            $set: {
              is_blocked: true,
              transaction: { transactionID: transactionID, amount: amount },
            },
          }
        );
        console.log(data);
        res.status(200).json({
          description: "Transaction initiated",
          transactionId: data.transactionID,
        });
      } else {
        res.status(403).json({
          description:
            "There’s already an active transaction, transaction is to the same account, or there aren’t enough funds for the operation",
        });
      }
    } else {
      res.status(400).json({ description: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.endTransaction = async (req, res) => {
  try {
    const transactionId = req.body.transactionId;
    const user = await Model.findOne({
      "transaction.transactionID": transactionId,
      is_blocked: true,
    });
    if (user) {
      const data = await Model.findOneAndUpdate(
        { cbu: cbu },
        { $set: { is_blocked: false }, $unset: { transaction: "" } }
      );
      res.status(200).json({ description: "Transaction finalized" });
    } else {
      res.status(404).json({ description: "No active transaction found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
