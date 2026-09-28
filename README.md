# Little Tasks

A simple personal task tracker built with AI assistance for Engineering Design 2. Users can create an account, log in, add tasks, view them, edit titles/details, mark tasks complete, delete them, and log out. Supabase Auth and a PostgreSQL `tasks` table store each user's data separately with row level security.

**Live application:** spectacular-florentine-cd1714.netlify.app

**3–5 minute demo video:** https://youtu.be/_Xxm0_Tv0dY

## Technologies

- HTML, CSS, JavaScript
- Supabase Authentication and PostgreSQL
- Netlify for static hosting
- Git and GitHub for version control

## Setup

1. Create a free Supabase project. In **SQL Editor**, run [`database.sql`](database.sql) once. The script creates the table and access policies.
2. In **Project Settings → API**, copy the project URL and **publishable/anon key**. Copy `config.example.js` to `config.js` and paste those two values. Never use a `service_role` or secret key in browser code.
3. Open `index.html` with VS Code Live Server, or from this folder run `python3 -m http.server 8000` and visit `http://localhost:8000`.
4. In Supabase **Authentication → Providers → Email**, either keep email confirmation on and confirm your registration email, or disable it for a simpler class demo. Use a test account and test data; do not enter real medical information.
5. Try sign up, login, add, edit, mark complete, delete, and logout. Refresh to verify the tasks come back from Supabase.

## Deploy on Netlify

This is a static site with no build step. In Netlify, choose **Add new site → Deploy manually**, and upload the folder containing `index.html`, `style.css`, `app.js`, and your completed `config.js`. **Do not upload `database.sql` with sensitive data** (the supplied schema itself has none). For a Git connected deploy, `config.js` is ignored by Git, so you must arrange a build time configuration before using that option. The manual folder upload is simplest for this assignment. Once deployed, test authentication and CRUD on the Netlify URL, then add that URL above and commit this README change.

## Project structure

- `index.html`: login form and task interface
- `style.css`: responsive layout
- `app.js`: auth, database calls, and interface behavior
- `config.example.js`: public Supabase configuration template
- `database.sql`: table and per-user access policies

## Demo outline (3–5 minutes)

Show the deployed Netlify URL, sign up and log in, create a task, refresh to show database persistence, edit it, complete it, delete it, and log out. Briefly show `app.js`, `database.sql`, and the README in your GitHub repository. Set the YouTube video to **Unlisted**, then add its URL above. Submit the public GitHub repository URL on Canvas.
