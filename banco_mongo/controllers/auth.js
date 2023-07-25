const Model = require("../models/users");
const bcrypt = require("bcryptjs");

module.exports.authorizeUser = async (req, res) => {
  console.log(req.body);
  const { cbu, password } = req.body;
  console.log("cbu", cbu)
  console.log("password", password);
  try {
    const data = await Model.findOne({ cbu: cbu });
    if (await bcrypt.compare(password, data.hashedPassword)) {
      res.status(200).json({
          name: data.name,
          email: data.email,
          phoneNumber: data.phone,
          secretToken: data.secret_token,
      });
    } else {
      res.status(400).json({ description: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.verifyUser = async (req, res) => {
  const { cbu, secretToken } = req.body;
  try {
    const data = await Model.findOne({ cbu: cbu, secret_token: secretToken });
    if (data) {
      res.status(200).json({ description: "Valid Credentials" });
    } else {
      res.status(400).json({ description: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.privateUser = async (req, res) => {
  const { cbu, token } = req.query;
  try {
    const data = await Model.findOne({ cbu: cbu, secret_token: token });
    if (data) {
      res.status(200).json({
          name: data.name,
          email: data.email,
          phoneNumber: data.phone
        });
    } else {
      res.status(400).json({ description: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
