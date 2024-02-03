const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

//data base connection
async function connectDB() {
    try {
        const dbConnectionString = process.env.DB_CONNECTION_STRING;
        await mongoose.connect(dbConnectionString);

        console.log("db connected");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

connectDB();
app.listen(4000, () => console.log('example app listining on port 4000!'));

//for taking post body instead of body-parser
app.use(express.json({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, POST');
    next();
});

app.get('/', (req, res) => res.send('hello world!'));
//To Do try catch for home route with status code

// mongoose models
var schema = new mongoose.Schema({ email: "string", password: "string" });
var User = mongoose.model("User", schema);

//signup route api
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    //debugging
    console.log(email);
    console.log(password);

    //checking if already signed up
    let user = await User.findOne({ email });
    if (user) {
        return res.json({ msg: "this email is already signed up" });
        //TO DO use status code instead
    }
    else {
        //create new user
        user = new User({
            email,
            password: await bcrypt.hash(password, 10), // hash the password before storing
        });

        //debugging
        console.log(user);

        //save new user
        try {
            await user.save();
        } catch (error) {
            console.error("Error saving user:", error);
            // handle the error here, such as returning an error response to the client
        }

        //create and return token
        var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return res.json({ token: token });
        //TO DO use status code instead
        //return res.status(200).json({ token: token });
    }
});

// login route api
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    //debugging
    console.log(email);
    console.log(password);

    //finding user
    let user = await User.findOne({ email });

    //debugging
    console.log(user);

    //if email is not found
    if (!user) {
        return res.json({ msg: "email not found" });
        //TO DO use status code instead
    }
    //if password is not correct
    else if (!(await bcrypt.compare(password, user.password))) {
        return res.json({ msg: "wrong password" });
        //TO DO use status code instead
    }
    else {
        //create and return token
        var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return res.json({ token: token });
        //TO DO use status code instead
    }
});


//private route api
app.post('/private', async (req, res) => {
    let token = req.headers("token");
    if (!token || token == "null") {
        return res.json({ msg: "no access to this route" });
        //TO DO use status code instead
    }
    else {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        return res.json({ msg: "access granted" });
        //TO DO use status code instead
    }
});



