const express = require("express");
const mongoose = require("mongoose");
const Model = require("../models/users");

module.exports.initiateTransaction = async (req, res) => {
  try {
    const cbu = req.body.cbu;
    const status = await Model.findOne({ cbu: cbu }).is_blocked;

    if (!status) {
      const data = await Model.findOneAndUpdate(
        { cbu: cbu },
        { $set: { is_blocked: true } }
      );
      console.log(data);
      res.status(200).json("Transaction initiated");
    } else {
      res.status(403).json({ message: "User is already blocked" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.endTransaction = async (req, res) => {
  try {
    const cbu = req.body.cbu;
    const status = await Model.findOne({ cbu: cbu }).is_blocked;
    if (status) {
      const data = await Model.findOneAndUpdate(
        { cbu: cbu },
        { $set: { is_blocked: false } }
      );
      res.status(200).json({ message: "Transaction finalized", data: data });
    } else {
      res.status(404).json({ message: "No active transaction found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
