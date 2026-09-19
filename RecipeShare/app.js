const supabaseUrl = "https://ssudtbgcmsvdykpsssmm.supabase.co";
const supabaseKey = "sb_publishable_DNtIhkKaqtT_mSvSUYZvNw_92enOKm8";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);


// ===============================
// GET USER
// ===============================

async function getUser() {

    const result = await supabaseClient.auth.getUser();

    return result.data.user;
}


// ===============================
// CHECK USER LOGIN
// ===============================

async function checkUser() {

    const user = await getUser();

    if (!user) {

        window.location.href = "login.html";

        return null;
    }

    return user;
}


// ===============================
// SHOW MESSAGE
// ===============================

function showMessage(message, type) {

    const box = document.createElement("div");

    box.className =
        "alert alert-" + type +
        " position-fixed top-0 end-0 m-3 shadow";

    box.style.zIndex = "2000";

    box.innerText = message;

    document.body.appendChild(box);


    setTimeout(function () {

        box.remove();

    }, 3500);
}


// ===============================
// ESCAPE TEXT
// ===============================

function esc(text) {

    if (!text) {

        return "";
    }

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// RECIPE CARD
// ===============================

function recipeCard(recipe, owner) {

    let image = "";


    if (recipe.image_url) {

        image =
            '<img src="' +
            esc(recipe.image_url) +
            '" class="recipe-img" alt="' +
            esc(recipe.title) +
            '">';

    } else {

        image =
            '<div class="recipe-placeholder">' +
            '<i class="bi bi-egg-fried"></i>' +
            '</div>';
    }


    let buttons = "";


    if (owner) {

        buttons =

            '<div class="d-flex gap-2 mt-3">' +

            '<a href="edit-recipe.html?id=' +
            encodeURIComponent(recipe.id) +
            '" class="btn btn-warning flex-fill">' +

            '<i class="bi bi-pencil me-1"></i>' +
            'Edit' +

            '</a>' +

            '<button class="btn btn-outline-danger delete-btn" ' +
            'data-id="' + recipe.id + '">' +

            '<i class="bi bi-trash me-1"></i>' +
            'Delete' +

            '</button>' +

            '</div>';
    }


    return (

        '<div class="col-md-6 col-lg-4">' +

        '<article class="recipe-card">' +

        image +

        '<div class="recipe-body">' +

        '<div class="d-flex justify-content-between gap-2 mb-2">' +

        '<span class="category-pill">' +

        esc(recipe.category || "Recipe") +

        '</span>' +


        (recipe.cooking_time

            ? '<small class="text-muted">' +
              '<i class="bi bi-clock me-1"></i>' +
              esc(recipe.cooking_time) +
              '</small>'

            : "") +

        '</div>' +


        '<h5 class="fw-bold mb-2">' +

        esc(recipe.title) +

        '</h5>' +


        '<p class="text-muted small mb-0">' +

        esc(
            recipe.description ||
            "A delicious recipe shared by the community."
        ) +

        '</p>' +


        '<a href="recipe-details.html?id=' +
        encodeURIComponent(recipe.id) +
        '" class="btn btn-soft w-100 mt-3">' +

        'View Recipe' +

        '</a>' +


        buttons +

        '</div>' +

        '</article>' +

        '</div>'
    );
}


// ===============================
// GET USERNAME
// ===============================

async function getUsername(user) {

    const result = await supabaseClient
        .from("users")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();


    if (result.data) {

        return result.data.username;
    }


    if (user.email) {

        return user.email.split("@")[0];
    }


    return "Chef";
}


// ===============================
// GET MY RECIPES
// ===============================

async function getMyRecipes() {

    const user = await checkUser();

    if (!user) {

        return [];
    }


    const result = await supabaseClient
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });


    if (result.error) {

        showMessage(
            result.error.message,
            "danger"
        );

        return [];
    }


    return result.data || [];
}


// ===============================
// DELETE RECIPE
// ===============================

async function deleteRecipe(id) {

    const user = await checkUser();

    if (!user) {

        return;
    }


    const answer = confirm(
        "Are you sure you want to delete this recipe?"
    );


    if (!answer) {

        return;
    }


    const result = await supabaseClient
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);


    if (result.error) {

        showMessage(
            result.error.message,
            "danger"
        );

        return;
    }


    showMessage(
        "Recipe deleted successfully.",
        "success"
    );


    setTimeout(function () {

        location.reload();

    }, 500);
}


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    async function () {


        // =========================
        // PASSWORD SHOW / HIDE
        // =========================

        const passwordButtons =
            document.querySelectorAll(".pw-toggle");


        passwordButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const input =
                            button.parentElement
                            .querySelector("input");


                        const icon =
                            button.querySelector("i");


                        if (input.type === "password") {

                            input.type = "text";

                            if (icon) {

                                icon.className =
                                    "bi bi-eye-slash";
                            }

                        } else {

                            input.type = "password";

                            if (icon) {

                                icon.className =
                                    "bi bi-eye";
                            }
                        }

                    }
                );

            }
        );


        // =========================
        // CURRENT USER
        // =========================

        const user = await getUser();


        // =========================
        // LOGOUT
        // =========================

        const logoutButton =
            document.getElementById("logoutBtn");


        const loginButton =
            document.getElementById("loginBtn");


        const signupButton =
            document.getElementById("signupBtn");


        if (logoutButton) {

            if (user) {

                logoutButton.classList.remove("d-none");

            } else {

                logoutButton.classList.add("d-none");
            }


            logoutButton.onclick =
                async function () {

                    await supabaseClient.auth.signOut();

                    window.location.href =
                        "login.html";
                };
        }


        if (user) {

            if (loginButton) {

                loginButton.classList.add("d-none");
            }


            if (signupButton) {

                signupButton.classList.add("d-none");
            }

        } else {

            const links =
                document.querySelectorAll(".protected-link");


            links.forEach(function (link) {

                link.href = "login.html";

            });
        }


        // =========================
        // SIGNUP
        // =========================

        const signupForm =
            document.getElementById("signupForm");


        if (signupForm) {

            signupForm.addEventListener(
                "submit",
                async function (e) {

                    e.preventDefault();


                    const username =
                        document.getElementById("username")
                        .value
                        .trim();


                    const email =
                        document.getElementById("email")
                        .value
                        .trim();


                    const password =
                        document.getElementById("password")
                        .value
                        .trim();


                    if (
                        username === "" ||
                        email === "" ||
                        password === ""
                    ) {

                        showMessage(
                            "Please fill all fields.",
                            "warning"
                        );

                        return;
                    }


                    const result =
                        await supabaseClient.auth.signUp({

                            email: email,

                            password: password

                        });


                    if (result.error) {

                        showMessage(
                            result.error.message,
                            "danger"
                        );

                        return;
                    }


                    if (!result.data.user) {

                        showMessage(
                            "Signup failed.",
                            "danger"
                        );

                        return;
                    }


                    const userData = {

                        id: result.data.user.id,

                        username: username
                    };


                    const userResult =
                        await supabaseClient
                        .from("users")
                        .insert([userData]);


                    if (userResult.error) {

                        showMessage(
                            "Account created, but username could not be saved.",
                            "warning"
                        );

                        return;
                    }


                    showMessage(
                        "Account created successfully!",
                        "success"
                    );


                    setTimeout(function () {

                        window.location.href =
                            "dashboard.html";

                    }, 700);

                }
            );
        }


        // =========================
        // LOGIN
        // =========================

        const loginForm =
            document.getElementById("loginForm");


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async function (e) {

                    e.preventDefault();


                    const email =
                        document.getElementById("email")
                        .value
                        .trim();


                    const password =
                        document.getElementById("password")
                        .value
                        .trim();


                    if (
                        email === "" ||
                        password === ""
                    ) {

                        showMessage(
                            "Please enter email and password.",
                            "warning"
                        );

                        return;
                    }


                    const result =
                        await supabaseClient.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                    if (result.error) {

                        showMessage(
                            result.error.message,
                            "danger"
                        );

                        return;
                    }


                    window.location.href =
                        "dashboard.html";

                }
            );
        }


        // =========================
        // HOME PAGE
        // =========================

        const homeContainer =
            document.getElementById(
                "homeRecipesContainer"
            );


        if (homeContainer) {

            const result =
                await supabaseClient
                .from("recipes")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(6);


            if (result.error) {

                homeContainer.innerHTML = `

                    <div class="col-12">

                        <div class="panel empty-state">

                            <i class="bi bi-exclamation-circle fs-1 text-danger"></i>

                            <h5 class="fw-bold mt-3">
                                Could not load recipes
                            </h5>

                            <p class="text-muted">
                                ${esc(result.error.message)}
                            </p>

                        </div>

                    </div>
                `;

            } else if (
                !result.data ||
                result.data.length === 0
            ) {

                homeContainer.innerHTML = `

                    <div class="col-12">

                        <div class="panel empty-state">

                            <i class="bi bi-journal-plus fs-1 text-primary"></i>

                            <h5 class="fw-bold mt-3">
                                No recipes shared yet
                            </h5>

                            <p class="text-muted">
                                Be the first person to share a recipe.
                            </p>

                            <a href="create-recipe.html"
                               class="btn btn-primary">
                               Share Recipe
                            </a>

                        </div>

                    </div>
                `;

            } else {

                homeContainer.innerHTML = "";


                result.data.forEach(
                    function (recipe) {

                        homeContainer.innerHTML +=
                            recipeCard(recipe, false);

                    }
                );
            }
        }


        // =========================
        // DASHBOARD
        // =========================

        const dashboardContainer =
            document.getElementById(
                "recipesContainer"
            );


        if (dashboardContainer) {

            const dashboardUser =
                await checkUser();


            if (!dashboardUser) {

                return;
            }


            const usernameElement =
                document.getElementById(
                    "username"
                );


            if (usernameElement) {

                usernameElement.innerText =
                    await getUsername(
                        dashboardUser
                    );
            }


            const recipes =
                await getMyRecipes();


            document.getElementById(
                "totalRecipes"
            ).innerText =
                recipes.length;


            document.getElementById(
                "recentCount"
            ).innerText =
                Math.min(
                    recipes.length,
                    5
                );


            dashboardContainer.innerHTML = "";


            if (recipes.length === 0) {

                dashboardContainer.innerHTML = `

                    <div class="col-12">

                        <div class="panel empty-state">

                            <i class="bi bi-journal-plus fs-1 text-primary"></i>

                            <h4 class="fw-bold mt-3">
                                No recipes yet
                            </h4>

                            <p class="text-muted">
                                Share your first recipe with the community.
                            </p>

                            <a href="create-recipe.html"
                               class="btn btn-primary">
                               Add Your First Recipe
                            </a>

                        </div>

                    </div>
                `;

            } else {

                const recentRecipes =
                    recipes.slice(0, 3);


                recentRecipes.forEach(
                    function (recipe) {

                        dashboardContainer.innerHTML +=
                            recipeCard(recipe, true);

                    }
                );
            }


            const deleteButtons =
                dashboardContainer
                .querySelectorAll(".delete-btn");


            deleteButtons.forEach(
                function (button) {

                    button.onclick =
                        function () {

                            deleteRecipe(
                                button.dataset.id
                            );

                        };

                }
            );
        }


        // =========================
        // MY RECIPES
        // =========================

        const myContainer =
            document.getElementById(
                "myRecipesContainer"
            );


        if (myContainer) {

            const recipes =
                await getMyRecipes();


            myContainer.innerHTML = "";


            if (recipes.length === 0) {

                myContainer.innerHTML = `

                    <div class="col-12">

                        <div class="panel empty-state">

                            <i class="bi bi-journal-plus fs-1 text-primary"></i>

                            <h4 class="fw-bold mt-3">
                                Your collection is empty
                            </h4>

                            <a href="create-recipe.html"
                               class="btn btn-primary">
                               Create Recipe
                            </a>

                        </div>

                    </div>
                `;

            } else {

                recipes.forEach(
                    function (recipe) {

                        myContainer.innerHTML +=
                            recipeCard(recipe, true);

                    }
                );
            }


            const deleteButtons =
                myContainer.querySelectorAll(
                    ".delete-btn"
                );


            deleteButtons.forEach(
                function (button) {

                    button.onclick =
                        function () {

                            deleteRecipe(
                                button.dataset.id
                            );

                        };

                }
            );
        }


        // =========================
        // ALL RECIPES
        // =========================

        const allContainer =
            document.getElementById(
                "allRecipesContainer"
            );


        if (allContainer) {

            let allRecipes = [];


            const result =
                await supabaseClient
                .from("recipes")
                .select("*")
                .order("created_at", {
                    ascending: false
                });


            if (result.error) {

                showMessage(
                    result.error.message,
                    "danger"
                );

            } else {

                allRecipes =
                    result.data || [];
            }


            function displayRecipes() {

                const searchInput =
                    document.getElementById(
                        "searchInput"
                    );


                const categoryFilter =
                    document.getElementById(
                        "categoryFilter"
                    );


                const search =
                    searchInput.value
                    .toLowerCase()
                    .trim();


                const category =
                    categoryFilter.value;


                let filteredRecipes =
                    allRecipes.filter(
                        function (recipe) {

                            let titleMatch =
                                recipe.title
                                .toLowerCase()
                                .includes(search);


                            let categoryMatch =
                                category === "" ||
                                recipe.category === category;


                            return (
                                titleMatch &&
                                categoryMatch
                            );

                        }
                    );


                allContainer.innerHTML = "";


                if (filteredRecipes.length === 0) {

                    allContainer.innerHTML = `

                        <div class="col-12">

                            <div class="panel empty-state">

                                <i class="bi bi-search fs-1 text-muted"></i>

                                <h4 class="fw-bold mt-3">
                                    No recipes found
                                </h4>

                                <p class="text-muted">
                                    Try another title or category.
                                </p>

                            </div>

                        </div>
                    `;

                    return;
                }


                filteredRecipes.forEach(
                    function (recipe) {

                        allContainer.innerHTML +=
                            recipeCard(
                                recipe,
                                false
                            );

                    }
                );
            }


            displayRecipes();


            document
                .getElementById("searchInput")
                .addEventListener(
                    "input",
                    displayRecipes
                );


            document
                .getElementById("categoryFilter")
                .addEventListener(
                    "change",
                    displayRecipes
                );


            document
                .getElementById("clearFilters")
                .addEventListener(
                    "click",
                    function () {

                        document.getElementById(
                            "searchInput"
                        ).value = "";


                        document.getElementById(
                            "categoryFilter"
                        ).value = "";


                        displayRecipes();

                    }
                );
        }


        // =========================
        // CREATE RECIPE
        // =========================

        const recipeForm =
            document.getElementById(
                "recipeForm"
            );


        if (recipeForm) {

            recipeForm.addEventListener(
                "submit",
                async function (e) {

                    e.preventDefault();


                    const user =
                        await checkUser();


                    if (!user) {

                        return;
                    }


                    const title =
                        document.getElementById(
                            "title"
                        ).value.trim();


                    const description =
                        document.getElementById(
                            "description"
                        ).value.trim();


                    const category =
                        document.getElementById(
                            "category"
                        ).value;


                    const ingredients =
                        document.getElementById(
                            "ingredients"
                        ).value.trim();


                    const instructions =
                        document.getElementById(
                            "instructions"
                        ).value.trim();


                    const cookingTime =
                        document.getElementById(
                            "cooking_time"
                        ).value.trim();


                    const image =
                        document.getElementById(
                            "image"
                        ).files[0];


                    if (
                        title === "" ||
                        description === "" ||
                        category === "" ||
                        ingredients === "" ||
                        instructions === ""
                    ) {

                        showMessage(
                            "Please fill all required fields.",
                            "warning"
                        );

                        return;
                    }


                    let imageUrl = "";


                    // Upload Image

                    if (image) {

                        const fileName =
                            user.id +
                            "/" +
                            Date.now() +
                            "-" +
                            image.name.replaceAll(
                                " ",
                                "-"
                            );


                        const upload =
                            await supabaseClient
                            .storage
                            .from("recipe-images")
                            .upload(
                                fileName,
                                image
                            );


                        if (upload.error) {

                            showMessage(
                                upload.error.message,
                                "danger"
                            );

                            return;
                        }


                        const imageResult =
                            supabaseClient
                            .storage
                            .from("recipe-images")
                            .getPublicUrl(
                                fileName
                            );


                        imageUrl =
                            imageResult.data.publicUrl;
                    }


                    // Recipe Data

                    const recipeData = {

                        user_id: user.id,

                        title: title,

                        description: description,

                        category: category,

                        ingredients: ingredients,

                        instructions: instructions,

                        cooking_time: cookingTime,

                        image_url: imageUrl,

                        created_at:
                            new Date().toISOString()
                    };


                    const result =
                        await supabaseClient
                        .from("recipes")
                        .insert([
                            recipeData
                        ]);


                    if (result.error) {

                        showMessage(
                            result.error.message,
                            "danger"
                        );

                        return;
                    }


                    showMessage(
                        "Recipe published successfully!",
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "dashboard.html";

                        },
                        700
                    );

                }
            );
        }


        // =========================
        // EDIT RECIPE
        // =========================

        const editForm =
            document.getElementById(
                "editRecipeForm"
            );


        if (editForm) {

            const user =
                await checkUser();


            if (!user) {

                return;
            }


            const url =
                new URLSearchParams(
                    window.location.search
                );


            const id =
                url.get("id");


            if (!id) {

                showMessage(
                    "Recipe ID is missing.",
                    "danger"
                );

                return;
            }


            const result =
                await supabaseClient
                .from("recipes")
                .select("*")
                .eq("id", id)
                .eq("user_id", user.id)
                .single();


            if (
                result.error ||
                !result.data
            ) {

                showMessage(
                    "Recipe not found or you do not own it.",
                    "danger"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "my-recipes.html";

                    },
                    900
                );


                return;
            }


            const recipe =
                result.data;


            document.getElementById(
                "title"
            ).value =
                recipe.title || "";


            document.getElementById(
                "description"
            ).value =
                recipe.description || "";


            document.getElementById(
                "category"
            ).value =
                recipe.category || "";


            document.getElementById(
                "ingredients"
            ).value =
                recipe.ingredients || "";


            document.getElementById(
                "instructions"
            ).value =
                recipe.instructions || "";


            document.getElementById(
                "cooking_time"
            ).value =
                recipe.cooking_time || "";


            // UPDATE

            editForm.addEventListener(
                "submit",
                async function (e) {

                    e.preventDefault();


                    const updates = {

                        title:
                            document.getElementById(
                                "title"
                            ).value.trim(),


                        description:
                            document.getElementById(
                                "description"
                            ).value.trim(),


                        category:
                            document.getElementById(
                                "category"
                            ).value,


                        ingredients:
                            document.getElementById(
                                "ingredients"
                            ).value.trim(),


                        instructions:
                            document.getElementById(
                                "instructions"
                            ).value.trim(),


                        cooking_time:
                            document.getElementById(
                                "cooking_time"
                            ).value.trim(),


                        updated_at:
                            new Date().toISOString()

                    };


                    const image =
                        document.getElementById(
                            "image"
                        ).files[0];


                    if (image) {

                        const fileName =
                            user.id +
                            "/" +
                            Date.now() +
                            "-" +
                            image.name.replaceAll(
                                " ",
                                "-"
                            );


                        const upload =
                            await supabaseClient
                            .storage
                            .from("recipe-images")
                            .upload(
                                fileName,
                                image
                            );


                        if (upload.error) {

                            showMessage(
                                upload.error.message,
                                "danger"
                            );

                            return;
                        }


                        const imageResult =
                            supabaseClient
                            .storage
                            .from("recipe-images")
                            .getPublicUrl(
                                fileName
                            );


                        updates.image_url =
                            imageResult.data.publicUrl;
                    }


                    const updateResult =
                        await supabaseClient
                        .from("recipes")
                        .update(updates)
                        .eq("id", id)
                        .eq("user_id", user.id);


                    if (updateResult.error) {

                        showMessage(
                            updateResult.error.message,
                            "danger"
                        );

                        return;
                    }


                    showMessage(
                        "Recipe updated successfully!",
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "my-recipes.html";

                        },
                        700
                    );

                }
            );
        }


        // =========================
        // RECIPE DETAILS
        // =========================

        const details =
            document.getElementById(
                "recipeDetails"
            );


        if (details) {

            const url =
                new URLSearchParams(
                    window.location.search
                );


            const id =
                url.get("id");


            if (!id) {

                return;
            }


            const result =
                await supabaseClient
                .from("recipes")
                .select("*")
                .eq("id", id)
                .single();


            if (
                result.error ||
                !result.data
            ) {

                details.innerHTML = `

                    <div class="empty-state">

                        <h3>
                            Recipe not found
                        </h3>

                    </div>
                `;

                return;
            }


            const recipe =
                result.data;


            // Recipe Image

            let image = "";


            if (recipe.image_url) {

                image =
                    '<img src="' +
                    esc(recipe.image_url) +
                    '" class="detail-img" alt="' +
                    esc(recipe.title) +
                    '">';

            } else {

                image =
                    '<div class="recipe-placeholder detail-img">' +
                    '<i class="bi bi-egg-fried"></i>' +
                    '</div>';
            }


            // Ingredients

            let ingredients = "";


            if (recipe.ingredients) {

                const ingredientList =
                    recipe.ingredients.split("\n");


                ingredientList.forEach(
                    function (item) {

                        if (item.trim() !== "") {

                            ingredients +=
                                "<li>" +
                                esc(item) +
                                "</li>";
                        }

                    }
                );
            }


            // Display Recipe

            details.innerHTML = `

                <div class="row g-5 align-items-start">

                    <div class="col-lg-6">

                        ${image}

                    </div>


                    <div class="col-lg-6">

                        <span class="category-pill">

                            ${esc(
                                recipe.category ||
                                "Recipe"
                            )}

                        </span>


                        <h1 class="page-title mt-3">

                            ${esc(recipe.title)}

                        </h1>


                        <p class="lead text-muted">

                            ${esc(
                                recipe.description || ""
                            )}

                        </p>


                        <div class="d-flex gap-3 flex-wrap mb-4">

                            <span class="text-muted">

                                <i class="bi bi-clock me-1"></i>

                                ${esc(
                                    recipe.cooking_time ||
                                    "Not specified"
                                )}

                            </span>


                            <span class="text-muted">

                                <i class="bi bi-calendar3 me-1"></i>

                                ${
                                    recipe.created_at
                                    ? new Date(
                                        recipe.created_at
                                      ).toLocaleDateString()
                                    : ""
                                }

                            </span>

                        </div>


                        <div class="panel p-4">

                            <h5 class="fw-bold">
                                Ingredients
                            </h5>


                            <ul class="ingredient-list mt-3">

                                ${ingredients}

                            </ul>

                        </div>

                    </div>

                </div>


                <div class="row mt-5">

                    <div class="col-lg-9">

                        <div class="panel p-4 p-md-5">

                            <h4 class="fw-bold mb-3">

                                Instructions

                            </h4>


                            <div class="instructions">

                                ${esc(
                                    recipe.instructions ||
                                    ""
                                )}

                            </div>

                        </div>

                    </div>

                </div>
            `;
        }

    }
);