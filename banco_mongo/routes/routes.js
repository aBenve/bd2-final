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
 * /addFunds:
 *   patch:
 *     summary: Add funds to user's account.
 *     description: Adds the specified amount to the user's balance if the provided credentials and transaction details are valid.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *                 description: The unique identifier of the user's account.
 *               amount:
 *                 type: number
 *                 description: The amount to be added to the user's balance.
 *               secretToken:
 *                 type: string
 *                 description: The secret token of the user for authentication.
 *               transactionId:
 *                 type: string
 *                 description: The unique identifier of the transaction to be added.
 *             required:
 *               - cbu
 *               - amount
 *               - secretToken
 *               - transactionId
 *     responses:
 *       '200':
 *         description: Successfully added funds to the user's balance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: A description of the success message.
 *       '400':
 *         description: Invalid request or authentication failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message describing the issue.
 *       '404':
 *         description: No valid account or active transaction found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating that the account or transaction was not found.
 */
router.patch("/addFunds", userController.addFunds);

/**
 * @swagger
 * /removeFunds:
 *   patch:
 *     summary: Remove funds from user's account.
 *     description: Deducts the specified amount from the user's balance if the provided credentials and transaction details are valid.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *                 description: The unique identifier of the user's account.
 *               amount:
 *                 type: number
 *                 description: The amount to be deducted from the user's balance.
 *               secretToken:
 *                 type: string
 *                 description: The secret token of the user for authentication.
 *               transactionId:
 *                 type: string
 *                 description: The unique identifier of the transaction to be deducted.
 *             required:
 *               - cbu
 *               - amount
 *               - secretToken
 *               - transactionId
 *     responses:
 *       '200':
 *         description: Successfully deducted funds from the user's balance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: A description of the success message.
 *       '400':
 *         description: Invalid request or authentication failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message describing the issue.
 *       '404':
 *         description: No valid account or active transaction found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating that the account or transaction was not found.
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
 * /initiateTransaction:
 *   post:
 *     summary: Initiate a transaction for user's account.
 *     description: Initiates a transaction for the user's account with the specified amount if the provided credentials are valid and there is no active transaction.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cbu:
 *                 type: string
 *                 description: The unique identifier of the user's account.
 *               amount:
 *                 type: number
 *                 description: The amount to be transacted in the initiated transaction.
 *               secretToken:
 *                 type: string
 *                 description: The secret token of the user for authentication.
 *             required:
 *               - cbu
 *               - amount
 *               - secretToken
 *     responses:
 *       '200':
 *         description: Successfully initiated the transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: A description of the success message.
 *                 transactionId:
 *                   type: string
 *                   description: The unique identifier of the initiated transaction.
 *       '400':
 *         description: Authentication failure or invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: An error message describing the issue.
 *       '403':
 *         description: An active transaction already exists, transaction to the same account, or insufficient funds for the operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: An error message indicating the reason for the failure.
 */
router.post("/initiateTransaction", transactionController.initiateTransaction);

/**
 * @swagger
 * /endTransaction:
 *   post:
 *     summary: End an active transaction for user's account.
 *     description: Ends an active transaction for the user's account with the specified transaction ID if it exists and the user's account is blocked.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: The unique identifier of the transaction to be ended.
 *             required:
 *               - transactionId
 *     responses:
 *       '200':
 *         description: Successfully ended the transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: A description of the success message.
 *       '400':
 *         description: Authentication failure or invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: An error message describing the issue.
 *       '404':
 *         description: No active transaction found for the specified transaction ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   description: An error message indicating that the transaction was not found.
 */
router.post("/endTransaction", transactionController.endTransaction);

module.exports = router;
