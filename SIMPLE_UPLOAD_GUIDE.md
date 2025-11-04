# 📤 SIMPLE UPLOAD GUIDE - Follow These Steps

**File to Upload:** `frontend-deploy-fixed.zip` (417K)  
**Your Website:** https://safecart.app

---

## ✅ STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Login to cPanel** 🔐
1. Browser should open automatically to: **https://safecart.app:2083**
2. Enter your **username** and **password**
3. Click **"Log in"**

---

### **STEP 2: Open File Manager** 📁
1. In cPanel, scroll down to **"FILES"** section
2. Click **"File Manager"**
3. A new tab will open

---

### **STEP 3: Go to public_html Folder** 📂
1. In File Manager, click **"public_html"** folder (left sidebar)
2. You'll see files like:
   - `_next/` (folder)
   - `locales/` (folder)
   - `index.html`
   - `.htaccess` (if you can't see it, enable "Show Hidden Files")

---

### **STEP 4: BACKUP (Optional but Recommended)** 💾
1. **Select ALL files** in public_html (checkbox at top)
2. Click **"Compress"** button (top toolbar)
3. Choose **"Zip Archive"**
4. Name it: `backup-before-fix.zip`
5. Click **"Compress File(s)"**
6. Click **"Close"** when done

---

### **STEP 5: Delete OLD Frontend Files** 🗑️
**Select and DELETE these:**
- ✅ `_next/` folder
- ✅ `locales/` folder  
- ✅ `index.html`
- ✅ `404.html`
- ✅ `manifest.json`
- ✅ `icon.svg`
- ✅ `og-image.svg`
- ✅ `index.txt`
- ✅ `test.html`
- ✅ Any `404/` folder

**⚠️ DO NOT DELETE:**
- ❌ `.htaccess` (KEEP THIS!)
- ❌ Any `.env` files
- ❌ Any `cgi-bin` folders
- ❌ Backend files (if any)

**How to delete:**
1. Select files/folders by clicking checkboxes
2. Click **"Delete"** button (top toolbar)
3. Confirm deletion

---

### **STEP 6: Upload New Frontend** ⬆️
1. Click **"Upload"** button (top toolbar)
2. A new tab opens with upload interface
3. **Drag and drop** `frontend-deploy-fixed.zip` from Finder
   - OR click **"Select File"** and choose it
4. Wait for upload to complete (should be fast - 417K)
5. You'll see: **"frontend-deploy-fixed.zip - 100%"**
6. **Close the upload tab**

---

### **STEP 7: Extract the Zip File** 📦
1. Back in File Manager, you should see **"frontend-deploy-fixed.zip"**
2. **Right-click** on the zip file
3. Select **"Extract"**
4. **Extract to:** `/public_html` (should be pre-filled)
5. Click **"Extract File(s)"**
6. Wait for extraction to complete
7. Click **"Close"**

---

### **STEP 8: Delete the Zip File** 🧹
1. Select **"frontend-deploy-fixed.zip"**
2. Click **"Delete"** button
3. Confirm deletion

---

### **STEP 9: Verify .htaccess is Still There** ✅
1. Click **Settings** icon (gear) in top-right of File Manager
2. Check **"Show Hidden Files (dotfiles)"**
3. Click **"Save"**
4. Look for **".htaccess"** file in public_html
5. If it's there ✅ - You're good!
6. If missing ❌ - Let me know!

---

### **STEP 10: Test on Your Phone!** 📱
1. Open browser on your phone
2. Go to: **https://safecart.app**
3. **Clear cache first:**
   - **iPhone Safari:** Settings → Safari → Clear History and Website Data
   - **Android Chrome:** Settings → Privacy → Clear Browsing Data
4. Reload the page
5. Login and check if it still asks for profile data

---

## 🎯 EXPECTED RESULT

After upload:
- ✅ App loads faster
- ✅ NO automatic profile data request on start
- ✅ You go directly to Dashboard after login

---

## 🆘 TROUBLESHOOTING

**Problem:** "I don't see .htaccess"
- **Solution:** Enable "Show Hidden Files" in Settings (gear icon)

**Problem:** "Upload failed"
- **Solution:** Try a smaller browser window or use "Select File" instead of drag-and-drop

**Problem:** "Still asks for profile data"
- **Solution:** Clear your phone's browser cache completely and reload

**Problem:** "Page shows 404 error"
- **Solution:** Check that .htaccess file is present and wasn't deleted

---

## 📞 NEED HELP?

Tell me:
1. Which step you're on
2. What you see on screen
3. Any error messages

I'll help you immediately! 🚀

