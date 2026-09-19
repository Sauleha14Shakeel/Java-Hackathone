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
 
        }); 
 
 
        const deleteButtons = 
            document.querySelectorAll(".delete-recipe"); 
 
 
        deleteButtons.forEach((button) => { 
 
            button.addEventListener("click", async () => { 
 
                const recipeId = 
                    button.getAttribute("data-id"); 
 
 
                const confirmDelete = 
                    confirm( 
                        "Are you sure you want to delete this recipe?" 
                    ); 
 
 
                if (!confirmDelete) { 
                    return; 
                } 
 
 
                const { error } = 
                    await client 
                        .from("recipes") 
                        .delete() 
                        .eq("id", recipeId) 
                        .eq("user_id", user.id); 
 
 
                console.log( 
                    "Delete Error:", 
                    error 
                ); 
 
 
                if (error) { 
 
                    alert(error.message); 
 
                    return; 
 
                } 
 
 
                alert("Recipe deleted successfully!"); 
 
 
                location.reload(); 
 
            }); 
 
        }); 
 
    } 
 
 
 
 
    const allRecipesContainer = 
        document.querySelector("#allRecipesContainer"); 
 
 
    if (allRecipesContainer) { 
 
        console.log("All Recipes page"); 
 
 
        let allRecipes = []; 
 
 
        const { data, error } = 
            await client 
                .from("recipes") 
                .select("*") 
                .order("created_at", { 
                    ascending: false 
                }); 
 
 
        console.log("All Recipes:", data); 
 
        console.log("All Recipes Error:", error); 
 
 
        if (error) { 
 
            allRecipesContainer.innerHTML = ` 
                <div class="col-12"> 
                    <div class="alert alert-danger"> 
                        ${error.message} 
                    </div> 
                </div> 
            `; 
 
            return; 
 
        } 
 
 
        allRecipes = data || []; 
 
 
        function displayRecipes(recipes) { 
 
            allRecipesContainer.innerHTML = ""; 
 
 
            if (recipes.length === 0) { 
 
                allRecipesContainer.innerHTML = ` 
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
 
 
            recipes.forEach((recipe) => { 
 
                allRecipesContainer.innerHTML += ` 
 
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
 
            }); 
 
        } 
 
 
        displayRecipes(allRecipes); 
 
 
        const searchInput = 
            document.querySelector("#searchInput"); 
 
        const categoryFilter = 
            document.querySelector("#categoryFilter"); 
 
        const clearFilters = 
            document.querySelector("#clearFilters"); 
 
 
        function filterRecipes() { 
 
            const searchValue = 
                searchInput 
                ? 
                searchInput.value 
                    .toLowerCase() 
                    .trim() 
                : 
                ""; 
 
 
            const categoryValue = 
                categoryFilter 
                ? 
                categoryFilter.value 
                : 
                ""; 
 
 
            const filtered = 
                allRecipes.filter((recipe) => { 
 
                    const title = 
                        recipe.title 
                        ? 
                        recipe.title.toLowerCase() 
                        : 
                        ""; 
 
 
                    const titleMatch = 
                        title.includes(searchValue); 
 
 
                    const categoryMatch = 
                        categoryValue === "" 
                        || 
                        recipe.category === categoryValue; 
 
 
                    return titleMatch && categoryMatch; 
 
                }); 
 
 
            displayRecipes(filtered); 
 
        } 
 
 
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
 
                    displayRecipes(allRecipes); 
 
                } 
            ); 
 
        } 
 
    } 
 
 
   
 
    const recipeDetails = 
        document.querySelector("#recipeDetails"); 
 
 
    if (recipeDetails) { 
 
        console.log("Recipe Details page"); 
 
 
        const urlParams = 
            new URLSearchParams( 
                window.location.search 
            ); 
 
 
        const recipeId = 
            urlParams.get("id"); 
 
 
        if (!recipeId) { 
 
            recipeDetails.innerHTML = ` 
                <div class="alert alert-danger"> 
                    Recipe ID not found. 
                </div> 
            `; 
 
            return; 
 
        } 
 
 
        const { data: recipe, error } = 
            await client 
                .from("recipes") 
                .select("*") 
                .eq("id", recipeId) 
                .single(); 
 
 
        console.log("Recipe:", recipe); 
 
        console.log("Recipe Error:", error); 
 
 
        if (error) { 
 
            recipeDetails.innerHTML = ` 
                <div class="alert alert-danger"> 
                    ${error.message} 
                </div> 
            `; 
 
            return; 
 
        } 
 
 
        recipeDetails.innerHTML = ` 
 
            <div class="row g-4 align-items-start"> 
 
                <div class="col-lg-6"> 
 
                    ${ 
                        recipe.image_url 
                        ? 
                        ` 
                        <img 
                            src="${recipe.image_url}" 
                            class="img-fluid rounded-4 shadow-sm w-100" 
                            style="max-height:500px; object-fit:cover;" 
                        > 
                        ` 
                        : 
                        ` 
                        <div class="bg-light rounded-4 p-5 text-center"> 
                            No Image 
                        </div> 
                        ` 
                    } 
 
                </div> 
 
 
                <div class="col-lg-6"> 
 
                    <span class="badge bg-primary mb-3"> 
                        ${recipe.category || "Recipe"} 
                    </span> 
 
 
                    <h1 class="fw-bold"> 
                        ${recipe.title} 
                    </h1> 
 
 
                    <p class="text-muted"> 
                        ${ 
                            recipe.description 
                            || "No description available." 
                        } 
                    </p> 
 
 
                    <p> 
                        <strong>Cooking Time:</strong> 
                        ${ 
                            recipe.cooking_time 
                            || "Not specified" 
                        } 
                    </p> 
 
 
                    <hr> 
 
 
                    <h4 class="fw-bold"> 
                        Ingredients 
                    </h4> 
 
 
                    <p style="white-space: pre-line;"> 
                        ${ 
                            recipe.ingredients 
                            || "No ingredients available." 
                        } 
                    </p> 
 
 
                    <h4 class="fw-bold mt-4"> 
                        Instructions 
                    </h4> 
 
 
                    <p style="white-space: pre-line;"> 
                        ${ 
                            recipe.instructions 
                            || "No instructions available." 
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
 
    const editRecipeForm = 
        document.querySelector("#editRecipeForm"); 
 
 
    if (editRecipeForm) { 
 
        console.log("Edit Recipe page"); 
 
 
        if (!user) { 
 
            window.location.href = "login.html"; 
 
            return; 
 
        } 
 
 
        const urlParams = 
            new URLSearchParams( 
                window.location.search 
            ); 
 
 
        const recipeId = 
            urlParams.get("id"); 
 
 
        if (!recipeId) { 
 
            alert("Recipe ID not found"); 
 
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
 
 
        const { data: recipe, error } = 
            await client 
                .from("recipes") 
                .select("*") 
                .eq("id", recipeId) 
                .eq("user_id", user.id) 
                .single(); 
 
 
        console.log("Edit Recipe Data:", recipe); 
 
        console.log("Edit Recipe Error:", error); 
 
 
        if (error) { 
 
            alert( 
                "You cannot edit this recipe." 
            ); 
 
            window.location.href = 
                "my-recipes.html"; 
 
            return; 
 
        } 
 
 
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
 
 
        editRecipeForm.addEventListener( 
            "submit", 
            async (event) => { 
 
                event.preventDefault(); 
 
 
                console.log( 
                    "Updating recipe..." 
                ); 
 
 
                let imageUrl = 
                    recipe.image_url; 
 
 
                if ( 
                    image && 
                    image.files && 
                    image.files.length > 0 
                ) { 
 
                    const uploadedFile = 
                        image.files[0]; 
 
 
                    const fileName = 
                        Date.now() 
                        + "-" 
                        + uploadedFile.name; 
 
 
                    const { data: uploadData, 
                            error: uploadError } = 
                        await client 
                            .storage 
                            .from("post") 
                            .upload( 
                                fileName, 
                                uploadedFile, 
                                { 
                                    cacheControl: "3600", 
                                    contentType: 
                                        uploadedFile.type, 
                                    upsert: true 
                                } 
                            ); 
 
 
                    console.log( 
                        "Upload Data:", 
                        uploadData 
                    ); 
 
 
                    console.log( 
                        "Upload Error:", 
                        uploadError 
                    ); 
 
 
                    if (uploadError) { 
 
                        alert( 
                            uploadError.message 
                        ); 
 
                        return; 
 
                    } 
 
 
                    const { data: urlData } = 
                        client 
                            .storage 
                            .from("post") 
                            .getPublicUrl( 
                                fileName 
                            ); 
 
 
                    imageUrl = 
                        urlData.publicUrl; 
 
                } 
 
 
                const { error: updateError } = 
                    await client 
                        .from("recipes") 
                        .update({ 
 
                            title: 
                                title.value, 
 
                            category: 
                                category.value, 
 
                            description: 
                                description.value, 
 
                            cooking_time: 
                                cookingTime.value, 
 
                            ingredients: 
                                ingredients.value, 
 
                            instructions: 
                                instructions.value, 
 
                            image_url: 
                                imageUrl 
 
                        }) 
                        .eq("id", recipeId) 
                        .eq("user_id", user.id); 
 
 
                console.log( 
                    "Update Error:", 
                    updateError 
                ); 
 
 
                if (updateError) { 
 
                    alert( 
                        updateError.message 
                    ); 
 
                    return; 
 
                } 
 
 
                alert( 
                    "Recipe updated successfully!" 
                ); 
 
 
                window.location.href = 
                    "my-recipes.html"; 
 
            } 
        ); 
 
    } 
 
 
    const recipeForm = 
        document.querySelector("#recipeForm"); 
 
 
    if (recipeForm) { 
 
        console.log("Create Recipe page"); 
 
 
        if (!user) { 
 
            window.location.href = "login.html"; 
 
            return; 
 
        } 
 
 
        recipeForm.addEventListener( 
            "submit", 
            async (event) => { 
 
                try { 
 
                    event.preventDefault(); 
 
 
                    const title = 
                        document.querySelector("#title"); 
 
                    const category = 
                        document.querySelector("#category"); 
 
                    const description = 
                        document.querySelector("#description"); 
 
                    const cookingTime = 
                        document.querySelector( 
                            "#cooking_time" 
                        ); 
 
                    const ingredients = 
                        document.querySelector( 
                            "#ingredients" 
                        ); 
 
                    const instructions = 
                        document.querySelector( 
                            "#instructions" 
                        ); 
 
                    const image = 
                        document.querySelector("#image"); 
 
 
                    if (title.value.trim() === "") { 
 
                        alert("Please enter recipe title"); 
 
                        return; 
 
                    } 
 
 
                    if (ingredients.value.trim() === "") { 
 
                        alert("Please enter ingredients"); 
 
                        return; 
 
                    } 
 
 
                    if (instructions.value.trim() === "") { 
 
                        alert("Please enter instructions"); 
 
                        return; 
 
                    } 
 
 
                    let imageUrl = ""; 
 
 
                    if ( 
                        image && 
                        image.files && 
                        image.files.length > 0 
                    ) { 
 
                        const uploadedFile = 
                            image.files[0]; 
 
 
                        const fileName = 
                            Date.now() 
                            + "-" 
                            + uploadedFile.name; 
 
 
                        const { data: uploadData, 
                                error: uploadError } = 
                            await client 
                                .storage 
                                .from("post") 
                                .upload( 
                                    fileName, 
                                    uploadedFile, 
                                    { 
                                        cacheControl: "3600", 
                                        contentType: 
                                            uploadedFile.type, 
                                        upsert: true 
                                    } 
                                ); 
 
 
                        console.log( 
                            "Upload Data:", 
                            uploadData 
                        ); 
 
 
                        console.log( 
                            "Upload Error:", 
                            uploadError 
                        ); 
 
 
                        if (uploadError) { 
 
                            alert( 
                                uploadError.message 
                            ); 
 
                            return; 
 
                        } 
 
 
                        const { data: urlData } = 
                            client 
                                .storage 
                                .from("post") 
                                .getPublicUrl( 
                                    fileName 
                                ); 
 
 
                        imageUrl = 
                            urlData.publicUrl; 
 
                    } 
 
 
                    const { data, error } = 
                        await client 
                            .from("recipes") 
                            .insert({ 
 
                                user_id: 
                                    user.id, 
 
                                title: 
                                    title.value, 
 
                                category: 
                                    category.value, 
 
                                description: 
                                    description.value, 
 
                                cooking_time: 
                                    cookingTime.value, 
 
                                ingredients: 
                                    ingredients.value, 
 
                                instructions: 
                                    instructions.value, 
 
                                image_url: 
                                    imageUrl 
 
                            }) 
                            .select(); 
 
 
                    console.log( 
                        "Recipe Data:", 
                        data 
                    ); 
 
 
                    console.log( 
                        "Recipe Error:", 
                        error 
                    ); 
 
 
                    if (error) { 
 
                        alert(error.message); 
 
                        return; 
 
                    } 
 
 
                    alert( 
                        "Recipe created successfully!" 
                    ); 
 
 
                    window.location.href = 
                        "my-recipes.html"; 
 
                } 
 
                catch (error) { 
 
                    console.log(error); 
 
                    alert(error.message); 
 
                } 
 
            } 
        ); 
 
    } 
 
 
 
   
 
    const passwordToggle = 
        document.querySelector(".pw-toggle"); 
 
 
    if (passwordToggle) { 
 
        passwordToggle.addEventListener( 
            "click", 
            () => { 
 
                const password = 
                    document.querySelector("#password"); 
 
 
                if (!password) { 
                    return; 
                } 
 
 
                if ( 
                    password.type === "password" 
                ) { 
 
                    password.type = "text"; 
 
                    passwordToggle.innerHTML = 
                        '<i class="bi bi-eye-slash"></i>'; 
 
                } 
 
                else { 
 
                    password.type = "password"; 
 
                    passwordToggle.innerHTML = 
                        '<i class="bi bi-eye"></i>'; 
 
                } 
 
            } 
        ); 
 
    } 
 
 
});