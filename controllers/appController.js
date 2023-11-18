const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const otpGenerator = require("otp-generator");

module.exports.register = async (req, res) => {
  const { name, username, password, email } = req.body;
  try {
    if (!username || !name || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for Duplicate
    const duplicate = await User.findOne({ email }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Email" });
    }

    // Hash Password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds keep password secured

    const userObject = { name, username, email, password: hashedPwd };

    // Create & Store User
    const user = await User.create(userObject);

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
    const existingUser = await User.findOne({ email });

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

// // Implement the actual logic for the other routes
// module.exports.getUserD = async (req, res) => {
//   // Implement logic

//   try {
//     const users = await User.find().select("-password").lean();
//     if (!users?.length) {
//       return res.status(400).json({ message: "No User Found" });
//     }

//     res.json(users);
//   } catch (error) {
//     return res.status(404).json({ message: "Cannot Find User" });
//   }
// };

module.exports.getUser = async (req, res) => {
  const { email } = req.params;

  try {
    if (!email) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    const user = await User.findOne({ email }).select('-password').exec();

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



module.exports.updateUser = async (req, res) => {
    try {
      // Ensure req.user contains the user information
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const userId = req.user.userId; // Use req.user.userId
  
      const { name, email, password, username } = req.body;
  
      const user = await User.findById(userId).exec();
  
      if (!user) {
        return res.status(400).json({ message: "User Not Found" });
      }
  
      // Check for Duplicate
      const duplicate = await User.findOne({ email }).lean().exec();
  
      // Allow updates
      if (duplicate && duplicate._id.toString() !== userId) {
        return res.status(409).json({ message: "Duplicate Email" });
      }
  
     // Update user fields if provided
     if (name) user.name = name;
     if (email) user.email = email;
     if (username) user.username = username;
     if (password) {
       // Hash and update password if provided
       user.password = await bcrypt.hash(password, 10);
     }
      const updatedUser = await user.save();
  
      res.json({ message: `${updatedUser.name} updated` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

module.exports.generateOTP = asyncHandler(async (req, res) => {
  
   req.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
   res.status(201).json({code: req.app.locals.OTP})
});

module.exports.verifyOTP = asyncHandler(async (req, res) => {
    
    const {code} = req.query;

    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true; 
        return res.status(201).json({message: 'Verify Successfully'})
    }

    return res.status(400).json({message: "Invalid Otp"})
});

module.exports.createResetSession = asyncHandler(async (req, res) => {
  
    if(req.app.locals.resetSession){
        req.app.locals.resetSession = false; // allow access to this route once 
        return res.status(201).json({message: "Access Granted"})
    }

    return res.status(440).json({message: "Session Expired!"})
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  
    try {

        if(!req.app.locals.resetSession) return res.status(440).json({message: "Session Expired!"});

        const {email, password} = req.body;

        try {
            
            const foundUser = await User.findOne({email})

            if(foundUser) {

               if (password) {
                // Hash and update password if provided
                foundUser.password = await bcrypt.hash(password, 10);
              }

               const updatedUser = await foundUser.save();

               req.app.locals.resetSession = false; // allow access to this route once 

               return res.status(201).json({message: "Record Updated"})
               
            }
            
            if(!foundUser) return res.status(200).json({message: "Email Not Found"})
            
        } catch (error) {
            return res.status(500).json({error})
        }
        
    } catch (error) {
        return res.status(401).json({error})
    }
});


  