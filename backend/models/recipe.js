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
  { timestamps: true } //adds createdAt and updatedAt fields to the schema
);
// Create the Recipe model with the schema so we can use it in our application
module.exports = mongoose.model("Recipe", recipeSchema);
