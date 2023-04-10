const express = require("express");
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//👇🏻 Add this before the app.get() block
socketIO.on("connection", (socket) => {
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
  socket.on("login", (data) => {
    //👇🏻 Destructures the credentials from the object
    const { username, password } = data;

    //👇🏻 Filters the array for existing objects with the same email and password

    let result = database.filter(
      (user) => user.username === username && user.password === password
    );
    //👇🏻 If there is none, it returns this error message
    if (result.length !== 1) {
      return socket.emit("loginError", "Incorrect credentials");
    }
    //👇🏻 Returns the user's email & id if the user exists
    socket.emit("loginSuccess", {
      message: "Login successfully",
      data: {
        _id: result[0].id,
        _email: result[0].email,
      },
    });
  });

  socket.on("uploadPhoto", (data) => {
    //👇🏻 Gets the id, email, and image URL
    const { id, email, photoURL } = data;
    //👇🏻 Search the database for the user
    let result = database.filter((user) => user.id === id);
    //👇🏻 creates the data structure for the image
    const newImage = {
      id: generateID(),
      image_url: photoURL,
      vote_count: 0,
      votedUsers: [],
      _ref: email,
    };
    //👇🏻 adds the new image to the images array
    result[0]?.images.unshift(newImage);
    //👇🏻 sends a new event containing the server response
    socket.emit("uploadPhotoMessage", "Upload Successful!");
  });

  socket.on("allPhotos", (data) => {
    //👇🏻 an array to contain all the images
    let images = [];
    //👇🏻 loop through the items in the database
    for (let i = 0; i < database.length; i++) {
      //👇🏻 collect the images into the array
      images = images.concat(database[i]?.images);
    }
    //👇🏻 sends all the images through another event
    socket.emit("allPhotosMessage", {
      message: "Photos retrieved successfully",
      photos: images,
    });
  });

  socket.on("getMyPhotos", (id) => {
    //👇🏻 Filter the database items
    let result = database.filter((db) => db.id === id);
    //👇🏻 Returns the images and the username
    socket.emit("getMyPhotosMessage", {
      data: result[0]?.images,
      username: result[0]?.username,
    });
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
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
