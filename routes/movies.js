module.exports = router;

const express = require("express");
const movieController = require("../controllers/movieController");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

// 🧠 PUBLIC ROUTES
router.get("/getMovies", movieController.getAllMovies);
router.get("/getMovie/:id", movieController.getMovie);
router.get("/getComments/:id", movieController.getComments);

// 👥 USER ROUTES (must be logged in)
router.patch("/addComment/:id", verify, movieController.addComment);

// 👑 ADMIN ROUTES
router.post("/addMovie", verify, verifyAdmin, movieController.addMovie);
router.patch("/updateMovie/:id", verify, verifyAdmin, movieController.updateMovie);
router.delete("/deleteMovie/:id", verify, verifyAdmin, movieController.deleteMovie);

module.exports = router;
