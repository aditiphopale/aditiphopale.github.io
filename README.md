# aditiphopale.com — setup guide

A minimal, dark, single-accent-color site with separate Home / Projects / Blog
pages, an ambient particle-network animation in the background, a **Projects**
feed (auto-pulled live from your GitHub repos — no manual updates needed), and
a **Blog** (add a Markdown file, push, done). No build step, no framework, no
cost.

## 1. Create the GitHub repo

Go to github.com/new and create a repo named exactly:

```
aditiphopale.github.io
```

This exact name matters — repos named `<username>.github.io` are automatically
served at the root of a GitHub Pages site (as opposed to `username.github.io/repo-name`).

## 2. Push these files

From this folder:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/aditiphopale/aditiphopale.github.io.git
git push -u origin main
```

(No git installed, or don't want to use the command line? You can also drag
and drop all these files into the new repo using GitHub's web uploader —
click "Add file" → "Upload files" on the repo page.)

## 3. Turn on GitHub Pages

In the repo: **Settings → Pages**.
- Source: Deploy from branch
- Branch: `main`, folder `/ (root)`
- Save

GitHub will build the site at `https://aditiphopale.github.io`. Give it a
minute or two the first time.

## 4. Connect your custom domain

Still in **Settings → Pages**, under "Custom domain," enter:

```
aditiphopale.com
```

and save. (This repo already includes a `CNAME` file with that domain, so
GitHub should pick it up automatically — but setting it in the UI too makes
sure it sticks.)

## 5. Point the domain at GitHub (in Squarespace)

In your Squarespace domain's DNS settings (Domains → aditiphopale.com → DNS
Settings), add:

**A records** — host `@`, pointing to each of these four IPs (add all four as
separate A records):

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME record** (optional, for `www.aditiphopale.com` too):

```
Host: www
Type: CNAME
Value: aditiphopale.github.io.
```

Remove any existing A records or "parking page" records Squarespace put there
by default first — they'll conflict.

DNS changes can take anywhere from a few minutes to ~24 hours to propagate.
Once it's live, go back to **Settings → Pages** on GitHub and check "Enforce
HTTPS" for a free SSL certificate.

## Adding a new blog post

1. Add a new file: `posts/your-slug.md` (plain Markdown — headings, bold,
   links, lists all work).
2. Add an entry to `posts/index.json`:

```json
{
  "slug": "your-slug",
  "title": "Your Post Title",
  "date": "2026-08-20",
  "excerpt": "One or two sentences shown in the post list."
}
```

3. Commit and push. That's it — no rebuild, no dashboard.

## How the Projects page works

`projects.html` calls the public GitHub API
(`api.github.com/users/aditiphopale/repos`) directly from the visitor's
browser and renders each repo as a card. Push a new repo to GitHub and it
shows up on the site automatically, no edits needed. Until you have any public
repos, it shows a "No projects live yet" empty state. Forked repos are hidden
by default — change `HIDE_FORKS` near the top of the `<script>` in
`projects.html` if you want them shown.

## The background animation

`js/particles.js` draws a subtle canvas particle network (faint dots, thin
connecting lines, one accent color used sparingly) fixed behind every page.
It's lightweight, pauses for people with "reduce motion" turned on in their
OS/browser settings, and needs no extra libraries.

## File structure

```
index.html          Home page: hero, About ("The Side Quests"), Contact
projects.html        Live GitHub project grid
blog.html            Blog post list
post.html            Single post view (reads ?slug=... from the URL)
css/style.css        All styling (dark theme, single accent color)
js/particles.js      Ambient background particle-network animation
posts/index.json     Blog post metadata (title, date, excerpt)
posts/*.md           Blog post content
CNAME                Tells GitHub Pages which custom domain to serve
.nojekyll             Disables GitHub's default Jekyll processing
```
