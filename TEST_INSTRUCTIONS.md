# 🧪 HEALTHSTEPS - TESTING INSTRUCTIONS

## ✅ Server is Running on http://localhost:5000

---

## 📋 COMPLETE TEST CHECKLIST

### Test 1: Homepage
1. Open: http://localhost:5000
2. Should see: "🏥 HealthStep" logo
3. Should see: "Sign In" and "Create Account" buttons
4. Click "Create Account"

**Expected:** Redirects to signup page

---

### Test 2: Sign Up New User
1. URL: http://localhost:5000/signup.html
2. Enter:
   - Email: `yourname@test.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"

**Expected:** 
- Success message: "Account created successfully!"
- Redirects to dashboard after 2 seconds

---

### Test 3: Dashboard Access
1. After signup, should redirect to: http://localhost:5000/dashboard.html
2. Should see:
   - Your email in top right
   - "Track Today's Steps" section
   - Quick add buttons (5K, 7.5K, 10K)
   - "Your Step History" section
   - Logout button

**Expected:** Dashboard loads with your email displayed

---

### Test 4: Add Steps
1. In the dashboard, enter steps: `10000`
2. Select today's date
3. Click "Save Steps"

**Expected:** 
- Success message: "Steps added successfully!"
- Step appears in "Your Step History" section

---

### Test 5: View Steps History
1. Click "Refresh" button in step history section
2. Should see your 10,000 steps for today

**Expected:** 
```
10,000 steps
10/14/2025
```

---

### Test 6: Add More Steps (Different Dates)
1. Change date to yesterday
2. Enter steps: `8500`
3. Click "Save Steps"
4. Change date to 2 days ago
5. Enter steps: `12000`
6. Click "Save Steps"

**Expected:** All three days appear in history, sorted by date

---

### Test 7: Quick Add Buttons
1. Click "5K" button
2. Notice steps field auto-fills with 5000
3. Select a date
4. Click "Save Steps"

**Expected:** 5,000 steps saved for selected date

---

### Test 8: Logout
1. Click "Logout" button in top right
2. Should redirect to login page

**Expected:** 
- Redirects to http://localhost:5000/login.html
- Session cleared

---

### Test 9: Login Existing User
1. URL: http://localhost:5000/login.html
2. Enter:
   - Email: `yourname@test.com`
   - Password: `password123`
3. Click "Sign In"

**Expected:**
- Success message: "Login successful!"
- Redirects to dashboard
- All your previous steps are still there

---

### Test 10: Database Persistence
1. Close browser completely
2. Open new browser window
3. Go to: http://localhost:5000/login.html
4. Login again

**Expected:** All your data is still there (stored in Neon database)

---

## 🐛 TROUBLESHOOTING

### Issue: Can't access http://localhost:5000
**Solution:** 
```bash
# Check if server is running
netstat -ano | findstr :5000

# If not running, start it:
npm run dev
```

### Issue: "Not authenticated" error
**Solution:** Login first at http://localhost:5000/login.html

### Issue: Steps not appearing
**Solution:** 
1. Check browser console (F12)
2. Check for JavaScript errors
3. Verify userEmail is being sent

### Issue: "Invalid credentials" error
**Solution:**
1. Make sure email and password are correct
2. Try creating new account
3. Check database connection

---

## 📊 WHAT TO LOOK FOR

### ✅ Good Signs:
- Server running message in terminal
- Pages load without errors
- Forms submit successfully
- Data persists after page refresh
- Logout/login cycle works
- Multiple dates can be tracked

### ❌ Warning Signs:
- Console errors (F12)
- "Not authenticated" messages
- Data not saving
- Redirect loops
- Sessions not persisting

---

## 🔍 BROWSER CONSOLE DEBUGGING

### Open Developer Tools:
- **Chrome/Edge:** Press F12
- **Firefox:** Press F12
- **Console tab:** See JavaScript errors

### What to Look For:
```javascript
// Good messages (green):
[AUTH] Found stored user: yourname@test.com
[LOAD STEPS] Received steps data: [...]
[LOAD STEPS] Rendering 3 step records

// Bad messages (red):
[ERROR] Failed to fetch steps
[AUTH] No user found
Network error. Please try again.
```

---

## 🧪 API TESTING (Advanced)

### Using PowerShell:

#### Test Signup:
```powershell
$body = @{
    email = "api-test@example.com"
    password = "test123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/signup `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Test Login:
```powershell
$body = @{
    email = "api-test@example.com"
    password = "test123456"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -SessionVariable session

$response.Content
```

#### Test Add Steps:
```powershell
$body = @{
    steps = 15000
    date = "2025-10-14"
    userEmail = "api-test@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/steps `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -WebSession $session
```

---

## ✅ EXPECTED RESULTS

### After Complete Testing:
- ✅ User account created in database
- ✅ Multiple step records saved
- ✅ Data persists after browser restart
- ✅ Login/logout works correctly
- ✅ All CRUD operations functional

### Database Should Have:
- **users table:** Your new user record
- **steps table:** Multiple step records with different dates
- **user_sessions table:** Active session entries

---

## 🎯 SUCCESS CRITERIA

### ✅ All Tests Pass If:
1. Can create account
2. Can login
3. Can add steps
4. Can view step history
5. Steps persist in database
6. Can logout
7. Can login again with same credentials
8. All previous data still visible

---

## 📝 REPORT ISSUES

### If Something Fails:

1. **Check terminal for errors:**
   - Look for red error messages
   - Check database connection errors

2. **Check browser console (F12):**
   - Look for JavaScript errors
   - Check network tab for failed requests

3. **Take screenshot of:**
   - The error message
   - Browser console
   - Terminal output

4. **Note which test failed:**
   - Test number
   - What you expected
   - What actually happened

---

## 🎉 NEXT STEPS AFTER TESTING

### If All Tests Pass:
1. ✅ Your app is working perfectly!
2. 📖 Read DEPLOYMENT_GUIDE.md
3. 🚀 Deploy to Railway/Render
4. 🌐 Get your app online!

### If Some Tests Fail:
1. 🐛 Note which tests failed
2. 📋 Check troubleshooting section
3. 🔍 Review error messages
4. 💬 Ask for help with specific errors

---

**Ready to test?** Open http://localhost:5000 and follow the checklist! 🚀

