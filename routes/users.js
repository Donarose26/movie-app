const express = require("express")
const userController = require("../controllers/userController")
const auth = require('../auth');


const router = express.Router()

router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/details", auth.verify, userController.getUserDetails)


module.exports = router;