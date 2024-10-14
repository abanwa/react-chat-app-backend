const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(req, res) {
  try {
    const token = req.cookies.token || "";

    const user = await getUserDetailsFromToken(token);

    return res.status(200).json({
      message: "user details",
      data: user
    });
  } catch (err) {
    console.log(`userDetails error in controller: ${err.message}`);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = userDetails;
