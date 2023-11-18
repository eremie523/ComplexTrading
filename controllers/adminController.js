const User = require("../model/User");
const Admin = require("../model/Admin")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
// const otpGenerator = require("otp-generator");

module.exports.register = async (req, res) => {
  const { name, username, password, email } = req.body;
  try {
    if (!username || !name || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for Duplicate
    const duplicate = await Admin.findOne({ email }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Email" });
    }

    // Hash Password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds keep password secured

    const userObject = { name, username, email, password: hashedPwd };

    // Create & Store User
    const user = await Admin.create(userObject);

    if (user) {
      res.status(201).json({ message: `New user ${name} created` });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await Admin.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Jwt

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        name: existingUser.name,
      },
      process.env.ACCESS_TOKEN_SECRET, // Change to ACCESS_TOKEN_SECRET
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};