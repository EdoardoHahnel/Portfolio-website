# 🚀 How to Deploy Your Website - Beginner's Guide

## What You'll Get
Your website will be live at a URL like: `https://portföljbolagen.onrender.com`

Anyone in the world can visit it! 🌍

---

## 📋 **STEP-BY-STEP: Deploy to Render.com (FREE)**

### **Step 1: Upload Code to GitHub**

1. **Go to GitHub**: https://github.com
   - Click "Sign up" (if you don't have account)
   - Or "Sign in" (if you have account)

2. **Create a New Repository**:
   - Click the "+" button (top right)
   - Click "New repository"
   - Name it: `portfolio-website` (or any name you like)
   - Make it **Public**
   - **DON'T** check "Add README" (we already have one)
   - Click "Create repository"

3. **Connect Your Code to GitHub**:
   
   Open your terminal and run these commands:
   
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git
   git branch -M main
   git push -u origin main
   ```
   
   ⚠️ **Replace `YOUR_USERNAME`** with your actual GitHub username!

4. **Refresh GitHub** - You should now see all your files there! ✅

---

### **Step 2: Deploy to Render.com**

1. **Go to Render**: https://render.com

2. **Sign Up / Sign In**:
   - Click "Get Started for Free"
   - **Sign in with GitHub** (easiest option!)
   - Authorize Render to access your GitHub

3. **Create New Web Service**:
   - Click "New +" (top right)
   - Click "Web Service"
   - Find your repository: `portfolio-website`
   - Click "Connect"

4. **Configure Your Service**:
   
   Fill in these settings:
   
   | Field | What to Enter |
   |-------|---------------|
   | **Name** | `portfoljbolagen` (or any name) |
   | **Region** | Choose closest to you (Europe for Sweden) |
   | **Branch** | `main` |
   | **Root Directory** | Leave empty |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app` |
   | **Instance Type** | **Free** ⭐ |

5. **Add Environment Variable** (Important!):
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable"
   - **Key**: `FLASK_ENV`
   - **Value**: `production`
   - Click "Add"

6. **Click "Create Web Service"** 🎉

7. **Wait 3-5 minutes** while Render builds your website...
   - You'll see logs scrolling
   - Wait for "Your service is live" ✅

8. **Visit Your Website!**
   - You'll get a URL like: `https://portfoljbolagen.onrender.com`
   - Click it - YOUR WEBSITE IS LIVE! 🎊

---

## ⚠️ **Important Notes**

### Free Tier Limitations:
- ✅ **Free forever** - no credit card needed
- ⚠️ **Sleeps after 15 min** of inactivity (first visit takes 30 seconds to wake up)
- ⚠️ **750 hours/month** limit (plenty for testing!)
- ✅ **Automatic HTTPS** (secure)

### To Keep It Always Active:
- Upgrade to paid plan ($7/month)
- Or use a service like UptimeRobot to ping your site every 5 minutes

---

## 🔄 **How to Update Your Website**

Whenever you make changes to your code:

1. **Save changes** in your editor

2. **Open terminal** and run:
   ```bash
   git add .
   git commit -m "Updated website"
   git push
   ```

3. **Render automatically updates** your live website! (takes 2-3 minutes)

---

## 🎯 **Alternative Options**

### **Option 2: PythonAnywhere** (Good for Python)
- Free tier: https://www.pythonanywhere.com
- More steps to set up but very reliable
- 512MB limit on free tier

### **Option 3: Railway** (Modern & Fast)
- Very easy: https://railway.app
- $5/month credit free
- After that, pay-as-you-go

### **Option 4: Buy Your Own Domain**
Once your site is live on Render, you can:
1. Buy a domain (e.g., `portföljbolagen.se`) from Namecheap/GoDaddy
2. Point it to your Render URL
3. Now your site is: `www.portföljbolagen.se` 🎉

Cost: ~$10-15/year for `.se` domain

---

## 🆘 **Troubleshooting**

### "Application Error" on Render
- Check the logs in Render dashboard
- Make sure all database JSON files are uploaded
- Check environment variables are set

### Website is slow to load first time
- Normal for free tier! It "wakes up" after sleeping
- Subsequent visits are fast

### Need help?
- Check Render docs: https://render.com/docs
- Or let me know what error you're seeing!

---

## ✅ **Checklist**

- [ ] GitHub account created
- [ ] Code pushed to GitHub  
- [ ] Render account created (sign in with GitHub)
- [ ] Web service created on Render
- [ ] Environment variable `FLASK_ENV=production` added
- [ ] Website deployed successfully
- [ ] Website loads when you visit the URL
- [ ] All pages working (portfolio, AI companies, etc.)

**Congratulations! You're now a website owner! 🎉**


