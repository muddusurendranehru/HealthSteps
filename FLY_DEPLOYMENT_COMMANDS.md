# 🚀 FLY.IO DEPLOYMENT - COPY & PASTE COMMANDS

## 📋 Run These Commands in Order

### STEP 1: Add Fly to PATH (This Session)
```powershell
$env:PATH += ";C:\Users\MYPC\.fly\bin"
```

### STEP 2: Login to Fly.io
```powershell
flyctl auth signup
```

**Or if you have account:**
```powershell
flyctl auth login
```

This opens your browser - follow the prompts!

---

### STEP 3: Launch App (Don't deploy yet)
```powershell
flyctl launch --name healthsteps --region sin --no-deploy
```

**When asked:**
- "Would you like to set up a Postgres database?" → **NO**
- "Would you like to set up an Upstash Redis database?" → **NO**
- "Would you like to deploy now?" → **NO**

---

### STEP 4: Set Environment Secrets
```powershell
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

```powershell
flyctl secrets set SESSION_SECRET="healthsteps-production-secret-2025-flyio"
```

```powershell
flyctl secrets set PORT="8080"
```

---

### STEP 5: Deploy!
```powershell
flyctl deploy
```

**Wait 2-3 minutes...**

---

### STEP 6: Open Your App
```powershell
flyctl open
```

**Or manually go to:** https://healthsteps.fly.dev

---

## 🧪 TEST YOUR DEPLOYMENT

### Check Status:
```powershell
flyctl status
```

### View Logs:
```powershell
flyctl logs
```

### Check App Info:
```powershell
flyctl info
```

---

## 🎯 EXPECTED RESULT

After `flyctl deploy`, you should see:
```
✓ Created release
✓ Machine started
✓ Deployment successful

Visit your app at: https://healthsteps.fly.dev
```

---

## ✅ VERIFY IT WORKS

1. **Open:** https://healthsteps.fly.dev
2. **Signup:** Create test account
3. **Login:** Test authentication
4. **Dashboard:** Add steps
5. **Speedometer:** See it animate!

---

## 🔧 TROUBLESHOOTING

### If deployment fails:

```powershell
# Check logs
flyctl logs

# Check status
flyctl status

# SSH into machine (debug)
flyctl ssh console
```

### Common Fixes:

**Error: "Port not binding"**
```powershell
# Verify PORT is set
flyctl secrets list

# Should see PORT=8080
```

**Error: "Database connection failed"**
```powershell
# Check DATABASE_URL is set
flyctl secrets list

# Verify it has your Neon URL
```

**Error: "App not responding"**
```powershell
# Check if machine is running
flyctl status

# Restart machine
flyctl machine restart
```

---

## 🚀 QUICK COMMANDS SUMMARY

```powershell
# 1. Add to PATH
$env:PATH += ";C:\Users\MYPC\.fly\bin"

# 2. Login
flyctl auth signup

# 3. Launch (no deploy)
flyctl launch --name healthsteps --region sin --no-deploy

# 4. Set secrets
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
flyctl secrets set SESSION_SECRET="healthsteps-production-secret-2025-flyio"
flyctl secrets set PORT="8080"

# 5. Deploy
flyctl deploy

# 6. Open app
flyctl open
```

---

## 📊 YOUR APP WILL BE LIVE AT:

```
https://healthsteps.fly.dev
```

**With:**
- ✅ HTTPS (automatic SSL)
- ✅ Singapore region (close to Neon DB)
- ✅ Auto-scaling
- ✅ Free tier
- ✅ Custom domain support

---

**Ready to start? Run STEP 1 now!** 🚀

