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
router.delete("/delete/", userController.deleteUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * /api/createUser:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided information.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               balance:
 *                 type: number
 *               cbu:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success - User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     cbu:
 *                       type: string
 *       400:
 *         description: Error - Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/createUser", userController.createUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * /api/addFunds:
 *   patch:
 *     summary: Add funds to user account
 *     description: Adds funds to the user account with the provided CBU and token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *               amount:
 *                 type: number
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success - Funds added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cbu:
 *                   type: string
 *                 name:
 *                   type: string
 *                 balance:
 *                   type: number
 *       404:
 *         description: No valid account or active transaction found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.patch("/addFunds", userController.addFunds);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * /api/removeFunds:
 *   patch:
 *     summary: Remove funds from user account
 *     description: Removes funds from the user account with the provided CBU and token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *               amount:
 *                 type: number
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success - Funds removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No valid account or active transaction found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.patch("/removeFunds", userController.removeFunds);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * /api/checkFunds:
 *   get:
 *     summary: Check available funds
 *     description: Checks the available funds in the user account with the provided CBU and token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *               amount:
 *                 type: number
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success - Valid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 balance:
 *                   type: number
 *       404:
 *         description: Authentication failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/checkFunds", userController.checkFunds);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * /api/getUser:
 *   get:
 *     summary: Get a user by CBU
 *     description: Retrieves a user based on their CBU.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: cbu
 *         schema:
 *           type: string
 *         required: true
 *         description: CBU (Customer Bank User) number of the user
 *     responses:
 *       200:
 *         description: Success - User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cbu:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/getUser", userController.getUser);

//verifyUser
router.post("/verifyUser", authController.verifyUser);

//privateUser
router.get("/userPrivate", authController.privateUser);

//authorizeUser
router.post("/authorizeUser", authController.authorizeUser);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management
 * /api/initiateTransaction:
 *   post:
 *     summary: Initiate a transaction
 *     description: Initiates a transaction for the user with the provided CBU.
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success - Transaction initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       403:
 *         description: User is already blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/initiateTransaction", transactionController.initiateTransaction);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management
 * /api/endTransaction:
 *   post:
 *     summary: End an active transaction
 *     description: Ends an active transaction for the user with the provided CBU.
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success - Transaction finalized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     field1:
 *                       type: string
 *                     field2:
 *                       type: string
 *       404:
 *         description: No active transaction found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/endTransaction", transactionController.endTransaction);

module.exports = router;
