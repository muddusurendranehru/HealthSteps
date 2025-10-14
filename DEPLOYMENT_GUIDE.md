# 🚀 HEALTHSTEPS DEPLOYMENT GUIDE

**Compatible Platforms:** Railway, Render, Vercel (with config), Replit  
**NOT Compatible:** Netlify (static hosting only)

---

## 🎯 RECOMMENDED: RAILWAY DEPLOYMENT

Railway is **the best choice** for HealthSteps because:
- ✅ Full Node.js support
- ✅ PostgreSQL integration
- ✅ Automatic deployments
- ✅ Free tier: 500 hours/month
- ✅ Easy environment variables
- ✅ Custom domains

### Step-by-Step: Deploy to Railway

#### 1. Prepare Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Fixed backend, removed hardcoded credentials"
git push origin main
```

#### 2. Sign Up for Railway
- Go to: https://railway.app
- Click "Login with GitHub"
- Authorize Railway

#### 3. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your HealthSteps repository

#### 4. Add Environment Variables
Click on your service → Variables → Add all:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

SESSION_SECRET=healthsteps-production-secret-2025-change-this

NODE_ENV=production

PORT=5000

CORS_ORIGIN=*
```

#### 5. Configure Build
Railway auto-detects Node.js. Verify:
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### 6. Deploy
- Railway deploys automatically
- Get your URL: `https://yourapp.up.railway.app`

#### 7. Test Deployment
```bash
# Test health check
curl https://yourapp.up.railway.app

# Test API
curl https://yourapp.up.railway.app/api/auth/status
```

---

## 🔧 ALTERNATIVE: RENDER DEPLOYMENT

Render offers a generous free tier (750 hours/month).

### Step-by-Step: Deploy to Render

#### 1. Sign Up
- Go to: https://render.com
- Sign up with GitHub

#### 2. Create Web Service
- New → Web Service
- Connect your repository
- Choose "HealthSteps"

#### 3. Configure Service
```yaml
Name: healthsteps
Environment: Node
Region: Choose nearest to Singapore
Branch: main
Build Command: npm install
Start Command: npm start
```

#### 4. Add Environment Variables
In the "Environment" section:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Bl9kug4wxKzN@...` |
| `SESSION_SECRET` | `your-random-secret-here` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

#### 5. Deploy
- Click "Create Web Service"
- Wait for deployment (3-5 minutes)
- Get URL: `https://healthsteps.onrender.com`

---

## ⚡ ALTERNATIVE: VERCEL DEPLOYMENT

Vercel requires special configuration for Node.js servers.

### Step-by-Step: Deploy to Vercel

#### 1. Create `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    },
    {
      "src": "*.css",
      "use": "@vercel/static"
    },
    {
      "src": "*.js",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### 2. Install Vercel CLI
```bash
npm install -g vercel
```

#### 3. Deploy
```bash
vercel login
vercel
```

#### 4. Add Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add NODE_ENV
```

#### 5. Deploy to Production
```bash
vercel --prod
```

---

## 🔄 STAY ON REPLIT (Current Setup)

If you want to keep using Replit:

### 1. Add Secrets in Replit
- Open Secrets (lock icon)
- Add each variable:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret
NODE_ENV=production
```

### 2. Update .replit File
Already configured! Just ensure:
```toml
[env]
PORT = "5000"
```

### 3. Deploy
- Click "Deploy" button in Replit
- Choose "Autoscale deployment"
- Configure domain

---

## 🌐 CUSTOM DOMAIN SETUP

### For Railway:
1. Go to Settings → Domains
2. Add custom domain: `healthsteps.yourdomain.com`
3. Add DNS records:
   ```
   Type: CNAME
   Name: healthsteps
   Value: yourapp.up.railway.app
   ```

### For Render:
1. Go to Settings → Custom Domain
2. Add: `healthsteps.yourdomain.com`
3. Add DNS records as shown

### For Replit:
1. Go to Deployment → Custom Domain
2. Add domain
3. Update DNS:
   ```
   Type: A
   Name: healthsteps
   Value: [Replit provides IP]
   ```

---

## 🔒 SECURITY CHECKLIST FOR PRODUCTION

### Before Deploying:
- [x] Remove all hardcoded credentials ✅
- [x] Create .env file ✅
- [x] Add .env to .gitignore ✅
- [ ] Change SESSION_SECRET to random value
- [ ] Update CORS_ORIGIN to actual domain
- [ ] Enable HTTPS (automatic on all platforms)
- [ ] Test all endpoints

### Generate Secure SESSION_SECRET:
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 PLATFORM COMPARISON

| Feature | Railway | Render | Vercel | Replit |
|---------|---------|--------|--------|--------|
| **Free Tier** | 500 hrs/mo | 750 hrs/mo | Yes | No |
| **Node.js** | ✅ Native | ✅ Native | ⚠️ Serverless | ✅ Native |
| **PostgreSQL** | ✅ | ✅ | ⚠️ | ✅ |
| **Auto Deploy** | ✅ | ✅ | ✅ | ✅ |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free | 💰 Paid |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Best For** | Production | Production | Serverless | Prototyping |

### 🏆 RECOMMENDATION: **Railway**
Best balance of features, ease of use, and cost.

---

## 🧪 POST-DEPLOYMENT TESTING

### 1. Test Homepage
```bash
curl https://your-domain.com
```
**Expected:** HTML response

### 2. Test API Health
```bash
curl https://your-domain.com/api/auth/status
```
**Expected:** `{"message":"Not authenticated"}`

### 3. Test Signup
```bash
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
**Expected:** User object with ID

### 4. Test Login
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```
**Expected:** User object + session cookie

### 5. Test Add Steps
```bash
curl -X POST https://your-domain.com/api/steps \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"steps":10000,"date":"2025-10-14","userEmail":"test@example.com"}'
```
**Expected:** Step record with ID

---

## 🚨 TROUBLESHOOTING

### Issue: "DATABASE_URL not found"
**Solution:** Add environment variable in platform settings

### Issue: "Session not persisting"
**Solutions:**
1. Check SESSION_SECRET is set
2. Verify cookies work (HTTPS required)
3. Check CORS settings

### Issue: "Cannot connect to database"
**Solutions:**
1. Verify DATABASE_URL format
2. Check Neon database is running
3. Ensure `sslmode=require` is in URL

### Issue: "Port already in use"
**Solution:** Platform manages ports automatically, don't set PORT yourself

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [x] Code committed to Git
- [x] All hardcoded credentials removed
- [x] .env file created (not committed)
- [x] .gitignore updated
- [ ] Choose deployment platform
- [ ] Create account on platform

### During Deployment:
- [ ] Connect repository
- [ ] Add environment variables
- [ ] Configure build/start commands
- [ ] Deploy application
- [ ] Wait for build to complete

### Post-Deployment:
- [ ] Test homepage loads
- [ ] Test API endpoints
- [ ] Test signup/login flow
- [ ] Test step tracking
- [ ] Set up custom domain (optional)
- [ ] Monitor logs for errors

---

## 🎯 QUICK START COMMANDS

### Deploy to Railway (Fastest):
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Add environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set SESSION_SECRET="your-secret"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### Deploy to Render (Web UI):
1. Go to render.com
2. New Web Service
3. Connect repo
4. Add env vars
5. Deploy

---

## 📞 SUPPORT RESOURCES

### Railway:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Render:
- Docs: https://render.com/docs
- Support: support@render.com

### Vercel:
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

---

**Choose your platform and follow the guide above!** 🚀

**Recommended Order:**
1. Railway (easiest, best features)
2. Render (great free tier)
3. Stay on Replit (already working)
4. Vercel (if you prefer serverless)

**NOT Netlify** - it's for static sites only, won't work for this app.

