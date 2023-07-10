const express = require("express");
const Model = require("../models/model");

const router = express.Router();
module.exports = router;

//Post Method
router.post("/post", async (req, res) => {
  const data = new Model({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    balance: req.body.balance,
    cbu: req.body.cbu,
    hashedPassword: req.body.hashedPassword,
    is_blocked: req.body.is_blocked,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get all Method
router.get("/getAll", async (req, res) => {
  try {
    const data = await Model.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get by ID Method
router.get("/getOne/:id", (req, res) => {
  res.send(req.params.id);
});

//Update by ID Method
router.patch("/update/:id", (req, res) => {
  res.send("Update by ID API");
});

//Delete by ID Method
router.delete("/delete/:id", (req, res) => {
  res.send("Delete by ID API");
});

//add Funds
router.patch("/addFunds", async (req, res) => {
  try {
    const email = req.body.email;
    const amount = req.body.amount;

    const data = await Model.findOneAndUpdate(
      { email: email },
      { $inc: { balance: amount } }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//retire Funds
router.patch("/retireFunds", async (req, res) => {
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
});

//checkFunds
router.get("/checkFunds", async (req, res) => {
  try {
    const email = req.params.email;
    const requiredAmount = req.params.requiredAmount;
    const data = await Model.findOne({ email: email });
    res.status(200).json(data.balance == requiredAmount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//isUser
router.get("/isUser", async (req, res) => {
  try {
    const email = req.params.email;
    const data = await Model.findOne({ email: email });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//initiateTransaction
router.patch("/initiateTransaction", async (req, res) => {
  try {
    const email = req.body.email;
    const data = await Model.findOneAndUpdate(
      { email: email },
      { $set: { is_blocked: true } }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//endTransaction
router.patch("/endTransaction", async (req, res) => {
  try {
    const email = req.body.email;
    const data = await Model.findOneAndUpdate(
      { email: email },
      { $set: { is_blocked: false } }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
