const bcrypt = require('bcrypt');
const User = require("../models/User");

const auth = require("../auth");

module.exports.registerUser = (req, res) => {
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ error: "Email invalid" });
  } else if (req.body.password.length < 8) {
    return res.status(400).send({ error: "Password must be at least 8 characters" });
  } else {
    // Check if email already exists
    User.findOne({ email: req.body.email }).then(existingUser => {
      if (existingUser) {
        return res.status(400).send({ error: "Email already registered" });
      }

      let newUser = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      });

      return newUser.save()
        .then((user) => res.status(201).send({ message: "Registered Successfully" }))
        .catch(err => {
          console.error("Error in saving: ", err);
          return res.status(500).send({ error: "Error in save" });
        });
    }).catch(err => {
      console.error("Error in checking existing user: ", err);
      return res.status(500).send({ error: "Error in checking existing user" });
    });
  }
};

module.exports.loginUser = (req,res) => {

  if(req.body.email.includes("@")){
    return User.findOne({ email : req.body.email })
    .then(result => {


      if(result == null){
        return res.status(404).send({ error: "No Email Found" });
      } else {

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
        if (isPasswordCorrect) {

          return res.status(200).send({ access : auth.createAccessToken(result)})

        } else {

          return res.status(401).send({ message: "Email and password do not match" });

        }

      }

    })
    .catch(err => err);
  } else {
      return res.status(400).send(false)
  }
};

module.exports.logoutUser = (req, res) => {
  return res.status(200).send({ message: "Logged out successfully" });
};

module.exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("_id email isAdmin createdAt updatedAt"); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user details: ", err);
    return res.status(500).json({ error: "Server error" });
  }
};

