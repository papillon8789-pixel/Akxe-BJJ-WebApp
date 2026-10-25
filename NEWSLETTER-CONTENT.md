# Newsletter Content - English Version

## Subject Line
🎉 New Features in the PRIMO BJJ App!

---

## Email Body (Plain Text Version)

```
Hey BJJ Family,

We've got exciting updates for you! The PRIMO BJJ App has been enhanced with new features:

📊 TRAINING ANALYTICS NOW AVAILABLE FOR EVERYONE

Just launched! Track your training sessions and monitor your progress:

• 📅 Training calendar with all your sessions
• 🥋 Gi vs NoGi statistics
• 🔥 Calories burned tracking
• ⏱️ Total training time and averages
• 📈 Monthly overviews and trends

Perfect for optimizing your training routine and staying motivated!

🎥 4 NEW SUMI GAESHI TAKEDOWN VIDEOS!

From Wednesday's training session, now available:

• Sumi Gaeshi - Yoko NoGi Version (arm and body grip)
• Sumi Gaeshi - Upper Hook NoGi Version
• Sumi Gaeshi - Under Hook NoGi Version
• Sumi Gaeshi - Russian Tie NoGi Version

READY TO GET STARTED?

Log in now and discover the new features!

👉 https://primo-bjj.com

Happy training!
Your PRIMO BJJ Team

---
© 2026 PRIMO BJJ - AKXE München
"Together we stand, united we fight"
```

---

## HTML Email Template

The full HTML version is implemented in `src/components/AdminDashboard.jsx` in the `handleSendNewsletter()` function.

### Key Features:
- Professional gradient header with PRIMO BJJ branding
- Feature box highlighting Training Analytics
- Highlight box for new videos
- Call-to-action button
- Responsive design
- Mobile-friendly layout

---

## Newsletter Sending Instructions

### Via Admin Dashboard:
1. Log in as admin
2. Navigate to Admin Dashboard
3. Click "Send Newsletter" button (top right)
4. Review the preview in the modal
5. Click "Newsletter versenden" to send
6. Wait for confirmation message

### Important Notes:
- ⚠️ Rate Limit: Only 1 newsletter per hour
- 📧 Recipients: All active users (status = 'active', valid_until > now)
- 📊 Logging: All sends are logged in database
- 🔔 Notifications: Admin receives notification after send

---

## Testing Before Sending

### Recommended Test Process:

1. **Create a test user:**
```sql
INSERT INTO allowed_users (email, valid_until, paid_months, status, added_date)
VALUES ('test@example.com', '2027-12-31', 12, 'active', date('now'));
```

2. **Temporarily suspend other users:**
```sql
UPDATE allowed_users 
SET status = 'suspended' 
WHERE email != 'test@example.com' AND is_admin != 1;
```

3. **Send test newsletter**
   - Check that email arrives
   - Verify formatting
   - Test all links

4. **Restore user status:**
```sql
UPDATE allowed_users 
SET status = 'active' 
WHERE valid_until > datetime('now');
```

5. **Send to all users**

---

## Monitoring After Send

### Check Resend Dashboard:
- URL: https://resend.com/emails
- Verify delivery status
- Check bounce/spam rates
- Monitor open rates (if enabled)

### Check Database Logs:
```sql
-- View last newsletter
SELECT * FROM newsletter_logs ORDER BY created_at DESC LIMIT 1;

-- View admin notification
SELECT * FROM admin_notifications 
WHERE type = 'newsletter_sent' 
ORDER BY created_at DESC LIMIT 1;
```

---

## Future Newsletter Ideas

### Potential Topics:
- New technique videos added
- Upcoming seminars/events
- Training tips and tricks
- Member spotlights
- Competition results
- App feature updates
- Training challenges
- Belt promotions

### Best Practices:
- Keep it concise (under 500 words)
- Use clear subject lines
- Include call-to-action
- Mobile-friendly design
- Send at optimal times (evenings/weekends)
- Track engagement metrics
- Don't send too frequently (max 1-2 per week)

---

## Customizing Future Newsletters

To create a new newsletter, edit in `src/components/AdminDashboard.jsx`:

```javascript
const handleSendNewsletter = async () => {
  // Change subject
  const subject = 'Your New Subject Here';
  
  // Change HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML here -->
    </html>
  `;
  
  // Rest of the function stays the same
}
```

Or create a template system for multiple newsletter types (future enhancement).
