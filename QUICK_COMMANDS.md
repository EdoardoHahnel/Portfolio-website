# 📝 Quick Command Reference

## 🚀 **First Time Setup** (Do this ONCE)

### Push Your Code to GitHub

```bash
# Set your GitHub username (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git

# Rename branch to main
git branch -M main

# Upload your code
git push -u origin main
```

---

## 🔄 **Every Time You Make Changes**

### Update Your Live Website

```bash
# 1. Save your changes in code editor

# 2. Add all changes to git
git add .

# 3. Commit with a message describing what you changed
git commit -m "Your message here"

# 4. Push to GitHub (triggers automatic deployment)
git push
```

**Examples of commit messages:**
- `"Added new portfolio companies"`
- `"Fixed bug on AI investors page"`
- `"Updated company logos"`
- `"Improved mobile design"`

---

## 💻 **Running Locally (On Your Computer)**

### Start Your Website Locally

```bash
# Make sure you're in the Website folder
cd C:\Users\hahne\Website

# Run the website
python app.py

# Open browser to: http://localhost:5000
```

### Stop the Server
- Press `Ctrl + C` in the terminal

---

## 🔧 **Useful Git Commands**

### See What Changed
```bash
git status
```

### See Your Commit History
```bash
git log --oneline
```

### Undo Changes (Before Committing)
```bash
# Undo all changes since last commit
git checkout .

# Undo changes to specific file
git checkout filename.py
```

### See What URL Your Code Goes To
```bash
git remote -v
```

---

## 🐛 **If Something Goes Wrong**

### Forgot to Add Git Remote?
```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git
```

### Need to Change Remote URL?
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/new-repo.git
```

### Push Rejected? (Someone else updated)
```bash
# Pull latest changes first
git pull origin main

# Then push
git push
```

---

## 📊 **Database Updates**

### After Adding New Companies to JSON Files

```bash
# 1. Save the JSON file
# 2. Commit and push
git add .
git commit -m "Added new portfolio companies"
git push

# 3. Website updates automatically in 2-3 minutes!
```

---

## 🎯 **Your Typical Workflow**

1. **Make changes** in VS Code (or your editor)
2. **Test locally**: Run `python app.py` and check http://localhost:5000
3. **If looks good, deploy**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Wait 2-3 minutes** - Check your live website!
5. **Done!** ✅

---

## 🆘 **Common Errors & Fixes**

### `fatal: not a git repository`
**Solution**: You're not in the right folder
```bash
cd C:\Users\hahne\Website
```

### `error: failed to push`
**Solution**: Pull first, then push
```bash
git pull origin main
git push
```

### `fatal: remote origin already exists`
**Solution**: Remote already set up, just push
```bash
git push
```

---

## 🔗 **Important Links**

- **Your GitHub**: https://github.com/YOUR_USERNAME
- **Render Dashboard**: https://dashboard.render.com
- **Your Live Website**: https://your-app-name.onrender.com

(Bookmark these!)

---

**Remember**: 
- `git add .` = Prepare changes
- `git commit -m "message"` = Save changes locally
- `git push` = Upload to GitHub & deploy to live website

**That's it! 🎉**

