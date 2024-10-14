const UserModel = require("../models/userModel");

async function searchUser(req, res) {
  try {
    const { search } = req.body;
    // console.log("SEARCH VAUE : ", search);

    /*
    NOTE:
    When you create a regular expression with an empty string and use it in MongoDB, it behaves as a wildcard that matches any document where the specified fields contain any string (including non-empty strings).

    */

    if (search.trim() === "") {
      return res.status(200).json({
        message: "Empty search query",
        data: [],
        success: true
      });
    }

    // we will use reqular expression to perform xcase-insensitive search
    const query = new RegExp(search, "i", "g");

    // where the name matches the query or the email matches the query
    const user = await UserModel.find({
      $or: [{ name: query }, { email: query }]
    }).select("-password -__v");

    // We will write it like this if we want to exclude the logged in user base on the logged in user's id
    /*
    const user = await UserModel.find({
      $and: [
        {
          $or: [{ name: query }, { email: query }]
        },
        {
          _id: { $ne: "loggedInUserId" } // Exclude specific user ID
        }
      ]
    }).select("-password -__v");
    */

    // if no user is found
    if (!user) {
      return res.status(200).json({
        message: "Not found",
        data: [],
        success: true
      });
    }

    return res.status(200).json({
      message: "all user",
      data: user,
      success: true
    });
  } catch (err) {
    console.log("Error from search user controller : ", err);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = searchUser;
