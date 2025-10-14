# HealthSteps - Fly.io Deployment Script
# Run this script to deploy to Fly.io

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🚀 HEALTHSTEPS - FLY.IO DEPLOYMENT              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Add Fly CLI to PATH
$env:PATH += ";C:\Users\MYPC\.fly\bin"

# Check if logged in
Write-Host "Checking Fly.io authentication..." -ForegroundColor Yellow
$authCheck = flyctl auth whoami 2>&1

if ($authCheck -match "not logged in" -or $LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Fly.io`n" -ForegroundColor Red
    Write-Host "Please run: flyctl auth signup" -ForegroundColor Cyan
    Write-Host "Or: flyctl auth login (if you have account)`n" -ForegroundColor Cyan
    exit
}

Write-Host "✅ Logged in to Fly.io`n" -ForegroundColor Green

# Launch app (if not already launched)
Write-Host "Step 1: Launching app configuration..." -ForegroundColor Yellow
flyctl launch --name healthsteps --region sin --no-deploy --copy-config --yes

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ App might already exist, continuing...`n" -ForegroundColor Yellow
}

# Set secrets
Write-Host "`nStep 2: Setting environment secrets..." -ForegroundColor Yellow

Write-Host "  → Setting DATABASE_URL..." -ForegroundColor Cyan
flyctl secrets set DATABASE_URL="postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "  → Setting SESSION_SECRET..." -ForegroundColor Cyan
flyctl secrets set SESSION_SECRET="healthsteps-production-secret-2025-flyio"

Write-Host "  → Setting PORT..." -ForegroundColor Cyan
flyctl secrets set PORT="8080"

Write-Host "`n✅ Secrets configured!`n" -ForegroundColor Green

# Deploy
Write-Host "Step 3: Deploying to Fly.io..." -ForegroundColor Yellow
Write-Host "This will take 2-3 minutes...`n" -ForegroundColor White

flyctl deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║           🎉 DEPLOYMENT SUCCESSFUL!                    ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "✅ Your HealthSteps app is live at:" -ForegroundColor Yellow
    Write-Host "   https://healthsteps.fly.dev`n" -ForegroundColor Cyan
    
    Write-Host "🧪 Test your app:" -ForegroundColor Yellow
    Write-Host "   1. Open: https://healthsteps.fly.dev" -ForegroundColor White
    Write-Host "   2. Signup with new account" -ForegroundColor White
    Write-Host "   3. Add steps and see speedometer!`n" -ForegroundColor White
    
    Write-Host "📊 Manage your app:" -ForegroundColor Yellow
    Write-Host "   flyctl status    - Check app status" -ForegroundColor White
    Write-Host "   flyctl logs      - View live logs" -ForegroundColor White
    Write-Host "   flyctl ssh console - SSH into machine`n" -ForegroundColor White
    
    # Open app in browser
    flyctl open
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check logs: flyctl logs`n" -ForegroundColor Yellow
}

