const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const port = 4000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors());

//MongoDB database
mongoose.connect("mongodb+srv://admin:admin@b561-agpalza.oz6dwkb.mongodb.net/s84-MovieApp?retryWrites=true&w=majority&appName=B561-Agpalza", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// Routes Middleware
const movieRoutes = require("./routes/movies");
const userRoutes = require("./routes/users");

app.use("/movies", movieRoutes)
app.use("/users", userRoutes)


if(require.main === module){
    app.listen(process.env.PORT || port, () => {
        console.log(`API is now online on port ${ process.env.PORT || port }`)
    });
}

module.exports = {app,mongoose};