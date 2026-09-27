# Events Management Guide

This guide explains how to manage the "Upcoming Events" section on your BJJ app.

## Overview

The Upcoming Events section appears below the Training Schedule and displays up to 3 upcoming events. Events are automatically filtered (past events are hidden) and sorted by date.

## Location

The events are managed in: [`src/components/UpcomingEvents.jsx`](src/components/UpcomingEvents.jsx)

## How to Add/Edit Events

### 1. Open the UpcomingEvents Component

Navigate to `bjj-app/src/components/UpcomingEvents.jsx` and find the `events` array (around line 7-16).

### 2. Event Structure

Each event has the following properties:

```javascript
{
  id: 1,                                    // Unique number for each event
  title: 'Xmas Party',                      // Event name
  date: '2024-12-12',                       // Date in YYYY-MM-DD format
  time: '19:30',                            // Time in HH:MM format
  description: 'Xmas OpenMat + Dinner/Drinks',  // Event details
  icon: '🎄',                               // Emoji icon for the event
  color: 'red'                              // Color theme (see options below)
}
```

### 3. Available Colors

Choose from these color themes:
- `'red'` - Red gradient (great for parties, special events)
- `'gold'` - Gold gradient (premium events, championships)
- `'blue'` - Blue gradient (seminars, workshops)
- `'green'` - Green gradient (open mats, training camps)
- `'purple'` - Purple gradient (competitions, tournaments)

### 4. Example: Adding a New Event

```javascript
const [events, setEvents] = useState([
  {
    id: 1,
    title: 'Xmas Party',
    date: '2024-12-12',
    time: '19:30',
    description: 'Xmas OpenMat + Dinner/Drinks',
    icon: '🎄',
    color: 'red'
  },
  {
    id: 2,
    title: 'New Year Open Mat',
    date: '2025-01-01',
    time: '10:00',
    description: 'Start the year with training! All levels welcome',
    icon: '🎊',
    color: 'gold'
  },
  {
    id: 3,
    title: 'BJJ Seminar with Guest Instructor',
    date: '2025-01-15',
    time: '14:00',
    description: 'Special techniques workshop - Limited spots',
    icon: '🥋',
    color: 'blue'
  }
]);
```

### 5. Emoji Icon Suggestions

Choose emojis that match your event:
- 🎄 Christmas/Holiday events
- 🎊 New Year celebrations
- 🥋 Training events, seminars
- 🏆 Competitions, tournaments
- 🍕 Social events, dinners
- 🎉 Parties, celebrations
- 📚 Workshops, educational events
- 🌟 Special occasions
- 🔥 Intense training camps
- 🎯 Goal-oriented events

## Important Notes

### Automatic Features
- **Past events are automatically hidden** - No need to manually remove old events
- **Events are sorted by date** - Nearest event appears first
- **Maximum 3 events displayed** - Even if you add more, only the next 3 will show
- **Section auto-hides** - If no upcoming events exist, the entire section disappears

### Date Format
Always use `YYYY-MM-DD` format for dates:
- ✅ Correct: `'2024-12-25'`
- ❌ Wrong: `'25-12-2024'` or `'12/25/2024'`

### Time Format
Use 24-hour format `HH:MM`:
- ✅ Correct: `'19:30'` (7:30 PM)
- ✅ Correct: `'09:00'` (9:00 AM)
- ❌ Wrong: `'7:30 PM'`

## Deployment

After editing events:

1. **Save the file** (`UpcomingEvents.jsx`)
2. **Test locally** (if dev server is running, changes appear immediately)
3. **Commit changes** to Git
4. **Push to GitHub** - Cloudflare Pages will auto-deploy

```bash
git add src/components/UpcomingEvents.jsx
git commit -m "Update upcoming events"
git push
```

## Future Enhancements

Currently, events are hardcoded in the component. Potential future improvements:

1. **Admin Dashboard Integration** - Add/edit events through the admin panel
2. **Database Storage** - Store events in D1 database
3. **Event Categories** - Filter by event type
4. **RSVP System** - Let users register for events
5. **Calendar Integration** - Export to Google Calendar, iCal
6. **Notifications** - Email reminders for upcoming events

## Troubleshooting

### Events not showing?
- Check that the date is in the future
- Verify date format is `YYYY-MM-DD`
- Make sure the component is imported in `App.jsx`

### Wrong colors?
- Check that color value matches one of: `'red'`, `'gold'`, `'blue'`, `'green'`, `'purple'`
- Color names are case-sensitive (use lowercase)

### Layout issues on mobile?
- The component is fully responsive by default
- Test on different screen sizes using browser dev tools

## Example: Complete Events Array

```javascript
const [events, setEvents] = useState([
  {
    id: 1,
    title: 'Xmas Party',
    date: '2024-12-12',
    time: '19:30',
    description: 'Xmas OpenMat + Dinner/Drinks at the gym',
    icon: '🎄',
    color: 'red'
  },
  {
    id: 2,
    title: 'IBJJF Munich Open',
    date: '2025-02-15',
    time: '08:00',
    description: 'Team competition - Register by Feb 1st',
    icon: '🏆',
    color: 'purple'
  },
  {
    id: 3,
    title: 'Summer Training Camp',
    date: '2025-07-20',
    time: '09:00',
    description: '3-day intensive training camp in the Alps',
    icon: '🏔️',
    color: 'green'
  }
]);
```

---

**Need help?** Contact the development team or check the main [README.md](README.md) for more information.
