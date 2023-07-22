const express = require("express");
const Model = require("../models/users");
const userController = require("../controllers/users");
const authController = require("../controllers/auth");
const transactionController = require("../controllers/transactions");

const router = express.Router();

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

//createUser
router.post("/createUser", userController.createUser);

//add Funds
router.patch("/addFunds", userController.addFunds);

//retire Funds
router.patch("/removeFunds", userController.removeFunds);

//checkFunds
router.get("/checkFunds", userController.checkFunds);

//isUser
router.get("/isUser", userController.isUser);

//getUser
router.get("/getUser", userController.getUser);

//verifyUser
router.post("/verifyUser", authController.verifyUser);

//initiateTransaction
router.patch("/initiateTransaction", transactionController.initiateTransaction);

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

module.exports = router;
