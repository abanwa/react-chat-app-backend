const UserModel = require("../models/userModel");

async function checkEmail(req, res) {
  try {
    const { email } = req.body;
    // we will not select the password
    const checkEmail = await UserModel.findOne({ email }).select("-password");

    // if email does not exist, throw error
    if (!checkEmail) {
      return res.status(400).json({
        message: "email does not exist!",
        error: true
      });
    }

    res.status(200).json({
      message: "email verify",
      success: true,
      data: checkEmail
    });
  } catch (err) {
    console.log("checkEmail error in controller : ", err.message);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = checkEmail;
