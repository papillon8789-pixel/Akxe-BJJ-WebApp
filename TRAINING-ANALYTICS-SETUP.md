# Training Analytics / Mat Log - Setup Guide

## 📋 Overview

The Training Analytics feature allows admin users to track their BJJ training sessions, view statistics, and analyze their progress over time. This feature includes:

- **Quick Entry Form** - Log training sessions with preset session types
- **Month Timeline Filter** - View data by month (last 6 months + next 6 months)
- **Analytics Dashboard** - Visual widgets showing training statistics
- **Training History** - List of all logged sessions with delete functionality

## 🗄️ Database Setup

### Step 1: Create the Training Logs Table

Run the SQL schema to create the `training_logs` table in your Cloudflare D1 database:

```bash
cd bjj-app/workers
wrangler d1 execute bjj-auth-db --file=./schema-training-logs.sql
```

This creates:
- `training_logs` table with all necessary fields
- Indexes for fast queries
- Automatic timestamp triggers

### Step 2: Verify Table Creation

```bash
wrangler d1 execute bjj-auth-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='training_logs';"
```

You should see `training_logs` in the output.

## 🚀 Deployment

### Step 1: Deploy Updated Worker

The worker API has been updated with 4 new endpoints for training logs:

```bash
cd bjj-app/workers
wrangler deploy
```

### Step 2: Verify Endpoints

The following endpoints are now available:

- `POST /api/training-log/add` - Add new training log entry
- `GET /api/training-log/list?month=YYYY-MM` - Get training logs (with optional month filter)
- `GET /api/training-log/analytics?month=YYYY-MM` - Get analytics data
- `DELETE /api/training-log/delete` - Delete a training log entry

### Step 3: Deploy Frontend

```bash
cd bjj-app
npm run build
```

Then deploy the `dist` folder to your hosting provider (Cloudflare Pages, Vercel, etc.).

## 📊 Features

### 1. Session Type Presets

Pre-configured session types with automatic duration and type:

| Session Type | Duration | Gi/NoGi | Notes |
|-------------|----------|---------|-------|
| Gi Basic | 60 min | Gi | Fundamentals class |
| Gi BJJ | 90 min | Gi | Regular BJJ class |
| Gi Takedown | 60 min | Gi | Takedown-focused class |
| Sparring | 120 min | User Choice | Open sparring session |
| OpenMat | 120 min | User Choice | Open mat training |
| Custom | User Input | User Choice | Fully customizable |

### 2. Automatic Calorie Calculation

- **Base Rate**: ~11.6 kcal per minute (700 kcal per hour)
- Automatically calculated based on duration
- Manually adjustable in the form

### 3. Analytics Widgets

#### Donut Chart - Gi vs NoGi
- Visual breakdown of training time
- Percentage distribution
- Color-coded: Gi (Orange #FF8C00), NoGi (Brown #A0522D)

#### Total Duration Card
- Total training time in the selected month
- Formatted as hours and minutes
- Session count

#### Average Session Length Card
- Average duration per training session
- Helps track training consistency

#### Calories Burned Card
- Total estimated calories burned
- Based on all sessions in the selected month

### 4. Training History

- Chronological list of all training sessions
- Filterable by month
- Each entry shows:
  - Date and weekday
  - Session type and Gi/NoGi badge
  - Duration and calories
  - Optional notes
  - Delete button

## 🎨 UI Design

The Training Analytics page follows the dark theme of your BJJ app:

- **Color Scheme**:
  - Background: `#0a0a0a` (app-bg)
  - Cards: `#1a1a1a` (card-bg)
  - Primary: `#dc2626` (primo-red)
  - Gi: `#FF8C00` (orange)
  - NoGi: `#A0522D` (brown)

- **Responsive Design**:
  - Mobile-first approach
  - Breakpoints: sm, md, lg
  - Horizontal scrolling for month timeline on mobile
  - Grid layout adapts to screen size

## 🔐 Access Control

- **Admin Only**: Only users with `isAdmin: true` can access Training Analytics
- Non-admin users see a "Admin Only" message
- Access check happens both in frontend and backend (API endpoints)

## 📱 User Flow

### Adding a Training Session

1. Click "Training Analytics" button (green button below header)
2. Click "Add Training Session" button
3. Fill in the form:
   - Select date (defaults to today)
   - Choose session type (preset or custom)
   - Adjust duration if needed
   - Select Gi or NoGi
   - Adjust calories if needed (optional)
   - Add notes (optional)
4. Click "Add Training Log"
5. Session appears in the history list

### Viewing Analytics

1. Use the month timeline at the top to filter by month
2. View the 4 analytics widgets:
   - Donut chart shows Gi/NoGi distribution
   - Cards show totals and averages
3. Scroll down to see detailed training history

### Deleting a Session

1. Find the session in the training history
2. Click the trash icon on the right
3. Confirm deletion
4. Session is removed and analytics update automatically

## 🧪 Testing

### Manual Testing Checklist

- [ ] Database table created successfully
- [ ] Worker deployed with new endpoints
- [ ] Frontend deployed with TrainingLog component
- [ ] Admin user can access Training Analytics page
- [ ] Non-admin user sees "Admin Only" message
- [ ] Can add a new training session
- [ ] Session appears in the history list
- [ ] Analytics widgets update correctly
- [ ] Month filter works correctly
- [ ] Can delete a training session
- [ ] Donut chart displays correct percentages
- [ ] Calorie calculation is accurate
- [ ] Mobile responsive design works

### API Testing

Test the endpoints with curl or Postman:

```bash
# Get training logs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-worker.workers.dev/api/training-log/list?month=2026-10"

# Get analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-worker.workers.dev/api/training-log/analytics?month=2026-10"

# Add training log
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-10-21",
    "weekday": "Tuesday",
    "sessionType": "Gi BJJ",
    "durationMinutes": 90,
    "giType": "Gi",
    "caloriesBurned": 1044,
    "notes": "Great session!"
  }' \
  "https://your-worker.workers.dev/api/training-log/add"
```

## 🐛 Troubleshooting

### Issue: "Failed to fetch logs"

**Solution**: Check that:
1. Worker is deployed with the new endpoints
2. Database table exists
3. JWT token is valid
4. VITE_API_URL is set correctly in `.env`

### Issue: "Admin Only" message for admin user

**Solution**: Verify that:
1. User has `is_admin = 1` in the `allowed_users` table
2. JWT token includes admin status
3. Session is valid (not expired)

### Issue: Analytics not updating

**Solution**:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Ensure month filter is set correctly
4. Try refreshing the page

### Issue: Donut chart not displaying

**Solution**:
1. Ensure there are training logs in the selected month
2. Check that `giBreakdown` data is returned from API
3. Verify SVG rendering in browser DevTools

## 📝 Future Enhancements

Potential features to add:

- [ ] **Weekly/Yearly Views** - Additional time period filters
- [ ] **Export Data** - Download training logs as CSV/PDF
- [ ] **Goals & Streaks** - Set training goals and track streaks
- [ ] **Technique Tracking** - Log specific techniques practiced
- [ ] **Training Partners** - Track who you trained with
- [ ] **Injury Tracking** - Log injuries and recovery time
- [ ] **Belt Progress** - Track progress towards next belt
- [ ] **Charts & Graphs** - More detailed visualizations
- [ ] **Comparison View** - Compare different time periods
- [ ] **Mobile App** - Native mobile app for easier logging

## 📚 Related Files

### Frontend
- `src/components/TrainingLog.jsx` - Main component
- `src/App.jsx` - Routing and navigation

### Backend
- `workers/auth-api.js` - API endpoints (lines 1367-1550)
- `workers/schema-training-logs.sql` - Database schema

### Documentation
- `TRAINING-ANALYTICS-SETUP.md` - This file
- `changelog.md` - Update with new feature

## 🎉 Changelog Entry

Add this to your `changelog.md`:

```markdown
## [2026-10-21] - Training Analytics / Mat Log Feature 📊

### Hinzugefügt
- **Training Analytics Dashboard** - Admin-only feature to track BJJ training sessions
  - Quick entry form with preset session types (Gi Basic, Gi BJJ, Gi Takedown, Sparring, OpenMat, Custom)
  - Month timeline filter (last 6 months + next 6 months)
  - Analytics widgets:
    - Donut chart showing Gi vs NoGi distribution
    - Total duration card with session count
    - Average session length card
    - Calories burned card (auto-calculated at ~11.6 kcal/min)
  - Training history list with delete functionality
  - Mobile-responsive dark theme design

- **Database Schema**:
  - New `training_logs` table in D1 database
  - Fields: date, weekday, session_type, duration_minutes, gi_type, calories_burned, notes
  - Indexes for fast queries by user and date

- **API Endpoints**:
  - `POST /api/training-log/add` - Add new training log
  - `GET /api/training-log/list` - Get training logs with month filter
  - `GET /api/training-log/analytics` - Get analytics data
  - `DELETE /api/training-log/delete` - Delete training log

### Geändert
- **App.jsx**: Added Training Analytics view and navigation button
- **workers/auth-api.js**: Added 4 new training log endpoints

### Technische Details
- Admin-only access control (frontend + backend)
- Automatic calorie calculation based on duration
- Month-based filtering for all queries
- SVG-based donut chart (no external chart library needed)
- Responsive design with Tailwind CSS
- Integration with existing auth system

### User Experience
- Admin users see new "Training Analytics" button (green) below header
- Click to access training log dashboard
- Add sessions with preset types or custom values
- View analytics filtered by month
- Delete sessions with confirmation
- All data persists in Cloudflare D1 database
```

## 🔗 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check the Network tab for API responses
4. Verify database schema and worker deployment

---

**Created**: 2026-10-21  
**Version**: 1.0.0  
**Author**: Roo (AI Assistant)
