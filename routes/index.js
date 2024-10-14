const express = require("express");
const registerUser = require("../controller/registerUser");
const checkEmail = require("../controller/checkEmail");
const checkPassword = require("../controller/checkPassword");
const userDetails = require("../controller/userDetails");
const logout = require("../controller/logout");
const updateUserDetails = require("../controller/updateUserDetails");
const searchUser = require("../controller/searchUser");

const router = express.Router();

// create API
router.post("/register", registerUser);
// check user email
router.post("/email", checkEmail);
// check user password
router.post("/password", checkPassword);
//login user details
router.get("/user-details", userDetails);
// logout user
router.get("/logout", logout);
// update user details
router.post("/update-user", updateUserDetails);
// search user base on email or name
router.post("/search-user", searchUser);

module.exports = router;
