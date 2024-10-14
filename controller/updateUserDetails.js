const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/userModel");

async function updateUserDetails(req, res) {
  try {
    const token = req.cookies.token || "";
    // console.log("TOKEN IN USERDETAILS: ", token);
    const user = await getUserDetailsFromToken(token);
    // console.log("USER IN UPDATEUSER DETAILS: ", user);

    const { name, profile_pic } = req.body;
    // console.log("REQ BODY : ", req.body);
    if (!user?._id) {
      return res.status(400).json({
        message:
          "Invalid user. logged in user not available. token could be expired or missing",
        error: true
      });
    }

    const userInformation = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { name, profile_pic },
      { new: true }
    );

    // const userInformation = await UserModel.findById(user._id);

    return res.status(200).json({
      message: "User updated successfully",
      data: userInformation,
      success: true
    });
  } catch (err) {
    console.log(`error in updateUserDetails controller : ${err.message}`);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = updateUserDetails;
