async function logout(req, res) {
  try {
    const cookieOption = {
      maxAge: 0, // Milliseconds
      http: true,
      secure: process.env.NODE_ENV !== "development"
    };
    return res.cookie("token", "", cookieOption).status(200).json({
      message: "session out",
      success: true
    });
  } catch (err) {
    console.log(`Error for logout in controller : ${err.message}`);
    return res.status(500).json({
      message: err.message || err,
      error: true
    });
  }
}

module.exports = logout;
