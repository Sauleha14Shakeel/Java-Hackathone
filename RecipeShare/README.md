# RecipeShare

Responsive Recipe Sharing Platform using HTML, CSS, Bootstrap 5 and Supabase.

## Files
- index.html
- login.html
- signup.html
- dashboard.html
- recipes.html
- recipe-details.html
- create-recipe.html
- edit-recipe.html
- my-recipes.html
- style.css
- app.js

## Important
The project uses the Supabase project URL and publishable key from the provided JavaScript.

The frontend expects these tables/columns to already exist:
### users
- id (same UUID as auth.users)
- username

### recipes
- id
- user_id
- title
- description
- category
- ingredients
- instructions
- cooking_time
- image_url
- created_at

Create the `recipe-images` Storage bucket in Supabase and make it public if you want to use `getPublicUrl()`.

## No SQL
No SQL file is included. You can create tables, relationships, RLS policies and the storage bucket from the Supabase Dashboard UI.

## RLS
For the required security, enable RLS on `recipes` and create policies in Supabase Dashboard:
- SELECT: authenticated users can view recipes
- INSERT: authenticated users can insert rows where user_id equals their auth user id
- UPDATE: users can update rows they own
- DELETE: users can delete rows they own

Do not rely only on JavaScript checks; RLS is the actual database protection.

## Your original JS fixes
The supplied code used both `client` and `supabaseClient`. This version consistently uses `supabaseClient`.
It also avoids running recipe-detail queries before checking the current user and separates page-specific logic.


## Page behavior
- `index.html`: displays the latest recipes uploaded by **all users**.
- `dashboard.html`: displays only recipes uploaded by the **currently logged-in user**.
- `my-recipes.html`: displays only the logged-in user's recipes and provides Edit/Delete.
- `recipes.html`: displays all users' recipes with title search and category filtering.
