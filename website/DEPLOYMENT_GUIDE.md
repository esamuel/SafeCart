# SafeCart Website - Namecheap Deployment Guide

## Prerequisites

1. **Namecheap Account**: You need a Namecheap account with hosting
2. **Domain**: safecart.app should be registered and pointed to your hosting
3. **cPanel Access**: You'll need cPanel login credentials from Namecheap

## Step 1: Build the Static Website

From your local machine, navigate to the website folder and build:

```bash
cd /Users/samueleskenasy/safecart/website
npm run build
```

This will create an `out/` folder with all static files ready for deployment.

## Step 2: Access Namecheap cPanel

1. Log in to your Namecheap account at https://www.namecheap.com
2. Go to **Dashboard** → **Hosting List**
3. Click **Manage** next to your hosting account
4. Click **Go to cPanel** or use the cPanel login URL provided

## Step 3: Upload Files via File Manager

### Option A: Using cPanel File Manager (Recommended for First Time)

1. In cPanel, find and open **File Manager**
2. Navigate to `public_html` folder (this is your website root)
3. **Delete any existing files** in `public_html` (if this is a fresh setup)
4. Click **Upload** button at the top
5. Upload ALL files from your local `website/out/` folder
   - You can drag and drop the entire folder contents
   - Or click **Select File** and choose multiple files

**Important Files to Upload:**
- All `.html` files (index.html, features.html, etc.)
- `_next/` folder (contains JavaScript and CSS)
- Any other folders from the `out/` directory

### Option B: Using FTP (For Faster Uploads)

1. **Get FTP Credentials from cPanel:**
   - In cPanel, go to **FTP Accounts**
   - Create a new FTP account or use existing one
   - Note: hostname, username, password, port (usually 21)

2. **Use an FTP Client:**
   - Download FileZilla: https://filezilla-project.org/
   - Connect using your FTP credentials
   - Navigate to `public_html` folder
   - Upload all files from `website/out/` to `public_html`

## Step 4: Configure Domain (if needed)

If safecart.app is not already pointing to this hosting:

1. In Namecheap Dashboard, go to **Domain List**
2. Click **Manage** next to safecart.app
3. Go to **Advanced DNS** tab
4. Add/Update these records:
   - **A Record**: `@` → Your server IP (from cPanel)
   - **CNAME Record**: `www` → `safecart.app`

DNS propagation can take up to 48 hours (usually much faster).

## Step 5: Set Up .htaccess for Clean URLs

Create a `.htaccess` file in the `public_html` folder with this content:

```apache
# Enable mod_rewrite
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slashes (Next.js exports with trailing slashes)
# This is optional - Next.js export already handles this

# Custom error pages (optional)
ErrorDocument 404 /404.html

# Prevent directory browsing
Options -Indexes

# Compress files for faster loading
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 day"
</IfModule>
```

## Step 6: Test the Website

1. Visit https://safecart.app in your browser
2. Test all pages:
   - Home: https://safecart.app/
   - Features: https://safecart.app/features/
   - Pricing: https://safecart.app/pricing/
   - About: https://safecart.app/about/
   - FAQ: https://safecart.app/faq/
   - Contact: https://safecart.app/contact/
   - Privacy: https://safecart.app/privacy/
   - Terms: https://safecart.app/terms/

3. Test language switching (English, Hebrew, Spanish)
4. Test on mobile devices
5. Check that all images and styles load correctly

## Folder Structure After Upload

Your `public_html` should look like this:

```
public_html/
├── index.html
├── features.html
├── pricing.html
├── about.html
├── faq.html
├── contact.html
├── privacy.html
├── terms.html
├── 404.html
├── _next/
│   ├── static/
│   └── ...
├── .htaccess
└── (other static files)
```

## Common Issues & Solutions

### Issue 1: 404 Errors for Pages
**Solution**: Make sure all `.html` files were uploaded and the `.htaccess` file is present.

### Issue 2: Styles Not Loading (Plain HTML)
**Solution**: Ensure the `_next/` folder was uploaded completely with all subdirectories.

### Issue 3: Language Switching Not Working
**Solution**: The language selector uses localStorage and client-side JavaScript. Make sure JavaScript is not blocked and the `_next/static/chunks/` files uploaded correctly.

### Issue 4: SSL Certificate Not Working
**Solution**:
- In cPanel, go to **SSL/TLS Status**
- Enable AutoSSL for your domain
- Wait a few minutes for certificate generation

### Issue 5: www vs non-www
**Solution**: Add this to your `.htaccess`:
```apache
# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.safecart\.app [NC]
RewriteRule ^(.*)$ https://safecart.app/$1 [L,R=301]
```

## Updating the Website

When you make changes:

1. Rebuild locally: `cd website && npm run build`
2. Upload only changed files from `out/` folder
3. Or delete all files in `public_html` and upload fresh

## Performance Optimization

After deployment, consider:

1. **Enable Cloudflare** (free CDN):
   - Sign up at cloudflare.com
   - Add safecart.app
   - Update nameservers at Namecheap

2. **Optimize Images**:
   - Compress images before uploading
   - Use WebP format where possible

3. **Monitor with Google Analytics** (optional):
   - Add tracking code to pages if needed

## Support

- **Namecheap Support**: https://www.namecheap.com/support/
- **cPanel Documentation**: Available within cPanel (Help icon)

---

**Your website is ready for deployment!** 🚀

The static export ensures fast loading times and no server-side requirements.
