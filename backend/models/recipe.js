const mongoose = require("mongoose");

// Define the Recipe schema
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

module.exports = mongoose.model("Recipe", recipeSchema);
