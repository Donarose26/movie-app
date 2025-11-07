const express = require("express");
const movieController = require("../controllers/movieController");
const { verify, verifyAdmin } = require("../auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/addMovie", verify, verifyAdmin, upload.array("images", 5), movieController.addMovie); 
router.get("/getMovies", movieController.getAllMovies);
router.get("/getMovie/:id", verify, verifyAdmin, movieController.getMovie);
router.patch("/updateMovie/:id", verify, verifyAdmin, upload.array("images", 5), movieController.updateMovie);
router.delete("/deleteMovie/:id", verify, verifyAdmin, movieController.deleteMovie);
router.patch("/addComment/:id", verify, movieController.addComment);
router.get("/getComments/:id", verify, movieController.getComments);

module.exports = router;
