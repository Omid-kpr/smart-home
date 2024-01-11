const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

/**
 * Creates an Express app, HTTP server, and WebSocket server instance.
 * The WebSocket server is attached to the HTTP server to share the same port.
 */
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


/**
 * Connects to the MongoDB database using the provided URI. 
 * Uses mongoose to connect to the database and handle the connection.
 * Logs a message when successfully connected.
 * Automatically calls to connect on startup.
 */
async function connectDB() {
    await mongoose.connect(
        "mongodb+srv://omid_kpr:omid2481@cluster0.b43przm.mongodb.net/?retryWrites=true&w=majority"
    );

    console.log("db connected");
}

connectDB();

// mongoose models
var schema = new mongoose.Schema({ email: "string", password: "string" });
var User = mongoose.model("User", schema);


/**
 * Sets up WebSocket server to handle client connections.
 * Listens for 'connection' event to log new clients.
 * Listens for 'message' events from clients, parses JSON data,
 * and routes to appropriate handler based on 'route' property.
 * Catches errors parsing messages, logs error, and sends back
 * error response to client.
 * Listens for 'close' event when client disconnects to log it.
 */wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(data);
            switch (data.route) {
                case '/signup':
                    handleSignup(data.data, ws);
                    break;
                case '/login':
                    handleLogin(data.data, ws);
                    break;
                case '/private':
                    handlePrivateRoute(data.data, ws);
                    break;
                default:
                    ws.send(JSON.stringify({ error: 'Invalid route' }));
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

/**
 * Handles user signup logic.
 * @param {Object} data - Signup data containing email and password
 * @param {WebSocket} ws - WebSocket connection 
 * Checks if user already exists with given email. If not, creates a new user document, 
 * saves to DB, signs a JWT token and returns token on success.
 */
async function handleSignup(data, ws) {
    const email = data.email;
    const password = data.password;

    //debugging
    console.log(email);
    console.log(password);

    //checking if already signed up
    let user = await User.findOne({ email });
    if (user) {
        ws.send(JSON.stringify({ msg: "this email is already signed up" }));
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
        ws.send(JSON.stringify({ token: token }));
    }

    // Handle signup request data 
    console.log('Signup data:', data);

    // Send signup response to client
    ws.send(JSON.stringify({ msg: 'Signup response' }));
};

/**
 * Handles user login logic.
 * @param {Object} data - Login data containing email and password
 * @param {WebSocket} ws - WebSocket connection
 * Finds user by email, checks password, creates and returns JWT token on success.
 */
async function handleLogin(data, ws) {

    const email = data.email;
    const password = data.password;

    //debugging
    console.log(email);
    console.log(password);

    //finding user
    let user = await User.findOne({ email });

    //debugging
    console.log(user);

    //if email is not found
    if (!user) {
        ws.send(JSON.stringify({ msg: "email not found" }));

    }
    //if password is not correct
    else if (user.password !== password) {
        ws.send(JSON.stringify({ msg: "wrong password" }));
    }
    else {
        //create and return token
        var token = jwt.sign({ id: user._id }, "password");
        ws.send(JSON.stringify({ token: token }));
    }

    // Handle signup request data 
    console.log('login data:', data);

    // Send signup response to client
    ws.send(JSON.stringify({ msg: 'login response' }));
}

/**
 * Handles private route logic by verifying JWT token.
 * Checks for token in headers, verifies it, and returns access granted/denied response.
 * Also handles signup data logging and response.
 * @param {Object} data - Route data
 * @param {WebSocket} ws - WebSocket connection 
 */
function handlePrivateRoute(data, ws) {
    // Implement your private route logic here
    let token = req.headers("token");
    if (!token || token == "null") {
        return res.json({ msg: "no access to this route" });
    }
    else {
        var decoded = jwt.verify(token, "password");
        console.log(decoded);
        return res.json({ msg: "access granted" });
    }

    // Handle signup request data 
    console.log('Signup data:', data);

    // Send signup response to client
    ws.send(JSON.stringify({ msg: 'Signup response' }));
}

/**
 * Sets up the server to listen on port 4000.
 * Logs a message when the server starts listening.
 */
const PORT = 4050;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});



