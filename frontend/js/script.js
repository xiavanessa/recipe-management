document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("addRecipeForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent default form submission

      const name = document.getElementById("recipeName").value;
      const description = document.getElementById("recipeDescription").value;
      const ingredients = document
        .getElementById("recipeIngredients")
        .value.split(",")
        .map((item) => item.trim());
      const instructions = document.getElementById("recipeInstructions").value;
      const image = document.getElementById("recipeImage").value || null; // Optional

      console.log({ name, description, ingredients, instructions, image });

      try {
        const response = await fetch("/api/recipe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            ingredients,
            instructions,
            image,
          }),
        });

        if (response.ok) {
          alert("Recipe added successfully!");
          location.reload();
        } else {
          alert("Failed to add recipe. Please try again.");
        }
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
    });
});
