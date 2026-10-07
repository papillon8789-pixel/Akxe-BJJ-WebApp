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
    exp: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 Tage
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
        const { email, name } = await request.json();
        
        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Invalid email address' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        const userName = name ? name.trim() : null;
        
        // Prüfe ob Email bereits existiert
        const existingUser = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        let isNewUser = false;
        
        if (!existingUser) {
          // Neuer User - erstelle pending Account (OHNE Admin-Email zu senden)
          isNewUser = true;
          const validUntil = new Date();
          validUntil.setMonth(validUntil.getMonth() + 1); // 1 Monat Trial
          const addedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          
          await env.DB.prepare(
            'INSERT INTO allowed_users (email, valid_until, paid_months, status, added_date, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))'
          ).bind(normalizedEmail, validUntil.toISOString(), 1, 'pending', addedDate).run();
          
          // Admin-Email wird NICHT hier gesendet, sondern erst nach Code-Verifizierung
        } else if (existingUser.status === 'suspended') {
          return jsonResponse({ 
            error: 'Your account has been suspended. Please contact your professor.' 
          }, 403);
        }
        
        // Generiere Verifizierungscode
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minuten
        
        // Speichere Code in DB (mit Name als JSON in metadata falls vorhanden)
        const metadata = userName ? JSON.stringify({ name: userName, isNewUser }) : null;
        await env.DB.prepare(
          'INSERT INTO verification_codes (email, code, expires_at, metadata, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        ).bind(normalizedEmail, verificationCode, expiresAt.toISOString(), metadata).run();
        
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
          // Neuer User hat Code verifiziert - JETZT Admin-Email senden
          // Hole Name aus verification metadata
          let userName = null;
          let isNewRegistration = false;
          if (verification.metadata) {
            try {
              const meta = JSON.parse(verification.metadata);
              userName = meta.name;
              isNewRegistration = meta.isNewUser;
            } catch (e) {
              // Ignore parsing errors
            }
          }
          
          // Sende Admin-Benachrichtigung NUR wenn es eine neue Registrierung ist
          if (isNewRegistration) {
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
                    <p>A new user has registered for PRIMO BJJ Technique Library and verified their email:</p>
                    ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ''}
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
              // Continue anyway - user verification is more important
            }
          }
          
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
          'INSERT INTO sessions (email, token, created_at, expires_at) VALUES (?, ?, datetime("now"), datetime("now", "+60 days"))'
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
    
    // GET /api/auth/check-status - Check user status without sending code
    if (url.pathname === '/api/auth/check-status' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        
        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Invalid email address' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check if user exists
        const user = await env.DB.prepare(
          'SELECT email, status, valid_until, paid_months, is_admin FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        if (!user) {
          return jsonResponse({
            exists: false,
            status: 'not_found'
          });
        }
        
        return jsonResponse({
          exists: true,
          status: user.status,
          user: user.status === 'active' ? {
            email: user.email,
            validUntil: user.valid_until,
            paidMonths: user.paid_months,
            isAdmin: user.is_admin === 1,
          } : null
        });
        
      } catch (error) {
        console.error('Error checking status:', error);
        return jsonResponse({ error: 'Failed to check status' }, 500);
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
        
        // Generiere Magic Link Token (gültig für 24 Stunden)
        const magicToken = await generateJWT(normalizedEmail, env.JWT_SECRET, {
          type: 'magic_link',
          status: 'active',
          isAdmin: false,
        });
        
        // Speichere Magic Link Token
        await env.DB.prepare(
          'INSERT INTO sessions (email, token, created_at, expires_at) VALUES (?, ?, datetime("now"), datetime("now", "+1 day"))'
        ).bind(normalizedEmail, magicToken).run();
        
        // Frontend URL (anpassen an deine Domain)
        const frontendUrl = env.FRONTEND_URL || 'https://primo-bjj.com';
        const magicLink = `${frontendUrl}?magic=${encodeURIComponent(magicToken)}`;
        
        // Sende Approval-Email mit Magic Link an User
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
                  .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
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
                    <p>Click the button below to log in directly - no code needed!</p>
                    
                    <div style="text-align: center;">
                      <a href="${magicLink}" class="button">🔓 Log In Now</a>
                    </div>
                    
                    <div class="warning-box">
                      <strong>⚠️ Important:</strong> This login link is valid for 24 hours and can only be used once.
                    </div>
                    
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
                      <strong>For future logins:</strong><br>
                      1. Visit <a href="${frontendUrl}">${frontendUrl.replace('https://', '')}</a><br>
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
    
    // POST /api/admin/delete-user (Admin only) - Permanent deletion
    if (url.pathname === '/api/admin/delete-user' && request.method === 'POST') {
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
        
        // Prüfe ob User existiert und nicht admin ist
        const user = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        if (!user) {
          return jsonResponse({ error: 'User not found' }, 404);
        }
        
        if (user.is_admin === 1) {
          return jsonResponse({ error: 'Cannot delete admin users' }, 403);
        }
        
        // Lösche alle Sessions des Users
        await env.DB.prepare(
          'DELETE FROM sessions WHERE email = ?'
        ).bind(normalizedEmail).run();
        
        // Lösche alle Verification Codes
        await env.DB.prepare(
          'DELETE FROM verification_codes WHERE email = ?'
        ).bind(normalizedEmail).run();
        
        // Lösche User permanent
        await env.DB.prepare(
          'DELETE FROM allowed_users WHERE email = ?'
        ).bind(normalizedEmail).run();
        
        // Erstelle Benachrichtigung
        await env.DB.prepare(
          'INSERT INTO admin_notifications (type, user_email, message, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind('user_deleted', normalizedEmail, `User permanently deleted by ${payload.email}`).run();
        
        return jsonResponse({
          success: true,
          message: `User ${normalizedEmail} permanently deleted`,
        });
        
      } catch (error) {
        console.error('Error deleting user:', error);
        return jsonResponse({ error: 'Failed to delete user' }, 500);
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
    
    // GET /api/auth/magic-login (Magic Link Login)
    if (url.pathname === '/api/auth/magic-login' && request.method === 'GET') {
      try {
        const magicToken = url.searchParams.get('token');
        
        if (!magicToken) {
          return jsonResponse({ error: 'No magic token provided' }, 400);
        }
        
        // Verifiziere Magic Token
        const payload = await verifyJWT(magicToken, env.JWT_SECRET);
        
        if (!payload || payload.type !== 'magic_link') {
          return jsonResponse({ error: 'Invalid magic link' }, 401);
        }
        
        // Prüfe ob Session noch existiert (Magic Link nur einmal verwendbar)
        const session = await env.DB.prepare(
          'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")'
        ).bind(magicToken).first();
        
        if (!session) {
          return jsonResponse({ error: 'Magic link expired or already used' }, 401);
        }
        
        // Lösche Magic Link Session (einmalige Verwendung)
        await env.DB.prepare(
          'DELETE FROM sessions WHERE token = ?'
        ).bind(magicToken).run();
        
        // Hole User-Daten
        const user = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ? AND valid_until > datetime("now") AND status = "active"'
        ).bind(payload.email).first();
        
        if (!user) {
          return jsonResponse({ error: 'User not found or access expired' }, 403);
        }
        
        // Generiere neuen regulären JWT Token für die Session
        const newToken = await generateJWT(payload.email, env.JWT_SECRET, {
          status: user.status,
          isAdmin: user.is_admin === 1,
        });
        
        // Speichere neue Session
        await env.DB.prepare(
          'INSERT INTO sessions (email, token, created_at, expires_at) VALUES (?, ?, datetime("now"), datetime("now", "+60 days"))'
        ).bind(payload.email, newToken).run();
        
        return jsonResponse({
          success: true,
          status: 'active',
          token: newToken,
          user: {
            email: user.email,
            validUntil: user.valid_until,
            paidMonths: user.paid_months,
            status: user.status,
            isAdmin: user.is_admin === 1,
          }
        });
        
      } catch (error) {
        console.error('Error with magic login:', error);
        return jsonResponse({ error: 'Magic login failed' }, 500);
      }
    }
    
    // POST /api/analytics/track - Track analytics event
    if (url.pathname === '/api/analytics/track' && request.method === 'POST') {
      try {
        const { eventType, userEmail, metadata } = await request.json();
        
        if (!eventType || !userEmail) {
          return jsonResponse({ error: 'Event type and user email required' }, 400);
        }
        
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const normalizedEmail = userEmail.toLowerCase().trim();
        
        // Validate event type
        const validEventTypes = ['login', 'app_open', 'video_view', 'category_view'];
        if (!validEventTypes.includes(eventType)) {
          return jsonResponse({ error: 'Invalid event type' }, 400);
        }
        
        // For app_open events, check if user already has an event today (only track once per day)
        if (eventType === 'app_open') {
          const existingEvent = await env.DB.prepare(
            'SELECT id FROM analytics_events WHERE event_type = ? AND user_email = ? AND date = ?'
          ).bind(eventType, normalizedEmail, date).first();
          
          if (existingEvent) {
            // Already tracked today, don't insert duplicate
            return jsonResponse({ success: true, message: 'Already tracked today' });
          }
        }
        
        // Insert analytics event with metadata as JSON string
        await env.DB.prepare(
          'INSERT INTO analytics_events (event_type, user_email, date, metadata) VALUES (?, ?, ?, ?)'
        ).bind(eventType, normalizedEmail, date, metadata ? JSON.stringify(metadata) : null).run();
        
        return jsonResponse({ success: true });
        
      } catch (error) {
        console.error('Error tracking analytics:', error);
        // Don't fail the request if analytics fails
        return jsonResponse({ success: true });
      }
    }
    
    // GET /api/admin/analytics - Get analytics data (Admin only)
    if (url.pathname === '/api/admin/analytics' && request.method === 'GET') {
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
        
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Get active users per day for last 7 days (based on app_open events)
        const activeUsersPerDay = await env.DB.prepare(`
          SELECT date, COUNT(DISTINCT user_email) as count
          FROM analytics_events
          WHERE event_type = 'app_open' AND date >= ?
          GROUP BY date
          ORDER BY date ASC
        `).bind(sevenDaysAgo).all();
        
        // Get active users today (app_open events)
        const activeToday = await env.DB.prepare(`
          SELECT COUNT(DISTINCT user_email) as count
          FROM analytics_events
          WHERE event_type = 'app_open' AND date = ?
        `).bind(today).all();
        
        // Get active users this week
        const activeThisWeek = await env.DB.prepare(`
          SELECT COUNT(DISTINCT user_email) as count
          FROM analytics_events
          WHERE event_type = 'app_open' AND date >= ?
        `).bind(sevenDaysAgo).all();
        
        // Get total video views today
        const videoViewsToday = await env.DB.prepare(`
          SELECT COUNT(*) as count
          FROM analytics_events
          WHERE event_type = 'video_view' AND date = ?
        `).bind(today).all();
        
        // Get total users count
        const totalUsers = await env.DB.prepare(`
          SELECT COUNT(*) as count
          FROM allowed_users
          WHERE status = 'active'
        `).all();
        
        // Get most viewed videos (last 7 days)
        const mostViewedVideos = await env.DB.prepare(`
          SELECT metadata, COUNT(*) as count
          FROM analytics_events
          WHERE event_type = 'video_view' AND date >= ? AND metadata IS NOT NULL
          GROUP BY metadata
          ORDER BY count DESC
          LIMIT 5
        `).bind(sevenDaysAgo).all();
        
        // Parse video metadata
        const topVideos = (mostViewedVideos.results || []).map(row => {
          try {
            const meta = JSON.parse(row.metadata);
            return {
              videoId: meta.videoId,
              videoName: meta.videoName,
              category: meta.category,
              views: row.count
            };
          } catch (e) {
            return null;
          }
        }).filter(v => v !== null);
        
        // Get most viewed categories (last 7 days)
        const mostViewedCategories = await env.DB.prepare(`
          SELECT metadata, COUNT(*) as count
          FROM analytics_events
          WHERE event_type = 'category_view' AND date >= ? AND metadata IS NOT NULL
          GROUP BY metadata
          ORDER BY count DESC
          LIMIT 5
        `).bind(sevenDaysAgo).all();
        
        // Parse category metadata
        const topCategories = (mostViewedCategories.results || []).map(row => {
          try {
            const meta = JSON.parse(row.metadata);
            return {
              category: meta.category,
              views: row.count
            };
          } catch (e) {
            return null;
          }
        }).filter(c => c !== null);
        
        return jsonResponse({
          success: true,
          activeToday: activeToday.results[0]?.count || 0,
          activeThisWeek: activeThisWeek.results[0]?.count || 0,
          videoViewsToday: videoViewsToday.results[0]?.count || 0,
          totalUsers: totalUsers.results[0]?.count || 0,
          activeUsersPerDay: activeUsersPerDay.results || [],
          topVideos: topVideos,
          topCategories: topCategories,
        });
        
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return jsonResponse({ error: 'Failed to fetch analytics' }, 500);
      }
    }
    
    return jsonResponse({ error: 'Endpoint not found' }, 404);
  },
};
