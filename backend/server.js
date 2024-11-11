const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { engine } = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
// Import the recipe routes
const recipeRoutes = require("./routes/recipeRoutes");
// Load .env file
require("dotenv").config();
// Access the MongoDB URI
const dbURI = process.env.MONGODB_URI;

//PORT
const PORT = 5000;

// Initialize Express
const app = express();

// Handlebars middleware
app.engine(
  "handlebars",
  engine({
    // Enable prototype access
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      add: (a, b) => a + b,
      sub: (a, b) => a - b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
    },
  })
);

// Middleware
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Use the recipe routes
app.use("/", recipeRoutes);

// Listen on the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
