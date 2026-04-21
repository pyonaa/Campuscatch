# CampusCatch Deployment Guide

## Overview
This guide explains how to deploy your CampusCatch React + TypeScript application to the web.

## Important: Supabase Google OAuth Setup

**CRITICAL:** Before deploying, you MUST configure Google OAuth in Supabase or users will see a "provider is not enabled" error.

### Setting up Google OAuth in Supabase:

1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard
2. Navigate to: **Authentication** → **Providers** → **Google**
3. Follow the complete setup instructions at: https://supabase.com/docs/guides/auth/social-login/auth-google
4. You'll need to:
   - Create a Google Cloud Console project
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - Add your Supabase callback URL to authorized redirect URIs
   - Copy the Client ID and Client Secret into Supabase

**Without completing this setup, Google login will not work.**

---

## Deployment Options

Since your app is built with React and TypeScript (not plain HTML), you need to **build** it first before deploying. Here are your options:

### Option 1: Vercel (Recommended - Easiest)

**Vercel** is perfect for React apps and offers free hosting with automatic builds.

#### Steps:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/campuscatch.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Vite configuration
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

#### Why Vercel?
- ✅ Automatic builds from GitHub
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Free for personal projects

---

### Option 2: Netlify

Similar to Vercel, great for React apps.

#### Steps:

1. **Push code to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy"

---

### Option 3: GitHub Pages (Advanced)

GitHub Pages can host static sites, but requires manual build setup.

#### Steps:

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`:**
   ```json
   {
     "homepage": "https://yourusername.github.io/campuscatch",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages:**
   - Go to your repo settings → Pages
   - Source: Deploy from branch `gh-pages`

**Note:** GitHub Pages has limitations and requires the `base` URL to be set in `vite.config.ts`.

---

### Option 4: Build and Host Anywhere

You can build the app locally and host the files on any web server.

#### Steps:

1. **Build the app:**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with production-ready HTML, CSS, and JavaScript files.

2. **Upload the `dist/` folder contents to your web host:**
   - Upload to your hosting provider (e.g., Hostinger, Bluehost, AWS S3, etc.)
   - Make sure to configure the server to serve `index.html` for all routes (for React Router to work)

---

## Why GitHub Can't Open Your App Directly

GitHub repositories show **source code**, not running applications. Your app uses:
- **React** - needs to be compiled to browser-compatible JavaScript
- **TypeScript** - needs to be transpiled to JavaScript
- **Vite** - a build tool that bundles everything together
- **React Router** - requires server configuration

When you run `npm run build`, Vite compiles everything into static files that browsers can understand. Those files go in the `dist/` folder.

GitHub Pages, Vercel, and Netlify take care of this build process automatically.

---

## Environment Variables for Production

When deploying, your Supabase configuration is already set up in `/utils/supabase/info.tsx`.

The server-side code runs on Supabase Edge Functions, so you don't need to configure environment variables for deployment.

---

## Post-Deployment Checklist

After deploying:

1. ✅ **Test Google OAuth** - Make sure you completed the Supabase Google setup
2. ✅ **Test item posting** - Upload images and create an item
3. ✅ **Test search** - Try the fuzzy search functionality
4. ✅ **Test authentication** - Sign up, login, logout
5. ✅ **Check mobile responsiveness** - Open on your phone

---

## Recommended: Vercel Deployment

For the best experience, I recommend **Vercel**:

1. Push to GitHub
2. Import to Vercel
3. Deploy

Your app will be live in under 2 minutes! 🚀

---

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Netlify Documentation: https://docs.netlify.com
- Vite Deployment Guide: https://vitejs.dev/guide/static-deploy.html
- Supabase Google OAuth Setup: https://supabase.com/docs/guides/auth/social-login/auth-google

---

## Summary

✅ **Supabase backend** - Already configured and running
✅ **Google OAuth** - Set up in Supabase dashboard (REQUIRED)
✅ **Database** - Using Supabase key-value store
✅ **Image storage** - Using Supabase Storage
✅ **Authentication** - Integrated with Supabase Auth
✅ **Real-time data** - Fetched from API routes

**Your app is production-ready!** Just deploy it using one of the methods above. 🎉
