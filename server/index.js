const express = require("express");
const app = express();
const PORT = 4000;


const http = require("http").Server(app);
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

//👇🏻 Add this before the app.get() block
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    const database = [];
    const generateID = () => Math.random().toString(36).substring(2, 10);

    //👇🏻 Create a listener to the event
    socket.on("register", (data) => {
        
        //👇🏻 Destructure the user details from the object
        const { username, email, password } = data;

        //👇🏻 Filters the database (array) to check if there is no existing user with the same email or username
        let result = database.filter(
            (user) => user.email === email || user.username === username
        );
        //👇🏻 If none, saves the data to the array. (the empty images array is required for the image uploads)
        if (result.length === 0) {
            database.push({
                id: generateID(),
                username,
                password,
                email,
                images: [],
            });
            //👇🏻 returns an event stating that the registration was successful
            return socket.emit("registerSuccess", "Account created successfully!");
        }
        //👇🏻 This runs only when there is an error/the user already exists
        socket.emit("registerError", "User already exists");

    });

    socket.on('disconnect', () => {
      socket.disconnect()
      console.log('🔥: A user disconnected');
    });
});


app.get("/api", (req, res) => {
    res.json({
        message: "Hello world",
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});