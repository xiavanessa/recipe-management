const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const { engine } = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const PORT = 5000;

// Handlebars middleware
app.engine(
  "handlebars",
  engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars), // Enable prototype access
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

mongoose
  .connect("mongodb://127.0.0.1:27017/recipeDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const recipeSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    ingredients: [String],
    instructions: String,
    image: String,
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

// Route
app.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const totalRecipes = await Recipe.countDocuments();
    const recipes = await Recipe.find().skip(skip).limit(limit);
    const totalPages = Math.ceil(totalRecipes / limit);

    res.render("index", {
      recipes,
      currentPage: page,
      totalPages,
      selectedRecipe: null, // No recipe selected on the main page
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).send("Server Error");
  }
});

// New route for fetching a specific recipe by ID
app.get("/api/recipe/:id", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Ensure the page is tracked
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const totalRecipes = await Recipe.countDocuments();
    const recipes = await Recipe.find().skip(skip).limit(limit); // Fetch recipes for current page
    const selectedRecipe = await Recipe.findById(req.params.id);

    if (!selectedRecipe) return res.status(404).send("Recipe not found");

    res.render("index", {
      recipes,
      currentPage: page,
      totalPages: Math.ceil(totalRecipes / limit),
      selectedRecipe, // Pass the selected recipe data
    });
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    res.status(500).send("Server Error");
  }
});

// listen the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
