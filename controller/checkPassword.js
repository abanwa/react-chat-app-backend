const UserModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function checkPassword(req, res) {
  try {
    const { password, userId } = req.body;
    const user = await UserModel.findById(userId);
    const verifyPassword = await bcryptjs.compare(password, user.password);

    if (!verifyPassword) {
      return res.status(400).json({
        message: "please check password",
        error: true
      });
    }

    const tokenData = {
      id: user._id,
      email: user.email
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "90d"
    });

    const cookieOption = {
      maxAge: 90 * 24 * 60 * 60 * 1000, // Milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development"
    };

    return res.cookie("token", token, cookieOption).status(200).json({
      message: "Login successfully",
      token,
      success: true
    });
  } catch (err) {
    console.log("checkPassword Error in contoller : ", err.message);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = checkPassword;
