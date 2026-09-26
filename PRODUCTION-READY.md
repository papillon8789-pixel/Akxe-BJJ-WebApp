# PRIMO BJJ - Production Ready Documentation

## 🚀 Live URLs

- **Production App:** https://primo-bjj.com
- **Backup URL:** https://akxe-bjj-webapp.pages.dev
- **API Worker:** https://bjj-auth-api.papillon8789.workers.dev

## 📧 Email System

- **Sender:** noreply@primo-bjj.com
- **Service:** Resend
- **Domain:** Verified and Active
- **Admin Notifications:** papillon8789@gmail.com

## 🔐 Authentication System

### Self-Service Registration
1. User enters email → receives 6-digit code
2. User enters code → account created as "pending"
3. Admin receives email notification
4. Admin approves/rejects in dashboard
5. User receives activation email

### Admin Access
- **Admin Email:** papillon8789@gmail.com
- **Dashboard:** Click "Admin Dashboard" button in app
- **Permissions:** Only admin can approve/reject users

## 👥 User Management

### Approval Options
- **✓ 1M** - 1 month access
- **✓ 3M** - 3 months access
- **✓ 6M** - 6 months access
- **✓ 12M** - 12 months access
- **📅 Custom** - Choose any date
- **✗ Reject** - Delete pending user

### User Status
- `pending` - Waiting for admin approval
- `active` - Can access the app
- `suspended` - Access revoked

## 🗄️ Database

### Cloudflare D1 Database
- **Name:** bjj-auth-db
- **ID:** 9db9f3c0-7a6e-41d8-a440-3322e56725b0

### Tables
1. **allowed_users** - User accounts with status
2. **verification_codes** - 6-digit codes (15 min expiry)
3. **sessions** - JWT sessions (30 day expiry)
4. **login_attempts** - Rate limiting (future)
5. **admin_notifications** - Admin notification tracking

### Key Columns
- `email` - User email (unique)
- `status` - pending/active/suspended
- `is_admin` - Admin flag (1 = admin)
- `valid_until` - Subscription expiry date
- `paid_months` - Subscription length
- `approved_by` - Who approved the user
- `approved_at` - When approved

## 🔧 Technical Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Hosting:** Cloudflare Pages
- **Auto-Deploy:** On git push to main

### Backend
- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Email:** Resend API
- **Auth:** JWT with HMAC SHA-256

### Security
- Email verification required
- JWT tokens (30-day sessions)
- Admin-only endpoints
- Rate limiting ready
- No public user list

## 📝 API Endpoints

### Public Endpoints
```
POST /api/auth/request-verification
POST /api/auth/verify-token
POST /api/auth/validate-session
```

### Admin Endpoints (Requires Admin JWT)
```
GET  /api/admin/pending-users
POST /api/admin/approve-user
POST /api/admin/reject-user
GET  /api/admin/notifications
```

## 🛠️ Maintenance

### Add New User Manually
```bash
cd bjj-app/workers
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, status, is_admin) 
VALUES ('user@example.com', '2027-12-31', 12, 'active', 0);"
```

### Check Pending Users
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT email, created_at FROM allowed_users WHERE status='pending';"
```

### Make User Admin
```bash
wrangler d1 execute bjj-auth-db --remote --command="
UPDATE allowed_users SET is_admin=1 WHERE email='admin@example.com';"
```

## 📊 Monitoring

### View Worker Logs
```bash
cd bjj-app/workers
wrangler tail
```

### Check Database
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT status, COUNT(*) as count FROM allowed_users GROUP BY status;"
```

## 🔄 Deployment

### Frontend (Automatic)
```bash
cd bjj-app
git add .
git commit -m "Update"
git push origin main
# Cloudflare Pages auto-deploys
```

### Backend (Manual)
```bash
cd bjj-app/workers
wrangler deploy
```

## 📚 Documentation Files

- `EMAIL-VERIFICATION-SETUP.md` - Complete setup guide
- `SECURITY-IMPROVEMENTS.md` - Security analysis
- `USER-MANAGEMENT.md` - User management guide
- `RESEND-DOMAIN-SETUP.md` - Email domain setup
- `QUICK-START-EMAIL-VERIFICATION.md` - Quick start guide
- `PRODUCTION-READY.md` - This file

## ✅ Production Checklist

- [x] Email verification working
- [x] Self-service registration active
- [x] Admin dashboard functional
- [x] Custom domain configured (primo-bjj.com)
- [x] SSL certificate active
- [x] Database migrations applied
- [x] Email notifications working
- [x] JWT authentication secure
- [x] All code on GitHub
- [x] Documentation complete

## 🎯 Next Steps (Optional)

1. **Analytics** - Add Google Analytics or Plausible
2. **Rate Limiting** - Implement login attempt limits
3. **Bulk Actions** - Approve multiple users at once
4. **User Dashboard** - Show subscription status to users
5. **Payment Integration** - Stripe for automatic renewals
6. **Push Notifications** - Real-time admin alerts
7. **Audit Log** - Track all admin actions

## 🆘 Support

### Common Issues

**Q: User can't log in**
- Check if email is in database and status is 'active'
- Check if valid_until date is in the future
- Ask user to request new verification code

**Q: Admin dashboard not showing**
- Verify is_admin=1 in database
- Clear browser cache and re-login
- Check JWT token is valid

**Q: Emails not arriving**
- Check Resend dashboard for delivery status
- Verify domain DNS records
- Check spam folder

### Contact
- **Developer:** Roo (AI Assistant)
- **Admin:** papillon8789@gmail.com
- **GitHub:** papillon8789-pixel/Akxe-BJJ-WebApp

---

**Last Updated:** 2026-09-26
**Version:** 1.0.0
**Status:** ✅ Production Ready
