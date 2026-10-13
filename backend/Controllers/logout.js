const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export default logout;