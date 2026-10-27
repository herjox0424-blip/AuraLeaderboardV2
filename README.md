# AuraLeaderboard V2 — frontend starter

This folder contains the first static front-end for GitHub Pages.

## Files
- `index.html` — page structure
- `style.css` — responsive dark UI
- `app.js` — search, ranking, and **preview-only** sample data

## Important security note
The current page uses sample data only. It does not include authentication or write access yet.
Do not add admin passwords, Supabase service-role keys, or secrets to HTML/JavaScript.
A secure version will use Supabase Auth plus database Row Level Security policies before any admin edits are enabled.

## Preview locally
Open `index.html` in your browser, or use VS Code's Live Server extension.

## Publish on GitHub Pages
1. Create/open your GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the Pages URL to appear.

Do not connect live database writes until authentication and RLS policies have been created and tested.
