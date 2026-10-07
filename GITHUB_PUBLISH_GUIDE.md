# Complete Step-by-Step Guide: Publishing on GitHub & GitHub Pages (100% Free)

This guide shows you how to publish the **Bangladesh Bus Route** web app to GitHub and host it live online using **GitHub Pages** so anyone in the world can open it on their phone or computer for free.

---

## 📋 What You Need Before Starting
1. A free GitHub account at [https://github.com](https://github.com).
2. Git installed on your computer ([Download Git](https://git-scm.com/downloads)).
3. Node.js installed ([Download Node.js](https://nodejs.org)).

---

## 🚀 Step 1: Create a New Repository on GitHub

1. Open your browser and go to [https://github.com](https://github.com).
2. Log into your GitHub account.
3. In the top-right corner, click the **`+`** icon and select **New repository** (or go to [https://github.com/new](https://github.com/new)).
4. Fill in the repository details:
   - **Repository name**: `bangladesh-bus-route`
   - **Description**: `Verified Bangladesh Transit System - Bus routes, stops, and emergency navigation`
   - **Visibility**: Choose **Public** (required for free GitHub Pages hosting).
   - **Initialize this repository with**: Leave all boxes UNCHECKED (do **not** check "Add a README", ".gitignore", or "license" because our project already has them).
5. Click the green **Create repository** button.
6. Keep this page open; you will see your repository URL (e.g. `https://github.com/YOUR_USERNAME/bangladesh-bus-route.git`).

---

## 💻 Step 2: Initialize and Push Code from Your Computer

Open your terminal or command prompt inside the project folder:

### 1. Initialize Git (if not already done):
```bash
git init
```

### 2. Add all project files:
```bash
git add .
```

### 3. Commit the files:
```bash
git commit -m "Initial release of Bangladesh Bus Route web app"
```

### 4. Set the default branch to `main`:
```bash
git branch -M main
```

### 5. Link your local project to your GitHub repository:
*(Replace `YOUR_USERNAME` with your real GitHub username)*:
```bash
git remote add origin https://github.com/YOUR_USERNAME/bangladesh-bus-route.git
```
*(If you already had a remote, run `git remote set-url origin https://github.com/YOUR_USERNAME/bangladesh-bus-route.git`)*

### 6. Push your code to GitHub:
```bash
git push -u origin main
```
*If prompted, enter your GitHub username and Personal Access Token (or sign in via browser).*

---

## 🌐 Step 3: Enable Free GitHub Pages Hosting (1 Click)

Now that your code is on GitHub, turn on the website hosting:

1. On your GitHub repository page (`https://github.com/YOUR_USERNAME/bangladesh-bus-route`), click the **Settings** tab (the gear icon near the top right).
2. In the left-hand sidebar under "Code and automation", click **Pages**.
3. Under **Build and deployment**:
   - For **Source**, click the dropdown and select:
     **`GitHub Actions`**
4. That's it! Because this project already includes the automated workflow file (`.github/workflows/deploy.yml`), GitHub will immediately start building and publishing your site.

---

## ⏳ Step 4: Access Your Live Web App

1. Click on the **Actions** tab at the top of your GitHub repository.
2. You will see a workflow named **Deploy to GitHub Pages** running (with a spinning yellow circle).
3. Wait about 1 minute until it turns into a green checkmark **`✓`**.
4. Click on the completed workflow run. You will see your live public URL:
   ```
   https://YOUR_USERNAME.github.io/bangladesh-bus-route/
   ```
5. Click the link! Anyone in the world can now open this URL from any phone, tablet, or PC.

---

## 🔄 How to Push Future Updates

Whenever you make any changes or add new routes:

```bash
git add .
git commit -m "Updated routes and stops"
git push origin main
```
GitHub will automatically re-build and re-deploy your website in 1 minute.

---

## 🌟 Optional: Also Connect to Netlify (Free Custom Domains)
You can also connect your same GitHub repository to [Netlify.com](https://netlify.com) for a short custom URL:
1. Go to [Netlify.com](https://netlify.com) and click **"Add new site" → "Import from GitHub"**.
2. Select `bangladesh-bus-route`.
3. Click **Deploy Site**.
4. You get an instant URL like `https://bangladesh-bus-route.netlify.app` with zero setup.
