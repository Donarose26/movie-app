const express = require("express");
const movieController = require("../controllers/movieController");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post("/addMovie", verify, verifyAdmin, movieController.addMovie); 
router.get("/getMovies", movieController.getAllMovies);
router.get("/getMovie/:id", verify, verifyAdmin, movieController.getMovie);
router.patch("/updateMovie/:id", verify, verifyAdmin, movieController.updateMovie);
router.delete("/deleteMovie/:id", verify, verifyAdmin, movieController.deleteMovie);
router.patch("/addComment/:id", verify, movieController.addComment);
router.get("/getComments/:id", verify, movieController.getComments);

module.exports = router;
