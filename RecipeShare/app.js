javascript
const supabaseUrl = "https://ssudtbgcmsvdykpsssmm.supabase.co";
const supabaseKey = "sb_publishable_DNtIhkKaqtT_mSvSUYZvNw_92enOKm8";

const { createClient } = supabase;

const client = createClient(supabaseUrl, supabaseKey);

console.log(client);


document.addEventListener("DOMContentLoaded", async () => {

    console.log("App started");


    const loginBtn = document.querySelector("#loginBtn");
    const signupBtn = document.querySelector("#signupBtn");
    const logoutBtn = document.querySelector("#logoutBtn");
    const protectedLinks = document.querySelectorAll(".protected-link");


    const {
        data: { user }
    } = await client.auth.getUser();


    console.log("Current User:", user);


    if (user) {

        if (loginBtn) {
            loginBtn.classList.add("d-none");
        }

        if (signupBtn) {
            signupBtn.classList.add("d-none");
        }

        if (logoutBtn) {
            logoutBtn.classList.remove("d-none");
        }

    }
    else {

        if (loginBtn) {
            loginBtn.classList.remove("d-none");
        }

        if (signupBtn) {
            signupBtn.classList.remove("d-none");
        }

        if (logoutBtn) {
            logoutBtn.classList.add("d-none");
        }

    }



    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            try {

                const { error } = await client.auth.signOut();

                if (error) {

                    console.log(error.message);

                    alert(error.message);

                    return;

                }

                window.location.href = "index.html";

            }

            catch (error) {

                console.log(error);

                alert(error.message);

            }

        });

    }



    const signupForm = document.querySelector("#signupForm");


    if (signupForm) {

        signupForm.addEventListener("submit", async (event) => {

            try {

                event.preventDefault();

                console.log("Signup started");


                const username =
                    document.querySelector("#username");

                const email =
                    document.querySelector("#email");

                const password =
                    document.querySelector("#password");


                if (username.value.trim() === "") {

                    alert("Please enter username");

                    return;

                }


                if (email.value.trim() === "") {

                    alert("Please enter email");

                    return;

                }


                if (password.value.trim() === "") {

                    alert("Please enter password");

                    return;

                }


                const { data, error: signupError } =
                    await client.auth.signUp({

                        email: email.value,

                        password: password.value

                    });


                console.log("Signup Data:", data);

                console.log("Signup Error:", signupError);


                if (signupError) {

                    console.log(signupError.message);

                    alert(signupError.message);

                    return;

                }


                const id = data.user?.id;


                console.log("User ID:", id);


                if (!id) {

                    alert("User ID not found");

                    return;

                }


                const { error: databaseError } =
                    await client
                        .from("Users")
                        .insert({

                            id: id,

                            username: username.value

                        });


                console.log(
                    "Database Error:",
                    databaseError
                );


                if (databaseError) {

                    console.log(
                        databaseError.message
                    );

                    alert(databaseError.message);

                    return;

                }


                alert("Account created successfully!");


                window.location.href = "dashboard.html";

            }

            catch (error) {

                console.log(error);

                alert(error.message);

            }

        });

    }


    const loginForm = document.querySelector("#loginForm");


    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            try {

                event.preventDefault();

                console.log("Login started");


                const email =
                    document.querySelector("#email");

                const password =
                    document.querySelector("#password");


                if (email.value.trim() === "") {

                    alert("Please enter email");

                    return;

                }


                if (password.value.trim() === "") {

                    alert("Please enter password");

                    return;

                }


                const { data, error } =
                    await client.auth.signInWithPassword({

                        email: email.value,

                        password: password.value

                    });


                console.log("Login Data:", data);

                console.log("Login Error:", error);


                if (error) {

                    alert(error.message);

                    return;

                }


                alert("Login successful!");


                window.location.href = "dashboard.html";

            }

            catch (error) {

                console.log(error);

                alert(error.message);

            }

        });

    }




    const myRecipesContainer =
        document.querySelector("#myRecipesContainer");


    if (myRecipesContainer) {

        console.log("My Recipes page");


        if (!user) {

            window.location.href = "login.html";

            return;

        }


        const { data: recipes, error } =
            await client
                .from("recipes")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false
                });


        console.log("My Recipes:", recipes);

        console.log("My Recipes Error:", error);


        if (error) {

            myRecipesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        ${error.message}
                    </div>
                </div>
            `;

            return;

        }


        if (!recipes || recipes.length === 0) {

            myRecipesContainer.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <h4>No recipes found</h4>
                        <p class="text-muted">
                            You have not created any recipes yet.
                        </p>
                        <a href="create-recipe.html"
                           class="btn btn-primary">
                            Create Recipe
                        </a>
                    </div>
                </div>
            `;

            return;

        }


        myRecipesContainer.innerHTML = "";


        recipes.forEach((recipe) => {

            myRecipesContainer.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="card h-100 shadow-sm">

                        ${
                            recipe.image_url
                            ?
                            `
                            <img
                                src="${recipe.image_url}"
                                class="card-img-top"
                                style="height:220px; object-fit:cover;"
                            >
                            `
                            :
                            ""
                        }

                        <div class="card-body">

                            <span class="badge bg-primary mb-2">
                                ${recipe.category || "Recipe"}
                            </span>

                            <h5 class="card-title">
                                ${recipe.title}
                            </h5>

                            <p class="card-text text-muted">
                                ${
                                    recipe.description
                                    || "No description available."
                                }
                            </p>

                            <div class="d-flex gap-2">

                                <a
                                    href="recipe-details.html?id=${recipe.id}"
                                    class="btn btn-primary btn-sm"
                                >
                                    View
                                </a>

                                <a
                                    href="edit-recipe.html?id=${recipe.id}"
                                    class="btn btn-outline-primary btn-sm"
                                >
                                    Edit
                                </a>

                                <button
                                    class="btn btn-outline-danger btn-sm delete-recipe"
                                    data-id="${recipe.id}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            `;
