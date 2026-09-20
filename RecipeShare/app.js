const supabaseUrl = "https://ssudtbgcmsvdykpsssmm.supabase.co";
const supabaseKey = "sb_publishable_DNtIhkKaqtT_mSvSUYZvNw_92enOKm8";


const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);



// COMMON FUNCTIONS


function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


async function getCurrentUser() {
    const {
        data: { user },
        error
    } = await client.auth.getUser();

    if (error) {
        console.log("Get User Error:", error);
        return null;
    }

    return user;
}


async function getOrCreateUserProfile(user) {

    if (!user) {
        return null;
    }

    const {
        data: profile,
        error
    } = await client
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.log("Profile Fetch Error:", error);
        return null;
    }

    if (profile) {
        return profile;
    }

    const username =
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Chef";

    const {
        data: newProfile,
        error: insertError
    } = await client
        .from("users")
        .insert({
            id: user.id,
            username: username
        })
        .select()
        .single();

    if (insertError) {
        console.log("Profile Insert Error:", insertError);

        // Profile RLS ki wajah se create na ho sake
        // to auth metadata se username use kar lenge.
        return {
            id: user.id,
            username: username
        };
    }

    return newProfile;
}



// NAVBAR + AUTH STATE


async function setupNavbar() {

    const loginBtn = document.querySelector("#loginBtn");
    const signupBtn = document.querySelector("#signupBtn");
    const logoutBtn = document.querySelector("#logoutBtn");
    const protectedLinks =
        document.querySelectorAll(".protected-link");

    const user = await getCurrentUser();

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

        protectedLinks.forEach((link) => {
            link.classList.remove("d-none");
        });

    } else {

        if (loginBtn) {
            loginBtn.classList.remove("d-none");
        }

        if (signupBtn) {
            signupBtn.classList.remove("d-none");
        }

        if (logoutBtn) {
            logoutBtn.classList.add("d-none");
        }

        protectedLinks.forEach((link) => {
            link.classList.add("d-none");
        });
    }

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            const { error } = await client.auth.signOut();

            if (error) {
                alert(error.message);
                return;
            }

            window.location.href = "index.html";
        });
    }
}


// SIGN UP

async function setupSignup() {

    const signupForm = document.querySelector("#signupForm");

    if (!signupForm) {
        return;
    }

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const usernameInput =
            document.querySelector("#username");

        const emailInput =
            document.querySelector("#email");

        const passwordInput =
            document.querySelector("#password");


        const username =
            usernameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!username) {
            alert("Please enter username.");
            return;
        }

        if (!email) {
            alert("Please enter email.");
            return;
        }

        if (!password) {
            alert("Please enter password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }


        try {

            const {
                data,
                error
            } = await client.auth.signUp({

                email: email,

                password: password,

                options: {
                    data: {
                        username: username
                    }
                }

            });


            if (error) {
                console.log("Signup Error:", error);
                alert(error.message);
                return;
            }


            const user = data.user;

            if (!user) {
                alert("Account could not be created.");
                return;
            }


            if (data.session) {

                const {
                    error: profileError
                } = await client
                    .from("users")
                    .insert({
                        id: user.id,
                        username: username
                    });


                if (profileError) {

                    console.log(
                        "Users table error:",
                        profileError
                    );

                    if (
                        !profileError.message
                            .toLowerCase()
                            .includes("duplicate")
                    ) {

                        alert(
                            "Account created, but username could not be saved: " +
                            profileError.message
                        );

                        return;
                    }
                }


                alert("Account created successfully!");

                window.location.href = "dashboard.html";

            } else {

                alert(
                    "Account created! Please confirm your email and then login."
                );

                window.location.href = "login.html";
            }

        } catch (error) {

            console.log(error);
            alert(error.message);
        }

    });
}



// LOGIN


async function setupLogin() {

    const loginForm =
        document.querySelector("#loginForm");

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const emailInput =
            document.querySelector("#email");

        const passwordInput =
            document.querySelector("#password");


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email) {
            alert("Please enter email.");
            return;
        }

        if (!password) {
            alert("Please enter password.");
            return;
        }


        try {

            const {
                data,
                error
            } = await client.auth.signInWithPassword({

                email: email,

                password: password

            });


            if (error) {
                console.log("Login Error:", error);
                alert(error.message);
                return;
            }


            if (!data.user) {
                alert("Login failed.");
                return;
            }



            await getOrCreateUserProfile(data.user);


            alert("Login successful!");

            window.location.href = "dashboard.html";


        } catch (error) {

            console.log(error);
            alert(error.message);
        }

    });
}



// CREATE RECIPE


async function setupCreateRecipe() {

    const recipeForm =
        document.querySelector("#recipeForm");

    if (!recipeForm) {
        return;
    }


    const user = await getCurrentUser();


    if (!user) {

        window.location.href = "login.html";
        return;
    }


    recipeForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        try {

            const title =
                document.querySelector("#title");

            const category =
                document.querySelector("#category");

            const description =
                document.querySelector("#description");

            const cookingTime =
                document.querySelector("#cooking_time");

            const ingredients =
                document.querySelector("#ingredients");

            const instructions =
                document.querySelector("#instructions");

            const image =
                document.querySelector("#image");


            if (!title.value.trim()) {
                alert("Please enter recipe title.");
                return;
            }

            if (!category.value.trim()) {
                alert("Please select category.");
                return;
            }

            if (!ingredients.value.trim()) {
                alert("Please enter ingredients.");
                return;
            }

            if (!instructions.value.trim()) {
                alert("Please enter instructions.");
                return;
            }


            let imageUrl = "";
            let imagePath = "";


            // ==========================================
            // IMAGE UPLOAD
           

            if (
                image &&
                image.files &&
                image.files.length > 0
            ) {

                const file =
                    image.files[0];


                const extension =
                    file.name.includes(".")
                        ? file.name.split(".").pop()
                        : "jpg";


                const fileName =
                    `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;


                const {
                    data: uploadData,
                    error: uploadError
                } = await client
                    .storage
                    .from("post")
                    .upload(
                        fileName,
                        file,
                        {
                            cacheControl: "3600",
                            contentType: file.type,
                            upsert: false
                        }
                    );


                console.log(
                    "Upload Data:",
                    uploadData
                );


                if (uploadError) {

                    console.log(
                        "Upload Error:",
                        uploadError
                    );

                    alert(
                        "Image upload failed: " +
                        uploadError.message
                    );

                    return;
                }


                const {
                    data: publicUrlData
                } = client
                    .storage
                    .from("post")
                    .getPublicUrl(fileName);


                imageUrl =
                    publicUrlData.publicUrl;

                imagePath =
                    fileName;
            }


           
            // INSERT RECIPE

            const {
                data,
                error
            } = await client
                .from("recipes")
                .insert({

                    user_id: user.id,

                    title: title.value.trim(),

                    category: category.value,

                    description:
                        description.value.trim(),

                    cooking_time:
                        cookingTime.value.trim(),

                    ingredients:
                        ingredients.value.trim(),

                    instructions:
                        instructions.value.trim(),

                    image_url: imageUrl,

                    image_path: imagePath

                })
                .select()
                .single();


            console.log(
                "Recipe Data:",
                data
            );


            if (error) {

                console.log(
                    "Recipe Insert Error:",
                    error
                );




                if (imagePath) {

                    await client
                        .storage
                        .from("post")
                        .remove([imagePath]);
                }


                alert(error.message);
                return;
            }


            alert("Recipe published successfully!");

            window.location.href =
                "my-recipes.html";


        } catch (error) {

            console.log(error);

            alert(error.message);
        }

    });
}



// MY RECIPES


async function setupMyRecipes() {

    const container =
        document.querySelector("#myRecipesContainer");

    if (!container) {
        return;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    const {
        data: recipes,
        error
    } = await client
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.log(
            "My Recipes Error:",
            error
        );

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>
            </div>
        `;

        return;
    }


    if (!recipes || recipes.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">

                    <h4>No recipes found</h4>

                    <p class="text-muted">
                        You have not created any recipes yet.
                    </p>

                    <a
                        href="create-recipe.html"
                        class="btn btn-primary"
                    >
                        Create Recipe
                    </a>

                </div>
            </div>
        `;

        return;
    }


    renderMyRecipes(
        container,
        recipes,
        user.id
    );
}


function renderMyRecipes(
    container,
    recipes,
    userId
) {

    container.innerHTML = "";


    recipes.forEach((recipe) => {

        const imageHTML =
            recipe.image_url
                ? `
                    <img
                        src="${escapeHtml(recipe.image_url)}"
                        class="card-img-top"
                        style="height:220px; object-fit:cover;"
                        alt="${escapeHtml(recipe.title)}"
                    >
                `
                : `
                    <div
                        class="bg-light d-flex align-items-center justify-content-center"
                        style="height:220px;"
                    >
                        <i class="bi bi-image fs-1 text-muted"></i>
                    </div>
                `;


        container.innerHTML += `

            <div class="col-md-6 col-lg-4">

                <div class="card h-100 shadow-sm">

                    ${imageHTML}

                    <div class="card-body">

                        <span class="badge bg-primary mb-2">
                            ${escapeHtml(recipe.category || "Recipe")}
                        </span>

                        <h5 class="card-title">
                            ${escapeHtml(recipe.title)}
                        </h5>

                        <p class="card-text text-muted">
                            ${
                                escapeHtml(
                                    recipe.description ||
                                    "No description available."
                                )
                            }
                        </p>

                        <p class="small text-muted">
                            ${
                                recipe.created_at
                                    ? new Date(
                                        recipe.created_at
                                      ).toLocaleDateString()
                                    : ""
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
    });


    // DELETE BUTTONS

    const deleteButtons =
        container.querySelectorAll(
            ".delete-recipe"
        );


    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async () => {

                const recipeId =
                    button.getAttribute("data-id");


                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this recipe?"
                    );


                if (!confirmDelete) {
                    return;
                }


                try {

                    // First get image path

                    const {
                        data: recipe,
                        error: fetchError
                    } = await client
                        .from("recipes")
                        .select("image_path")
                        .eq("id", recipeId)
                        .eq("user_id", userId)
                        .single();


                    if (fetchError) {

                        alert(
                            fetchError.message
                        );

                        return;
                    }


                    // Delete recipe from database

                    const {
                        error: deleteError
                    } = await client
                        .from("recipes")
                        .delete()
                        .eq("id", recipeId)
                        .eq("user_id", userId);


                    if (deleteError) {

                        alert(
                            deleteError.message
                        );

                        return;
                    }


                    // Delete image from storage

                    if (recipe?.image_path) {

                        const {
                            error: storageError
                        } = await client
                            .storage
                            .from("post")
                            .remove([
                                recipe.image_path
                            ]);


                        if (storageError) {

                            console.log(
                                "Storage Delete Error:",
                                storageError
                            );
                        }
                    }


                    alert(
                        "Recipe deleted successfully!"
                    );


                    window.location.reload();


                } catch (error) {

                    console.log(error);

                    alert(error.message);
                }

            }
        );

    });
}



// EDIT RECIPE


async function setupEditRecipe() {

    const editForm =
        document.querySelector("#editRecipeForm");

    if (!editForm) {
        return;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const recipeId =
        urlParams.get("id");


    if (!recipeId) {

        alert("Recipe ID not found.");

        window.location.href =
            "my-recipes.html";

        return;
    }


    const title =
        document.querySelector("#title");

    const category =
        document.querySelector("#category");

    const description =
        document.querySelector("#description");

    const cookingTime =
        document.querySelector("#cooking_time");

    const ingredients =
        document.querySelector("#ingredients");

    const instructions =
        document.querySelector("#instructions");

    const image =
        document.querySelector("#image");


    // ==========================================
    // GET RECIPE
    // ==========================================

    const {
        data: recipe,
        error
    } = await client
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .eq("user_id", user.id)
        .single();


    if (error || !recipe) {

        console.log(
            "Edit Recipe Error:",
            error
        );

        alert(
            "You cannot edit this recipe."
        );

        window.location.href =
            "my-recipes.html";

        return;
    }


    // ==========================================
    // FILL FORM
    // ==========================================

    title.value =
        recipe.title || "";

    category.value =
        recipe.category || "";

    description.value =
        recipe.description || "";

    cookingTime.value =
        recipe.cooking_time || "";

    ingredients.value =
        recipe.ingredients || "";

    instructions.value =
        recipe.instructions || "";


    // ==========================================
    // UPDATE
    // ==========================================

    editForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            try {

                let imageUrl =
                    recipe.image_url || "";

                let imagePath =
                    recipe.image_path || "";


                // ==================================
                // NEW IMAGE
                // ==================================

                if (
                    image &&
                    image.files &&
                    image.files.length > 0
                ) {

                    const file =
                        image.files[0];


                    const extension =
                        file.name.includes(".")
                            ? file.name.split(".").pop()
                            : "jpg";


                    const newFilePath =
                        `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;


                    const {
                        error: uploadError
                    } = await client
                        .storage
                        .from("post")
                        .upload(
                            newFilePath,
                            file,
                            {
                                cacheControl: "3600",
                                contentType: file.type,
                                upsert: false
                            }
                        );


                    if (uploadError) {

                        alert(
                            "Image upload failed: " +
                            uploadError.message
                        );

                        return;
                    }


                    const {
                        data: publicUrlData
                    } = client
                        .storage
                        .from("post")
                        .getPublicUrl(
                            newFilePath
                        );


                    imageUrl =
                        publicUrlData.publicUrl;

                    imagePath =
                        newFilePath;
                }


                // ==================================
                // UPDATE DATABASE
                // ==================================

                const {
                    error: updateError
                } = await client
                    .from("recipes")
                    .update({

                        title:
                            title.value.trim(),

                        category:
                            category.value,

                        description:
                            description.value.trim(),

                        cooking_time:
                            cookingTime.value.trim(),

                        ingredients:
                            ingredients.value.trim(),

                        instructions:
                            instructions.value.trim(),

                        image_url:
                            imageUrl,

                        image_path:
                            imagePath

                    })
                    .eq("id", recipeId)
                    .eq("user_id", user.id);


                if (updateError) {

                    console.log(
                        "Update Error:",
                        updateError
                    );

                    /*
                     * If new image was uploaded
                     * but DB update failed,
                     * remove new image.
                     */

                    if (
                        imagePath &&
                        imagePath !== recipe.image_path
                    ) {

                        await client
                            .storage
                            .from("post")
                            .remove([
                                imagePath
                            ]);
                    }


                    alert(
                        updateError.message
                    );

                    return;
                }


                // ==================================
                // REMOVE OLD IMAGE
                // ==================================

                if (
                    recipe.image_path &&
                    imagePath !== recipe.image_path
                ) {

                    const {
                        error: removeError
                    } = await client
                        .storage
                        .from("post")
                        .remove([
                            recipe.image_path
                        ]);


                    if (removeError) {

                        console.log(
                            "Old Image Delete Error:",
                            removeError
                        );
                    }
                }


                alert(
                    "Recipe updated successfully!"
                );


                window.location.href =
                    "my-recipes.html";


            } catch (error) {

                console.log(error);

                alert(error.message);
            }

        }
    );
}



// DASHBOARD


async function setupDashboard() {

    const container =
        document.querySelector("#recipesContainer");

    if (!container) {
        return;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    // ==========================================
    // USERNAME
    // ==========================================

    const usernameText =
        document.querySelector("#username");


    const profile =
        await getOrCreateUserProfile(user);


    if (usernameText) {

        usernameText.textContent =
            profile?.username ||
            user.user_metadata?.username ||
            user.email?.split("@")[0] ||
            "Chef";
    }


    // ==========================================
    // RECIPES
    // ==========================================

    const {
        data: recipes,
        error
    } = await client
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.log(
            "Dashboard Error:",
            error
        );

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>
            </div>
        `;

        return;
    }


    const totalRecipes =
        document.querySelector(
            "#totalRecipes"
        );


    const recentCount =
        document.querySelector(
            "#recentCount"
        );


    if (totalRecipes) {
        totalRecipes.textContent =
            recipes?.length || 0;
    }


    // ==========================================
    // RECENT = LAST 7 DAYS
    // ==========================================

    const lastWeek =
        new Date();

    lastWeek.setDate(
        lastWeek.getDate() - 7
    );


    const recentRecipes =
        (recipes || []).filter(
            (recipe) =>
                recipe.created_at &&
                new Date(recipe.created_at)
                    >= lastWeek
        );


    if (recentCount) {
        recentCount.textContent =
            recentRecipes.length;
    }


    // ==========================================
    // EMPTY
    // ==========================================

    if (!recipes || recipes.length === 0) {

        container.innerHTML = `
            <div class="col-12">

                <div class="text-center py-5">

                    <h4>No recipes yet</h4>

                    <p class="text-muted">
                        You have not created any recipes yet.
                    </p>

                    <a
                        href="create-recipe.html"
                        class="btn btn-primary"
                    >
                        Add Your First Recipe
                    </a>

                </div>

            </div>
        `;

        return;
    }


    // ==========================================
    // SHOW LATEST 6
    // ==========================================

    container.innerHTML = "";


    recipes
        .slice(0, 6)
        .forEach((recipe) => {

            const imageHTML =
                recipe.image_url
                    ? `
                        <img
                            src="${escapeHtml(recipe.image_url)}"
                            class="card-img-top"
                            style="height:220px; object-fit:cover;"
                            alt="${escapeHtml(recipe.title)}"
                        >
                    `
                    : `
                        <div
                            class="bg-light d-flex align-items-center justify-content-center"
                            style="height:220px;"
                        >
                            <i class="bi bi-image fs-1 text-muted"></i>
                        </div>
                    `;


            container.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="card h-100 shadow-sm">

                        ${imageHTML}

                        <div class="card-body">

                            <span class="badge bg-primary mb-2">
                                ${escapeHtml(recipe.category || "Recipe")}
                            </span>

                            <h5 class="card-title">
                                ${escapeHtml(recipe.title)}
                            </h5>

                            <p class="card-text text-muted">
                                ${
                                    escapeHtml(
                                        recipe.description ||
                                        "No description available."
                                    )
                                }
                            </p>

                            <p class="small text-muted">
                                ${
                                    recipe.created_at
                                        ? new Date(
                                            recipe.created_at
                                          ).toLocaleDateString()
                                        : ""
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

                            </div>

                        </div>

                    </div>

                </div>

            `;
        });
}



// ALL RECIPES / EXPLORE
// ======================================================

async function setupAllRecipes() {

    const container =
        document.querySelector(
            "#allRecipesContainer"
        );

    if (!container) {
        return;
    }


    const {
        data: allRecipes,
        error
    } = await client
        .from("recipes")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.log(
            "All Recipes Error:",
            error
        );

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>
            </div>
        `;

        return;
    }


    const recipes =
        allRecipes || [];


    const searchInput =
        document.querySelector(
            "#searchInput"
        );


    const categoryFilter =
        document.querySelector(
            "#categoryFilter"
        );


    const clearFilters =
        document.querySelector(
            "#clearFilters"
        );


    function displayRecipes(
        filteredRecipes
    ) {

        container.innerHTML = "";


        if (
            !filteredRecipes ||
            filteredRecipes.length === 0
        ) {

            container.innerHTML = `
                <div class="col-12">

                    <div class="text-center py-5">

                        <h4>No recipes found</h4>

                        <p class="text-muted">
                            Try another search or category.
                        </p>

                    </div>

                </div>
            `;

            return;
        }


        filteredRecipes.forEach(
            (recipe) => {

                const imageHTML =
                    recipe.image_url
                        ? `
                            <img
                                src="${escapeHtml(recipe.image_url)}"
                                class="card-img-top"
                                style="height:220px; object-fit:cover;"
                                alt="${escapeHtml(recipe.title)}"
                            >
                        `
                        : `
                            <div
                                class="bg-light d-flex align-items-center justify-content-center"
                                style="height:220px;"
                            >
                                <i class="bi bi-image fs-1 text-muted"></i>
                            </div>
                        `;


                container.innerHTML += `

                    <div class="col-md-6 col-lg-4">

                        <div class="card h-100 shadow-sm">

                            ${imageHTML}

                            <div class="card-body">

                                <span class="badge bg-primary mb-2">
                                    ${escapeHtml(recipe.category || "Recipe")}
                                </span>

                                <h5 class="card-title">
                                    ${escapeHtml(recipe.title)}
                                </h5>

                                <p class="card-text text-muted">
                                    ${
                                        escapeHtml(
                                            recipe.description ||
                                            "No description available."
                                        )
                                    }
                                </p>

                                <p class="small text-muted">
                                    ${
                                        recipe.created_at
                                            ? new Date(
                                                recipe.created_at
                                              ).toLocaleDateString()
                                            : ""
                                    }
                                </p>

                                <a
                                    href="recipe-details.html?id=${recipe.id}"
                                    class="btn btn-primary"
                                >
                                    View Recipe
                                </a>

                            </div>

                        </div>

                    </div>

                `;
            }
        );
    }


    function filterRecipes() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const categoryValue =
            categoryFilter
                ? categoryFilter.value
                : "";


        const filtered =
            recipes.filter(
                (recipe) => {

                    const title =
                        recipe.title
                            ? recipe.title
                                .toLowerCase()
                            : "";


                    const titleMatch =
                        title.includes(
                            searchValue
                        );


                    const categoryMatch =
                        categoryValue === "" ||
                        recipe.category ===
                            categoryValue;


                    return (
                        titleMatch &&
                        categoryMatch
                    );
                }
            );


        displayRecipes(
            filtered
        );
    }


    displayRecipes(recipes);


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterRecipes
        );
    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterRecipes
        );
    }


    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (categoryFilter) {
                    categoryFilter.value = "";
                }

                displayRecipes(
                    recipes
                );
            }
        );
    }
}


// ======================================================
// RECIPE DETAILS
// ======================================================

async function setupRecipeDetails() {

    const container =
        document.querySelector(
            "#recipeDetails"
        );

    if (!container) {
        return;
    }


    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const recipeId =
        urlParams.get("id");


    if (!recipeId) {

        container.innerHTML = `
            <div class="alert alert-danger">
                Recipe ID not found.
            </div>
        `;

        return;
    }


    const {
        data: recipe,
        error
    } = await client
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();


    if (error || !recipe) {

        console.log(
            "Recipe Details Error:",
            error
        );

        container.innerHTML = `
            <div class="alert alert-danger">
                ${
                    escapeHtml(
                        error?.message ||
                        "Recipe not found."
                    )
                }
            </div>
        `;

        return;
    }


    // ==========================================
    // GET AUTHOR
    // ==========================================

    const {
        data: author
    } = await client
        .from("users")
        .select("username")
        .eq("id", recipe.user_id)
        .maybeSingle();


    const imageHTML =
        recipe.image_url
            ? `
                <img
                    src="${escapeHtml(recipe.image_url)}"
                    class="img-fluid rounded-4 shadow-sm w-100"
                    style="max-height:500px; object-fit:cover;"
                    alt="${escapeHtml(recipe.title)}"
                >
            `
            : `
                <div class="bg-light rounded-4 p-5 text-center">
                    <i class="bi bi-image fs-1 text-muted"></i>
                    <p class="mt-2 mb-0">
                        No Image
                    </p>
                </div>
            `;


    container.innerHTML = `

        <div class="row g-4 align-items-start">

            <div class="col-lg-6">

                ${imageHTML}

            </div>


            <div class="col-lg-6">

                <span class="badge bg-primary mb-3">
                    ${escapeHtml(recipe.category || "Recipe")}
                </span>


                <h1 class="fw-bold">
                    ${escapeHtml(recipe.title)}
                </h1>


                <p class="small text-muted">

                    By
                    <strong>
                        ${
                            escapeHtml(
                                author?.username ||
                                "Unknown"
                            )
                        }
                    </strong>

                    &middot;

                    ${
                        recipe.created_at
                            ? new Date(
                                recipe.created_at
                              ).toLocaleDateString()
                            : ""
                    }

                </p>


                <p class="text-muted">

                    ${
                        escapeHtml(
                            recipe.description ||
                            "No description available."
                        )
                    }

                </p>


                <p>

                    <strong>
                        Cooking Time:
                    </strong>

                    ${
                        escapeHtml(
                            recipe.cooking_time ||
                            "Not specified"
                        )
                    }

                </p>


                <hr>


                <h4 class="fw-bold">
                    Ingredients
                </h4>


                <p style="white-space: pre-line;">

                    ${
                        escapeHtml(
                            recipe.ingredients ||
                            "No ingredients available."
                        )
                    }

                </p>


                <h4 class="fw-bold mt-4">
                    Instructions
                </h4>


                <p style="white-space: pre-line;">

                    ${
                        escapeHtml(
                            recipe.instructions ||
                            "No instructions available."
                        )
                    }

                </p>


                <a
                    href="recipes.html"
                    class="btn btn-primary mt-3"
                >
                    Back to Recipes
                </a>

            </div>

        </div>

    `;
}


// ======================================================
// HOME PAGE
// ======================================================

async function setupHome() {

    const container =
        document.querySelector(
            "#homeRecipesContainer"
        );

    if (!container) {
        return;
    }


    const {
        data: recipes,
        error
    } = await client
        .from("recipes")
        .select("*")
        .order("created_at", {
            ascending: false
        })
        .limit(6);


    if (error) {

        console.log(
            "Home Recipes Error:",
            error
        );

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>
            </div>
        `;

        return;
    }


    if (!recipes || recipes.length === 0) {

        container.innerHTML = `
            <div class="col-12">

                <div class="text-center py-5">

                    <h4>No recipes yet</h4>

                    <p class="text-muted">
                        Be the first one to share a recipe.
                    </p>

                </div>

            </div>
        `;

        return;
    }


    container.innerHTML = "";


    recipes.forEach(
        (recipe) => {

            const imageHTML =
                recipe.image_url
                    ? `
                        <img
                            src="${escapeHtml(recipe.image_url)}"
                            class="card-img-top"
                            style="height:220px; object-fit:cover;"
                            alt="${escapeHtml(recipe.title)}"
                        >
                    `
                    : `
                        <div
                            class="bg-light d-flex align-items-center justify-content-center"
                            style="height:220px;"
                        >
                            <i class="bi bi-image fs-1 text-muted"></i>
                        </div>
                    `;


            container.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="card h-100 shadow-sm">

                        ${imageHTML}

                        <div class="card-body">

                            <span class="badge bg-primary mb-2">
                                ${escapeHtml(recipe.category || "Recipe")}
                            </span>

                            <h5 class="card-title">
                                ${escapeHtml(recipe.title)}
                            </h5>

                            <p class="card-text text-muted">
                                ${
                                    escapeHtml(
                                        recipe.description ||
                                        "No description available."
                                    )
                                }
                            </p>

                            <p class="small text-muted">
                                ${
                                    recipe.created_at
                                        ? new Date(
                                            recipe.created_at
                                          ).toLocaleDateString()
                                        : ""
                                }
                            </p>

                            <a
                                href="recipe-details.html?id=${recipe.id}"
                                class="btn btn-primary"
                            >
                                View Recipe
                            </a>

                        </div>

                    </div>

                </div>

            `;
        }
    );
}


// ======================================================
// PASSWORD SHOW / HIDE
// ======================================================

function setupPasswordToggle() {

    const passwordToggle =
        document.querySelector(
            ".pw-toggle"
        );

    if (!passwordToggle) {
        return;
    }


    passwordToggle.addEventListener(
        "click",
        () => {

            const password =
                document.querySelector(
                    "#password"
                );


            if (!password) {
                return;
            }


            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                passwordToggle.innerHTML =
                    '<i class="bi bi-eye-slash"></i>';

            } else {

                password.type =
                    "password";

                passwordToggle.innerHTML =
                    '<i class="bi bi-eye"></i>';
            }

        }
    );
}


// ======================================================
// START APP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "RecipeShare App Started"
        );


        await setupNavbar();

        await setupSignup();

        await setupLogin();

        await setupCreateRecipe();

        await setupMyRecipes();

        await setupEditRecipe();

        await setupDashboard();

        await setupAllRecipes();

        await setupRecipeDetails();

        await setupHome();

        setupPasswordToggle();

    }
);