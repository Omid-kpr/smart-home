const express = require('express');
const app = express();
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

//data base

//methode 1 using mongodb

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://omid_kpr:omid2481@cluster0.b43przm.mongodb.net/?retryWrites=true&w=majority";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// }
// run().catch(console.dir);



//methode 2 using mongoose

async function connectDB() {
    await mongoose.connect(
        "mongodb+srv://omid_kpr:omid2481@cluster0.b43przm.mongodb.net/?retryWrites=true&w=majority"
    );

    console.log("db connected");
}

connectDB();
app.listen(4000, () => console.log('example app listining on port 4000!'));
//auth/lib/main.dart

//for taking post body instead of body-parser
app.use(express.json({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, POST');
    next();
});

//optional 
// app.options('/signup', (req, res) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:58503');
//     res.header('Access-Control-Allow-Headers', '*');
//     res.header('Access-Control-Allow-Methods', 'OPTIONS, POST');
//     res.send();
// });

app.get('/', (req, res) => res.send('hello world!'));

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
    }
    else {
        //create new user
        user = new User({
            email,
            password,
        });

        //debugging
        console.log(user);

        //save new user
        await user.save();

        //create and return token
        var token = jwt.sign({ id: user._id }, "password");
        return res.json({ token: token });
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
    }
    //if password is not correct
    else if (user.password !== password) {
        return res.json({ msg: "wrong password" });
    }
    else {
        //create and return token
        var token = jwt.sign({ id: user._id }, "password");
        return res.json({ token: token });
    }
});


//private route api
app.post('/private', async (req, res) => {
    let token = req.headers("token");
    if (!token || token == "null") {
        return res.json({ msg: "no access to this route" });
    }
    else {
        var decoded = jwt.verify(token, "password");
        console.log(decoded);
        return res.json({ msg: "access granted" });
    }
});
//to access private route you should include token in the header


