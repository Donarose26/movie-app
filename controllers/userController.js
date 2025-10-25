const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require("../models/User");
const auth = require("../auth");
const nodemailer = require("nodemailer");

// ------------------- REGISTER -------------------
module.exports.registerUser = (req, res) => {
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ error: "Email invalid" });
  } else if (req.body.password.length < 8) {
    return res.status(400).send({ error: "Password must be at least 8 characters" });
  }

  User.findOne({ email: req.body.email }).then(existingUser => {
    if (existingUser) {
      return res.status(400).send({ error: "Email already registered" });
    }

    const newUser = new User({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    });

    return newUser.save()
      .then(() => res.status(201).send({ message: "Registered Successfully" }))
      .catch(err => {
        console.error("Error in saving: ", err);
        return res.status(500).send({ error: "Error in save" });
      });
  }).catch(err => {
    console.error("Error checking existing user: ", err);
    return res.status(500).send({ error: "Server error" });
  });
};

// ------------------- LOGIN -------------------
module.exports.loginUser = (req, res) => {
  if (!req.body.email.includes("@")) return res.status(400).send(false);

  User.findOne({ email: req.body.email })
    .then(result => {
      if (!result) return res.status(404).send({ error: "No Email Found" });

      const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
      if (isPasswordCorrect) {
        return res.status(200).send({ access: auth.createAccessToken(result) });
      } else {
        return res.status(401).send({ message: "Email and password do not match" });
      }
    })
    .catch(err => {
      console.error("Login error: ", err);
      return res.status(500).send({ error: "Server error" });
    });
};

// ------------------- LOGOUT -------------------
module.exports.logoutUser = (req, res) => {
  return res.status(200).send({ message: "Logged out successfully" });
};

// ------------------- GET USER DETAILS -------------------
module.exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("_id email isAdmin createdAt updatedAt"); 
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user details: ", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ------------------- CHANGE PASSWORD -------------------
module.exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).send({ error: "Old and new password required, new password must be at least 8 chars" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    const isOldPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);
    if (!isOldPasswordCorrect) return res.status(401).send({ error: "Old password is incorrect" });

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();
    return res.send({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error: ", err);
    return res.status(500).send({ error: "Server error" });
  }
};

// ------------------- FORGOT PASSWORD -------------------
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // ------------------- Mailtrap SMTP -------------------
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 587,
      auth: {
        user: "YOUR_MAILTRAP_USER", // replace with Mailtrap user
        pass: "YOUR_MAILTRAP_PASS"  // replace with Mailtrap password
      }
    });

    const mailOptions = {
      from: "no-reply@movieapp.com",
      to: user.email,
      subject: "Password Reset",
      text: `Use this token to reset your password: ${resetToken}`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).send({ error: "Error sending email" });
      }
      return res.send({ message: "Password reset token sent to email" });
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).send({ error: "Server error" });
  }
};

// ------------------- RESET PASSWORD -------------------
module.exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).send({ error: "Token and new password required, new password must be at least 8 chars" });
  }

  try {
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });
    if (!user) return res.status(400).send({ error: "Invalid or expired token" });

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.send({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).send({ error: "Server error" });
  }
};
