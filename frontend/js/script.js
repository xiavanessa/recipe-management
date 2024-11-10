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
          updateRecipeList(recipes); // Update the UI with search results
        } catch (error) {
          console.error("Error during search:", error);
          alert(
            "Error during search. Please check the server logs for more details."
          );
        }
      });
  };

  const updateRecipeList = function (recipes) {
    const recipeListContainer = document.querySelector(".recipe-list ul");
    recipeListContainer.innerHTML = ""; // Clear the existing list

    recipes.forEach((recipe) => {
      const listItem = document.createElement("li");
      listItem.classList.add("preview");

      listItem.innerHTML = `
        <a class="preview__link" href="/api/recipe/${recipe._id}">
          <div class="preview__data">
            <h4 class="preview__title">${recipe.name}</h4>
            <p class="preview__description">${recipe.description}</p>
          </div>
        </a>
      `;

      recipeListContainer.appendChild(listItem);
    });
  };

  const backBtnShow = function () {
    document.querySelector(".btn-default").addEventListener("click", () => {
      document.getElementById("backButton").style.display = "inline-block";
    });
  };

  const resetDefaultView = function () {
    document.getElementById("backButton").addEventListener("click", () => {
      window.location.href = "/?page=1";
    });
  };

  const init = function () {
    addRecipeBtn();
    editRecipeBtns();
    pagination();
    search();
    backBtnShow();
    resetDefaultView();

    // Check for search query in params
    const searchQuery = new URLSearchParams(window.location.search).get("q");

    // If there is a search query, trigger the search function, with the query
    if (searchQuery) {
      document.getElementById("searchQuery").value = searchQuery;
      document.querySelector(".search-btn").click();
    }
  };
  init();
});
