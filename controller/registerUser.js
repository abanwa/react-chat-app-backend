const UserModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");

async function registerUser(req, res) {
  try {
    const { name, email, password, profile_pic } = req.body;
    const checkEmail = await UserModel.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({
        message: "User already exist",
        error: true
      });
    }

    // Hash Password
    const salt = await bcryptjs.genSalt(10);
    const hashpassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      profile_pic,
      password: hashpassword
    };

    const user = new UserModel(payload);

    if (!user) {
      return res.status(400).json({
        message: "User could not be saved",
        error: true
      });
    }

    const userSave = await user.save();

    // remove the password before we return it to client
    userSave.password = null;

    return res.status(201).json({
      message: "User created successfully",
      data: userSave,
      success: true
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = registerUser;
