const express = require("express");
const router = express.Router();
// Import the Recipe model
const Recipe = require("../models/recipe");

// Route to render the main page
router.get("/", async (req, res) => {
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
      selectedRecipe: null,
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).send("Server Error");
  }
});

// Route to search recipes by name or ingredients
router.get("/api/recipes/search", async (req, res) => {
  const searchQuery = req.query.q;

  try {
    // Use a case-insensitive regex search on `name` and `ingredients` fields
    const recipes = await Recipe.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { ingredients: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

// Route to fetch a specific recipe by ID
router.get("/api/recipe/:id", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
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
      selectedRecipe,
    });
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    res.status(500).send("Server Error");
  }
});

// JSON API
router.get("/api/recipes/:id", async (req, res) => {
  // Changed route to /api/recipes/:id
  try {
    const selectedRecipe = await Recipe.findById(req.params.id);
    if (!selectedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    // Return JSON for modal population
    res.status(200).json(selectedRecipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to add a new recipe
router.post("/api/recipes", async (req, res) => {
  const { name, description, ingredients, instructions, image } = req.body;

  try {
    const newRecipe = new Recipe({
      name,
      description,
      ingredients,
      instructions,
      image,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully" });
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.status(500).json({ error: "Failed to add recipe" });
  }
});

// update a recipe
router.put("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecipe = req.body;
    const recipe = await Recipe.findByIdAndUpdate(id, updatedRecipe, {
      new: true,
    });

    if (!recipe) return res.status(404).send("Recipe not found");
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).send("Server Error");
  }
});

// Delete recipe by ID
router.delete("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Recipe.findByIdAndDelete(id);
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

module.exports = router;
