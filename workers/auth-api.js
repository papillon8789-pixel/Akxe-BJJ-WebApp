/**
 * Cloudflare Worker für Email-Verifizierung mit Self-Service Registration
 *
 * Public Endpoints:
 * - POST /api/auth/request-verification - Sendet Verifizierungs-Email (auch für neue User)
 * - POST /api/auth/verify-token - Verifiziert Token und gibt JWT zurück
 * - POST /api/auth/validate-session - Validiert JWT Session
 *
 * Admin Endpoints:
 * - GET /api/admin/pending-users - Liste aller pending Registrierungen
 * - GET /api/admin/all-users - Liste aller User (pending, active, suspended)
 * - POST /api/admin/approve-user - Aktiviert einen pending User
 * - POST /api/admin/reject-user - Lehnt einen pending User ab
 * - POST /api/admin/suspend-user - Sperrt einen aktiven User
 * - POST /api/admin/reactivate-user - Reaktiviert einen gesperrten User
 * - POST /api/admin/extend-access - Verlängert Zugang für einen User
 * - GET /api/admin/notifications - Ungelesene Admin-Benachrichtigungen
 */

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Admin Email (wird Benachrichtigungen erhalten)
const ADMIN_EMAIL = 'papillon8789@gmail.com';

// Hilfsfunktion für JSON Responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Generiere einen sicheren 6-stelligen Code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generiere JWT Token
async function generateJWT(email, secret, additionalData = {}) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 Tage
    iat: Math.floor(Date.now() / 1000),
    ...additionalData,
  }));
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${header}.${payload}`)
  );
  
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${header}.${payload}.${signatureBase64}`;
}

// Verifiziere JWT Token
async function verifyJWT(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(`${header}.${payload}`)
    );
    
    const expectedSignatureBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature)));
    
    if (signature !== expectedSignatureBase64) {
      return null;
    }
    
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Sende Email via Resend API
async function sendEmail(env, to, subject, html) {
  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'PRIMO BJJ <noreply@primo-bjj.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })
  });
  
  if (!emailResponse.ok) {
    const errorData = await emailResponse.json();
    console.error('Resend API error:', errorData);
    throw new Error('Failed to send email');
  }
  
  return await emailResponse.json();
}

// Prüfe ob User Admin ist
async function isAdmin(email, env) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await env.DB.prepare(
    'SELECT * FROM allowed_users WHERE email = ? AND is_admin = 1'
  ).bind(normalizedEmail).first();
  
  return !!user;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // POST /api/auth/request-verification (Self-Service)
    if (url.pathname === '/api/auth/request-verification' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        
        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Invalid email address' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Prüfe ob Email bereits existiert
        const existingUser = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        let isNewUser = false;
        
        if (!existingUser) {
          // Neuer User - erstelle pending Account
          isNewUser = true;
          const validUntil = new Date();
          validUntil.setMonth(validUntil.getMonth() + 1); // 1 Monat Trial
          const addedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          
          await env.DB.prepare(
            'INSERT INTO allowed_users (email, valid_until, paid_months, status, added_date, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))'
          ).bind(normalizedEmail, validUntil.toISOString(), 1, 'pending', addedDate).run();
          
          // Erstelle Admin-Benachrichtigung
          await env.DB.prepare(
            'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
          ).bind('new_registration', normalizedEmail, `New user registration: ${normalizedEmail}`).run();
          
          // Sende Benachrichtigung an Admin
          try {
            await sendEmail(
              env,
              ADMIN_EMAIL,
              '🔔 New User Registration - PRIMO BJJ',
              `
              <!DOCTYPE html>
              <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2>New User Registration</h2>
                  <p>A new user has registered for PRIMO BJJ Technique Library:</p>
                  <p><strong>Email:</strong> ${normalizedEmail}</p>
                  <p>Please log in to the admin dashboard to approve or reject this registration.</p>
                  <hr>
                  <p style="color: #666; font-size: 12px;">PRIMO BJJ - AKXE München</p>
                </body>
              </html>
              `
            );
          } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
            // Continue anyway - user registration is more important
          }
        } else if (existingUser.status === 'suspended') {
          return jsonResponse({ 
            error: 'Your account has been suspended. Please contact your professor.' 
          }, 403);
        }
        
        // Generiere Verifizierungscode
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minuten
        
        // Speichere Code in DB
        await env.DB.prepare(
          'INSERT INTO verification_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind(normalizedEmail, verificationCode, expiresAt.toISOString()).run();
        
        // Lösche alte Codes für diese Email
        await env.DB.prepare(
          'DELETE FROM verification_codes WHERE email = ? AND created_at < datetime("now", "-15 minutes")'
        ).bind(normalizedEmail).run();
        
        // Sende Verifizierungs-Email
        const emailSubject = isNewUser 
          ? 'Welcome to PRIMO BJJ - Verify Your Email'
          : 'Your PRIMO BJJ Verification Code';
        
        const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .code-box { background: #f5f5f5; border: 2px solid #dc2626; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
              .code { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; }
              .content { padding: 30px; background: white; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
              .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
              .info { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🦅 PRIMO BJJ</div>
                <p style="margin: 0; opacity: 0.9;">Technique Locker</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1a1a1a; margin-top: 0;">${isNewUser ? 'Welcome!' : 'Welcome back!'}</h2>
                ${isNewUser ? `
                <p>Thank you for registering for the PRIMO BJJ Technique Library!</p>
                <div class="info">
                  <strong>ℹ️ Account Pending Approval</strong><br>
                  Your account is currently pending approval by your professor. You'll receive another email once your account is activated.
                </div>
                ` : `
                <p>You requested access to the PRIMO BJJ Technique Library.</p>
                `}
                
                <p>Your verification code is:</p>
                
                <div class="code-box">
                  <div class="code">${verificationCode}</div>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> This code is only valid for 15 minutes.
                </div>
                
                <p>Enter this code in the app to ${isNewUser ? 'complete your registration' : 'log in'}.</p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
                  If you didn't request this email, you can simply ignore it.
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 0;">© 2026 PRIMO BJJ - AKXE München</p>
                <p style="margin: 5px 0 0 0;">"Together we stand, united we fight"</p>
              </div>
            </div>
          </body>
        </html>
        `;
        
        await sendEmail(env, normalizedEmail, emailSubject, emailHtml);
        
        return jsonResponse({
          success: true, 
          message: 'Verification code sent to your email.',
          expiresIn: 900, // 15 Minuten in Sekunden
          isNewUser,
          status: isNewUser ? 'pending' : (existingUser?.status || 'active')
        });
        
      } catch (error) {
        console.error('Error sending verification email:', error);
        return jsonResponse({ 
          error: 'Failed to send email. Please try again.' 
        }, 500);
      }
    }
    
    // POST /api/auth/verify-token
    if (url.pathname === '/api/auth/verify-token' && request.method === 'POST') {
      try {
        const { email, code } = await request.json();
        
        if (!email || !code) {
          return jsonResponse({ error: 'Email and code required' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Prüfe Code in DB
        const verification = await env.DB.prepare(
          'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1'
        ).bind(normalizedEmail, code).first();
        
        if (!verification) {
          return jsonResponse({ 
            error: 'Invalid or expired code. Please request a new one.' 
          }, 401);
        }
        
        // Lösche verwendeten Code
        await env.DB.prepare(
          'DELETE FROM verification_codes WHERE email = ? AND code = ?'
        ).bind(normalizedEmail, code).run();
        
        // Hole User-Daten
        const user = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        if (!user) {
          return jsonResponse({ error: 'User not found' }, 404);
        }
        
        // Prüfe User-Status
        if (user.status === 'pending') {
          return jsonResponse({
            success: true,
            status: 'pending',
            message: 'Your account is pending approval. You will receive an email once your account is activated.',
            user: {
              email: user.email,
              status: user.status,
            }
          });
        }
        
        if (user.status === 'suspended') {
          return jsonResponse({ 
            error: 'Your account has been suspended. Please contact your professor.' 
          }, 403);
        }
        
        // Generiere JWT für aktive User
        const token = await generateJWT(normalizedEmail, env.JWT_SECRET, {
          status: user.status,
          isAdmin: user.is_admin === 1,
        });
        
        // Speichere Session
        await env.DB.prepare(
          'INSERT INTO sessions (email, token, created_at, expires_at) VALUES (?, ?, datetime("now"), datetime("now", "+30 days"))'
        ).bind(normalizedEmail, token).run();
        
        return jsonResponse({
          success: true,
          status: 'active',
          token,
          user: {
            email: user.email,
            validUntil: user.valid_until,
            paidMonths: user.paid_months,
            status: user.status,
            isAdmin: user.is_admin === 1,
          }
        });
        
      } catch (error) {
        console.error('Error verifying token:', error);
        return jsonResponse({ 
          error: 'Verification failed. Please try again.' 
        }, 500);
      }
    }
    
    // POST /api/auth/validate-session
    if (url.pathname === '/api/auth/validate-session' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'No token provided' }, 401);
        }
        
        const token = authHeader.substring(7);
        
        // Verifiziere JWT
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload) {
          return jsonResponse({ error: 'Invalid token' }, 401);
        }
        
        // Prüfe ob Session noch existiert
        const session = await env.DB.prepare(
          'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")'
        ).bind(token).first();
        
        if (!session) {
          return jsonResponse({ error: 'Session expired' }, 401);
        }
        
        // Hole User-Daten
        const user = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ? AND valid_until > datetime("now") AND status = "active"'
        ).bind(payload.email).first();
        
        if (!user) {
          return jsonResponse({ error: 'Access expired or account not active' }, 403);
        }
        
        return jsonResponse({
          valid: true,
          user: {
            email: user.email,
            validUntil: user.valid_until,
            paidMonths: user.paid_months,
            status: user.status,
            isAdmin: user.is_admin === 1,
          }
        });
        
      } catch (error) {
        console.error('Error validating session:', error);
        return jsonResponse({ error: 'Validation failed' }, 500);
      }
    }
    
    // GET /api/admin/pending-users (Admin only)
    if (url.pathname === '/api/admin/pending-users' && request.method === 'GET') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        // Hole alle pending Users
        const pendingUsers = await env.DB.prepare(
          'SELECT email, created_at, valid_until, paid_months FROM allowed_users WHERE status = "pending" ORDER BY created_at DESC'
        ).all();
        
        return jsonResponse({
          success: true,
          users: pendingUsers.results || [],
          count: pendingUsers.results?.length || 0,
        });
        
      } catch (error) {
        console.error('Error fetching pending users:', error);
        return jsonResponse({ error: 'Failed to fetch pending users' }, 500);
      }
    }
    
    // POST /api/admin/approve-user (Admin only)
    if (url.pathname === '/api/admin/approve-user' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        const { email, paidMonths, validUntil: customValidUntil } = await request.json();
        
        if (!email) {
          return jsonResponse({ error: 'Email required' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        let validUntil;
        let months;
        
        // Check if custom date is provided
        if (customValidUntil) {
          validUntil = new Date(customValidUntil);
          // Calculate months difference for display
          const now = new Date();
          months = Math.round((validUntil - now) / (1000 * 60 * 60 * 24 * 30));
        } else {
          // Use paidMonths
          months = paidMonths || 3; // Default 3 Monate
          validUntil = new Date();
          validUntil.setMonth(validUntil.getMonth() + months);
        }
        
        // Update User Status
        await env.DB.prepare(
          'UPDATE allowed_users SET status = "active", paid_months = ?, valid_until = ?, approved_by = ?, approved_at = datetime("now") WHERE email = ?'
        ).bind(months, validUntil.toISOString(), payload.email, normalizedEmail).run();
        
        // Erstelle Benachrichtigung
        await env.DB.prepare(
          'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind('user_approved', normalizedEmail, `User approved by ${payload.email}`).run();
        
        // Sende Approval-Email an User
        try {
          await sendEmail(
            env,
            normalizedEmail,
            '✅ Your PRIMO BJJ Account is Active!',
            `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                  .content { padding: 30px; background: white; }
                  .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                  .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
                  .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">🦅 PRIMO BJJ</div>
                    <p style="margin: 0; opacity: 0.9;">Technique Locker</p>
                  </div>
                  
                  <div class="content">
                    <h2 style="color: #1a1a1a; margin-top: 0;">🎉 Welcome to PRIMO BJJ!</h2>
                    <p>Great news! Your account has been approved and is now active.</p>
                    
                    <div class="info-box">
                      <strong>📅 Your Access Details:</strong><br>
                      <strong>Duration:</strong> ${months} month${months > 1 ? 's' : ''}<br>
                      <strong>Valid Until:</strong> ${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    
                    <p><strong>Ready to start training?</strong></p>
                    <p>Click the button below to log in to the PRIMO BJJ Technique Library:</p>
                    
                    <div style="text-align: center;">
                      <a href="https://primo-bjj.com" class="button">🔓 Log In Now</a>
                    </div>
                    
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
                      <strong>How to log in:</strong><br>
                      1. Click the button above or visit <a href="https://primo-bjj.com">primo-bjj.com</a><br>
                      2. Enter your email address<br>
                      3. Check your email for the verification code<br>
                      4. Enter the code and you're in!
                    </p>
                  </div>
                  
                  <div class="footer">
                    <p style="margin: 0;">© 2026 PRIMO BJJ - AKXE München</p>
                    <p style="margin: 5px 0 0 0;">"Together we stand, united we fight"</p>
                  </div>
                </div>
              </body>
            </html>
            `
          );
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
        
        return jsonResponse({
          success: true,
          message: `User ${normalizedEmail} approved successfully`,
        });
        
      } catch (error) {
        console.error('Error approving user:', error);
        return jsonResponse({ error: 'Failed to approve user' }, 500);
      }
    }
    
    // POST /api/admin/reject-user (Admin only)
    if (url.pathname === '/api/admin/reject-user' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        const { email } = await request.json();
        
        if (!email) {
          return jsonResponse({ error: 'Email required' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Lösche User
        await env.DB.prepare(
          'DELETE FROM allowed_users WHERE email = ? AND status = "pending"'
        ).bind(normalizedEmail).run();
        
        // Erstelle Benachrichtigung
        await env.DB.prepare(
          'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind('user_rejected', normalizedEmail, `User rejected by ${payload.email}`).run();
        
        return jsonResponse({
          success: true,
          message: `User ${normalizedEmail} rejected and removed`,
        });
        
      } catch (error) {
        console.error('Error rejecting user:', error);
        return jsonResponse({ error: 'Failed to reject user' }, 500);
      }
    }
    
    // GET /api/admin/notifications (Admin only)
    if (url.pathname === '/api/admin/notifications' && request.method === 'GET') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        // Hole ungelesene Benachrichtigungen
        const notifications = await env.DB.prepare(
          'SELECT * FROM admin_notifications WHERE read = 0 ORDER BY created_at DESC LIMIT 50'
        ).all();
        
        return jsonResponse({
          success: true,
          notifications: notifications.results || [],
          unreadCount: notifications.results?.length || 0,
        });
        
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return jsonResponse({ error: 'Failed to fetch notifications' }, 500);
      }
    }
    
    // GET /api/admin/all-users (Admin only)
    if (url.pathname === '/api/admin/all-users' && request.method === 'GET') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        // Hole alle Users gruppiert nach Status
        const allUsers = await env.DB.prepare(
          'SELECT email, status, valid_until, paid_months, added_date, created_at, approved_by, approved_at, is_admin FROM allowed_users ORDER BY created_at DESC'
        ).all();
        
        const users = allUsers.results || [];
        
        // Gruppiere nach Status
        const grouped = {
          pending: users.filter(u => u.status === 'pending'),
          active: users.filter(u => u.status === 'active'),
          suspended: users.filter(u => u.status === 'suspended'),
        };
        
        return jsonResponse({
          success: true,
          users: users,
          grouped: grouped,
          counts: {
            total: users.length,
            pending: grouped.pending.length,
            active: grouped.active.length,
            suspended: grouped.suspended.length,
          }
        });
        
      } catch (error) {
        console.error('Error fetching all users:', error);
        return jsonResponse({ error: 'Failed to fetch users' }, 500);
      }
    }
    
    // POST /api/admin/suspend-user (Admin only)
    if (url.pathname === '/api/admin/suspend-user' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        const { email, reason } = await request.json();
        
        if (!email) {
          return jsonResponse({ error: 'Email required' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Prüfe ob User existiert und nicht admin ist
        const user = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        if (!user) {
          return jsonResponse({ error: 'User not found' }, 404);
        }
        
        if (user.is_admin === 1) {
          return jsonResponse({ error: 'Cannot suspend admin users' }, 403);
        }
        
        // Update User Status zu suspended
        await env.DB.prepare(
          'UPDATE allowed_users SET status = "suspended" WHERE email = ?'
        ).bind(normalizedEmail).run();
        
        // Lösche alle aktiven Sessions
        await env.DB.prepare(
          'DELETE FROM sessions WHERE email = ?'
        ).bind(normalizedEmail).run();
        
        // Erstelle Benachrichtigung
        await env.DB.prepare(
          'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind('user_suspended', normalizedEmail, `User suspended by ${payload.email}${reason ? ': ' + reason : ''}`).run();
        
        // Sende Email an User
        try {
          await sendEmail(
            env,
            normalizedEmail,
            '⚠️ PRIMO BJJ Account Suspended',
            `
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Account Suspended</h2>
                <p>Your PRIMO BJJ account has been suspended.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>If you believe this is an error, please contact your professor.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">PRIMO BJJ - AKXE München</p>
              </body>
            </html>
            `
          );
        } catch (emailError) {
          console.error('Failed to send suspension email:', emailError);
        }
        
        return jsonResponse({
          success: true,
          message: `User ${normalizedEmail} suspended successfully`,
        });
        
      } catch (error) {
        console.error('Error suspending user:', error);
        return jsonResponse({ error: 'Failed to suspend user' }, 500);
      }
    }
    
    // POST /api/admin/reactivate-user (Admin only)
    if (url.pathname === '/api/admin/reactivate-user' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        const { email } = await request.json();
        
        if (!email) {
          return jsonResponse({ error: 'Email required' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Update User Status zu active
        await env.DB.prepare(
          'UPDATE allowed_users SET status = "active" WHERE email = ? AND status = "suspended"'
        ).bind(normalizedEmail).run();
        
        // Erstelle Benachrichtigung
        await env.DB.prepare(
          'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind('user_reactivated', normalizedEmail, `User reactivated by ${payload.email}`).run();
        
        // Sende Email an User
        try {
          await sendEmail(
            env,
            normalizedEmail,
            '✅ PRIMO BJJ Account Reactivated',
            `
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Account Reactivated</h2>
                <p>Good news! Your PRIMO BJJ account has been reactivated.</p>
                <p>You can now log in again and access the technique library.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">PRIMO BJJ - AKXE München</p>
              </body>
            </html>
            `
          );
        } catch (emailError) {
          console.error('Failed to send reactivation email:', emailError);
        }
        
        return jsonResponse({
          success: true,
          message: `User ${normalizedEmail} reactivated successfully`,
        });
        
      } catch (error) {
        console.error('Error reactivating user:', error);
        return jsonResponse({ error: 'Failed to reactivate user' }, 500);
      }
    }
    
    // POST /api/admin/extend-access (Admin only)
    if (url.pathname === '/api/admin/extend-access' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const token = authHeader.substring(7);
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload || !(await isAdmin(payload.email, env))) {
          return jsonResponse({ error: 'Admin access required' }, 403);
        }
        
        const { email, paidMonths, validUntil: customValidUntil } = await request.json();
        
        if (!email) {
          return jsonResponse({ error: 'Email required' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        let validUntil;
        let months;
        
        // Check if custom date is provided
        if (customValidUntil) {
          validUntil = new Date(customValidUntil);
          const now = new Date();
          months = Math.round((validUntil - now) / (1000 * 60 * 60 * 24 * 30));
        } else {
          months = paidMonths || 3;
          validUntil = new Date();
          validUntil.setMonth(validUntil.getMonth() + months);
        }
        
        // Update User
        await env.DB.prepare(
          'UPDATE allowed_users SET paid_months = ?, valid_until = ? WHERE email = ?'
        ).bind(months, validUntil.toISOString(), normalizedEmail).run();
        
        // Erstelle Benachrichtigung
        await env.DB.prepare(
          'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind('access_extended', normalizedEmail, `Access extended by ${payload.email} to ${validUntil.toISOString()}`).run();
        
        // Sende Email an User
        try {
          await sendEmail(
            env,
            normalizedEmail,
            '🎉 PRIMO BJJ Access Extended',
            `
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Access Extended</h2>
                <p>Great news! Your PRIMO BJJ access has been extended.</p>
                <p><strong>New Valid Until:</strong> ${validUntil.toLocaleDateString()}</p>
                <p><strong>Duration:</strong> ${months} month${months > 1 ? 's' : ''}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">PRIMO BJJ - AKXE München</p>
              </body>
            </html>
            `
          );
        } catch (emailError) {
          console.error('Failed to send extension email:', emailError);
        }
        
        return jsonResponse({
          success: true,
          message: `Access extended for ${normalizedEmail} until ${validUntil.toLocaleDateString()}`,
        });
        
      } catch (error) {
        console.error('Error extending access:', error);
        return jsonResponse({ error: 'Failed to extend access' }, 500);
      }
    }
    
    return jsonResponse({ error: 'Endpoint not found' }, 404);
  },
};
