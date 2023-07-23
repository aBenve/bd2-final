const Model = require("../models/users");

module.exports.authorizeUser = async (req, res) => {
  const { cbu, password } = req.body;
  try {
    const data = await Model.findOne({ cbu: cbu });
    if (await bcrypt.compare(password, data.hashedPassword)) {
      res.status(200).json({
        message: "User authorized",
        content: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          secret_token: data.secret_token,
        },
      });
    } else {
      res.status(400).json({ message: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.verifyUser = async (req, res) => {
  const { cbu, secret_token } = req.body;
  try {
    const data = await Model.findOne({ cbu: cbu, secret_token: secret_token });
    if (data) {
      res.status(200).json({ message: "Valid Credentials" });
    } else {
      res.status(400).json({ message: "Authentication failures" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.privateUser = async (req, res) => {
  const { cbu, token } = req.body;
  try {
    const data = await Model.findOne({ cbu: cbu, secret_token: token });
    if (data) {
      res.status(200).json({
        message: "User found",
        content: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
      });
    } else {
      res.status(400).json({ message: "Authentication failure" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
