# 🏥 HealthSteps - Healthcare Step Tracker

A beautiful healthcare application for tracking daily steps with real-time visualization.

## ✨ Features

- 👤 **User Authentication** - Secure signup/login with bcrypt
- 📊 **Step Tracking** - Track daily steps with cumulative totals
- 🎨 **Speedometer Gauge** - Beautiful visual progress indicator with color zones
- 📈 **Step History** - View all your tracked days
- 🔒 **Session Management** - PostgreSQL-backed sessions
- 🌐 **Production Ready** - Deployed and working with real users

## 🎯 Speedometer Color Zones

- 🔴 **RED (0-5,000 steps):** Getting Started
- 🟠 **ORANGE (5,000-10,000 steps):** Keep Going!
- 🔵 **BLUE (10,000-12,000 steps):** Great Progress!
- 🟢 **GREEN (12,000+ steps):** Excellent! 🎯

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Neon PostgreSQL database

### Installation

```bash
# Clone repository
git clone https://github.com/muddusurendranehru/HealthSteps.git
cd HealthSteps

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Add your database credentials to .env
# DATABASE_URL=your-neon-database-url
# SESSION_SECRET=your-random-secret

# Start server
npm start
```

### Access Application
```
Homepage: http://localhost:5000
Signup: http://localhost:5000/signup.html
Login: http://localhost:5000/login.html
Dashboard: http://localhost:5000/dashboard.html
```

## 🗄️ Database

### Tables Used:
- **users** - User authentication and profiles
- **steps** - Daily step tracking with cumulative totals
- **user_sessions** - Secure session management

### Required Environment Variables:
```bash
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
SESSION_SECRET=your-random-secret-key
NODE_ENV=development
PORT=5000
```

## 🌐 Deployment

### Recommended: Glitch.com (No Credit Card!)

1. Go to https://glitch.com
2. Sign in with GitHub
3. New Project → Import from GitHub
4. Add environment variables in `.env` file
5. Your app is live!

**Full deployment guides:**
- `DEPLOY_GLITCH.md` - Glitch deployment (recommended)
- `DEPLOYMENT_GUIDE.md` - Railway, Render, Vercel
- `FLY_DEPLOYMENT_COMMANDS.md` - Fly.io deployment

## 📚 Documentation

- `PROJECT_ANALYSIS_AND_FIX_PLAN.md` - Complete database analysis
- `DEPLOYMENT_READY.md` - Deployment checklist
- `SPEEDOMETER_FEATURE.md` - Speedometer implementation
- `TEST_INSTRUCTIONS.md` - Testing guide
- `ALL_FIXES_COMPLETE.md` - Fix verification

## 🛠️ Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** Neon PostgreSQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Authentication:** bcrypt + express-session
- **ORM:** Drizzle ORM
- **Sessions:** PostgreSQL-backed (connect-pg-simple)

## 🔒 Security

- ✅ No hardcoded credentials
- ✅ Environment variables for all secrets
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL-backed sessions
- ✅ CORS configured
- ✅ .env excluded from Git

## 🎨 UI Features

- Responsive design
- Beautiful speedometer with smooth animations
- Color-coded progress zones
- Real-time updates
- Mobile-friendly

## 📊 Current Status

- **Users:** 20+ registered users
- **Server:** Running on port 5000
- **Database:** Connected to Neon (Singapore region)
- **Features:** 100% functional
- **Deployment:** Ready for any platform

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test signup
Open: http://localhost:5000/signup.html

# Test login
Open: http://localhost:5000/login.html

# Test dashboard
Login → http://localhost:5000/dashboard.html
```

## 📝 SQL Queries

### Check User Steps:
```sql
SELECT * FROM steps WHERE user_email = 'your@email.com';
```

### View All Users:
```sql
SELECT id, email, created_at FROM users ORDER BY id DESC LIMIT 10;
```

See more in documentation files.

## 🤝 Contributing

This is a healthcare tracking application for a small healthcare center.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Neon PostgreSQL for database hosting
- Express.js team
- Drizzle ORM

---

**Built with ❤️ for better healthcare tracking**

🚀 **Ready to deploy!** See `DEPLOY_GLITCH.md` for easiest deployment (no credit card needed).

