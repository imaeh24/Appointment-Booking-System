//Necessary packages

const express = require('express'); //loads express library
const mongoose = require('mongoose'); //loads mongoose
const cors = require('cors'); //loads cors
require('dotenv').config(); //reads the env file


//Basic Configs

const app = express(); //Creates express server application
const PORT = process.env.PORT || 5000; //gets the port number from .env and defaults to 5000 if not found


//Middleware

app.use(cors()); //Allows for requests to be used from the frontend
app.use(express.json()); //converts JSON into Javascript


//Connection to Database

const connectDB = async () => { //async function that connects to MongoDB
    try {
        await mongoose.connect(process.env.MONGO_URI); //uses connnection url in .env to connect to MongoDB
        console.log("MongoDB connected"); //states when successful
    } catch (error) {
        console.error(error.message); //states when fails
        process.exit(1); //stops server if it fails
    }
};
connectDB(); //function calling for connection to database


//Server responsiveness to user visits to URL or sends data to it

app.get('/', (req, res) => { //starts when someone starts the server
    res.send("The API is running..."); //gives this message to the browser
});

app.post('/book', (req, res) => { //starts when the frontend gives booking data to /book
    const { name, email, date, service } = req.body; //gets data from request body

    if (!name || !email || !date || !service) { //if the user didnt fill out one or more sections
        return res.status(400).json({ //gives error message if anything is blank
            success: false,
            message: "Please fill out all necessary information."
        })
    }

    res.json({ //success response to frontend
        success: true,
        reply: `Thanks ${name}, your booking for a ${service} on ${date} is confirmed! Please check your email at ${email} for confirmation!`
    });
});



//Start of Server

app.listen(PORT, () => { //server starts on selected port
    console.log(`Server running on port ${PORT}`); //confirmation that server is up and running
});

