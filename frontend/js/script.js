document.addEventListener("DOMContentLoaded", function () {
  //remember the current page
  const pagination = function () {
    document.querySelectorAll(".preview__link").forEach(function (link) {
      link.addEventListener("click", function (event) {
        const currentPage =
          new URLSearchParams(window.location.search).get("page") || 1;

        const recipeId = link
          .getAttribute("href")
          .split("/")
          .pop()
          .split("?")[0]; // Get the recipe ID from the link href
        const newUrl = `/api/recipe/${recipeId}?page=${currentPage}`;

        window.location.href = newUrl;
        event.preventDefault();
      });
    });
  };

  // Add Recipe Button
  const addRecipeBtn = function () {
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
        const instructions =
          document.getElementById("recipeInstructions").value;
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
  };

  //clicking the edit button
  const editRecipeBtns = function () {
    document
      .querySelector('.edit-btn[data-target="#editRecipeModal"]')
      .addEventListener("click", async function () {
        // Get the recipe ID from the button
        const recipeId = this.getAttribute("data-id");
        console.log("Edit recipe button clicked with ID2:", recipeId);
        document.getElementById("edit-recipe-id").value = recipeId;

        // Fetch recipe details
        const response = await fetch(`/api/recipes/${recipeId}`);
        const recipe = await response.json();
        console.log("Recipe data:", recipe);

        // Populate the modal with recipe details
        document.getElementById("edit-recipe-id").value = recipe._id;
        document.getElementById("edit-recipe-name").value = recipe.name;
        document.getElementById("edit-recipe-description").value =
          recipe.description;
        document.getElementById("edit-recipe-ingredients").value =
          recipe.ingredients.join(", ");
        document.getElementById("edit-recipe-instructions").value =
          recipe.instructions;
        document.getElementById("edit-recipe-image").value = recipe.image || "";
      });

    // Submit Edit Form
    document
      .getElementById("editRecipeForm")
      .addEventListener("submit", async function (event) {
        event.preventDefault();
        const recipeId = document.getElementById("edit-recipe-id").value;
        console.log(recipeId);

        // Collect updated data from the form
        const updatedRecipe = {
          name: document.getElementById("edit-recipe-name").value,
          description: document.getElementById("edit-recipe-description").value,
          ingredients: document
            .getElementById("edit-recipe-ingredients")
            .value.split(","),
          instructions: document.getElementById("edit-recipe-instructions")
            .value,
          image: document.getElementById("edit-recipe-image").value,
        };

        // update the recipe
        const response = await fetch(`/api/recipe/${recipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRecipe),
        });

        if (response.ok) {
          alert("Recipe updated successfully!");
          location.reload();
        } else {
          console.error("Error updating recipe");
        }
      });
  };

  const init = function () {
    addRecipeBtn();
    editRecipeBtns();
    pagination();
  };
  init();
});
