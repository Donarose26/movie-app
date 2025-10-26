const express = require("express");
const movieController = require("../controllers/movieController");
const { verify, verifyAdmin } = require("../auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists in your backend
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
router.post("/addMovie", verify, verifyAdmin, upload.single("image"), movieController.addMovie); 
router.get("/getMovies", movieController.getAllMovies);
router.get("/getMovie/:id", verify, verifyAdmin, movieController.getMovie);
router.patch("/updateMovie/:id", verify, verifyAdmin, upload.single("image"), movieController.updateMovie);
router.delete("/deleteMovie/:id", verify, verifyAdmin, movieController.deleteMovie);
router.patch("/addComment/:id", verify, movieController.addComment);
router.get("/getComments/:id", verify, movieController.getComments);

module.exports = router;
