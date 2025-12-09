//Necessary packages
const express = require('express'); // loads express library
const mongoose = require('mongoose'); // loads mongoose
const cors = require('cors'); // loads cors
require('dotenv').config(); // reads the env file
const fs = require('fs').promises; // file system promises API
const path = require('path'); // makes platform-safe paths


//Basic Configs
const app = express(); // Creates express server application
const PORT = process.env.PORT || 5000; // gets the port number from .env and defaults to 5000 if not found


//Middleware
app.use(cors()); // Allows for requests to be used from the frontend
app.use(express.json()); // converts JSON into Javascript objects


// path to the JSON file that will store bookings
const BOOKINGS_FILE = path.resolve(__dirname, 'bookings.json');

/**
 * Read bookings.json and return an array (empty array if file is missing or invalid)
 */
async function readBookings() {
  try {
    const raw = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // If file doesn't exist or has invalid JSON, return an empty array
    return [];
  }
}

/**
 * Write the bookings array back to bookings
 */
async function writeBookings(bookings) {
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
}


//Connection to Database
const connectDB = async () => { // async function that connects to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI); // uses connection url in .env to connect to MongoDB
    console.log("MongoDB connected"); // states when successful
  } catch (error) {
    console.error(error.message); // states when fails
    process.exit(1); // stops server if it fails
  }
};
connectDB(); // call the function to connect to the database


//Server responsiveness to user visits to URL or sends data to it
app.get('/', (req, res) => { // runs when someone visits http://localhost:PORT/
  res.send("The API is running..."); // give this message to the browser
});


// POST route to receive bookings and save to bookings.json
app.post('/book', async (req, res) => { // note: async needed because we use await inside
  const { name, email, date, service } = req.body; // gets data from request body

  if (!name || !email || !date || !service) { // if the user didn't fill out one or more sections
    return res.status(400).json({ // gives error message if anything is blank
      success: false,
      message: "Please fill out all necessary information."
    });
  }

  try {
    // Read existing bookings (array)
    const bookings = await readBookings();

    // Create new booking object
    const newBooking = {
      id: Date.now().toString(), // simple unique id
      name,
      email,
      date,
      service,
      createdAt: new Date().toISOString()
    };

    // Add the new booking and save
    bookings.push(newBooking);
    await writeBookings(bookings);

    // Send back a confirmation that includes the stored booking
    return res.json({
      success: true,
      reply: `Thanks ${name}, your booking for a ${service} on ${date} is confirmed! Please check your email at ${email} for confirmation!`,
      booking: newBooking
    });

  } catch (err) {
    console.error("Error saving booking:", err);
    return res.status(500).json({
      success: false,
      message: "Server error saving booking. Please try again later."
    });
  }
});


// Admin/dev endpoint to view all bookings
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await readBookings();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error reading bookings:", err);
    res.status(500).json({ success: false, message: "Could not read bookings." });
  }
});


//Start of Server
app.listen(PORT, () => { // server starts on selected port
  console.log(`Server running on port ${PORT}`); // confirmation that server is up and running
});
