document.addEventListener("DOMContentLoaded", function () {
  //remember the current page
  const pagination = function () {
    document.querySelectorAll(".preview__link").forEach(function (link) {
      link.addEventListener("click", function (event) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = urlParams.get("page") || 1;
        // Preserve the search query
        const query = urlParams.get("q") || "";

        // Get the recipe ID from the link href
        const recipeId = link
          .getAttribute("href")
          .split("/")
          .pop()
          .split("?")[0];
        const newUrl = `/api/recipe/${recipeId}?page=${currentPage}&q=${encodeURIComponent(
          query
        )}`;

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
        // Prevent default form submission
        event.preventDefault();

        const name = document.getElementById("recipeName").value;
        const description = document.getElementById("recipeDescription").value;
        const ingredients = document
          .getElementById("recipeIngredients")
          .value.split(",")
          .map((item) => item.trim());
        const instructions =
          document.getElementById("recipeInstructions").value;
        const image =
          document.getElementById(
            // Default to null if no image URL is provided
            "recipeImage"
          ).value || null;
        console.log({ name, description, ingredients, instructions, image });

        try {
          const response = await fetch("/api/recipes", {
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
    const editButton = document.querySelector(
      '.edit-btn[data-target="#editRecipeModal"]'
    );
    if (editButton) {
      editButton.addEventListener("click", async function () {
        // Get the recipe ID from the button
        const recipeId = this.getAttribute("data-id");
        console.log("Edit recipe button clicked with ID2:", recipeId);
        if (!recipeId) return;
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
    }

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
        const response = await fetch(`/api/recipes/${recipeId}`, {
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

  //clicking the delete button
  const deleteRecipeBtn = function () {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    if (!deleteButtons) return;

    deleteButtons.forEach(function (button) {
      const recipeId = button.getAttribute("data-id");
      button.addEventListener("click", async function () {
        if (confirm("Are you sure you want to delete this recipe?")) {
          try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
              method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete recipe");
            // Capture current `page` and `q` parameters from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const currentPage = urlParams.get("page") || 1;
            const searchQuery = urlParams.get("q") || ""; // Capture the search query if present

            // Clear recipe details section
            document.querySelector(".recipe-details").innerHTML =
              "<p class='text-center'>Select a recipe to view its details.</p>";

            alert("Recipe deleted successfully");

            // Redirect to the main list view with the same `page` and `limit=10` parameters
            const newUrl = `/?page=${currentPage}&limit=10${
              searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
            }`;
            window.location.href = newUrl;
          } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe. Please try again.");
          }
        }
      });
    });
  };

  //search function
  const search = function () {
    document
      .querySelector(".search-btn")
      .addEventListener("click", async () => {
        const query = document.getElementById("searchQuery").value;

        try {
          const response = await fetch(
            `/api/recipes/search?q=${encodeURIComponent(query)}`
          );
          if (!response.ok)
            throw new Error("Search failed with status " + response.status);
          //Copy the URL and inject the search query as parameter
          const newUrl = new URL(window.location);
          newUrl.searchParams.set("q", query);
          window.history.pushState({}, "", newUrl);

          //Update the list
          const recipes = await response.json();
          // Update the UI with search results
          updateRecipeList(recipes);
        } catch (error) {
          console.error("Error during search:", error);
          alert(
            "Error during search. Please check the server logs for more details."
          );
        }
      });
  };

  // Update the recipe list with search results
  const updateRecipeList = function (recipes) {
    const recipeListContainer = document.querySelector(".recipe-list ul");
    recipeListContainer.innerHTML = ""; // Clear the existing list
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = ""; // Clear the existing pagination

    // Get the search query from the input field
    const searchQuery = document.getElementById("searchQuery").value;

    recipes.forEach((recipe) => {
      const listItem = document.createElement("li");
      listItem.classList.add("preview");

      listItem.innerHTML = `
        <a class="preview__link" href="/api/recipe/${
          recipe._id
        }?q=${encodeURIComponent(searchQuery)}">
          <div class="preview__data">
            <h4 class="preview__title">${recipe.name}</h4>
            <p class="preview__description">${recipe.description}</p>
          </div>
        </a>
      `;

      recipeListContainer.appendChild(listItem);
    });
  };

  // Show the Back button when in search mode
  const backBtnShow = function () {
    document.querySelector(".search-btn").addEventListener("click", () => {
      document.getElementById("backButton").style.display = "inline-block";
    });
  };

  const resetDefaultView = function () {
    document.getElementById("backButton").addEventListener("click", () => {
      // Clear the search input and remove the "q" parameter from the URL
      document.getElementById("searchQuery").value = "";
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("q");
      newUrl.searchParams.set("page", 1);
      window.location.href = newUrl;
    });
  };

  // Display search results on page load
  const displayResearches = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("q");

    if (searchQuery) {
      // Populate the search input with the query
      document.getElementById("searchQuery").value = searchQuery;

      // Fetch and display search results
      try {
        const response = await fetch(
          `/api/recipes/search?q=${encodeURIComponent(searchQuery)}`
        );
        const recipes = await response.json();
        updateRecipeList(recipes);

        // Show the Back button since we are in search mode
        document.getElementById("backButton").style.display = "inline-block";
      } catch (error) {
        console.error("Error loading search results on page load:", error);
      }
    }
  };

  const init = function () {
    addRecipeBtn();
    editRecipeBtns();
    deleteRecipeBtn();
    pagination();
    search();
    backBtnShow();
    resetDefaultView();
    displayResearches();
  };
  init();
});
