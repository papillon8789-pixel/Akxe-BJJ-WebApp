/**
 * Cloudflare Worker für Email-Verifizierung
 *
 * Endpoints:
 * - POST /api/auth/request-verification - Sendet Verifizierungs-Email
 * - POST /api/auth/verify-token - Verifiziert Token und gibt JWT zurück
 * - POST /api/auth/validate-session - Validiert JWT Session
 */

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

// Generiere JWT Token (vereinfacht - in Produktion JWT Library verwenden)
async function generateJWT(email, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 Tage
    iat: Math.floor(Date.now() / 1000),
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // POST /api/auth/request-verification
    if (url.pathname === '/api/auth/request-verification' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        
        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Ungültige Email-Adresse' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Prüfe ob Email in allowed users ist
        const allowedUser = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ? AND valid_until > datetime("now")'
        ).bind(normalizedEmail).first();
        
        if (!allowedUser) {
          return jsonResponse({ 
            error: 'Email nicht autorisiert. Bitte kontaktiere deinen Professor.' 
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
        
        // Sende Email mit Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PRIMO BJJ <noreply@primo-bjj.com>',
            to: [normalizedEmail],
            subject: 'Dein PRIMO BJJ Verifizierungscode',
            html: `
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
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">🦅 PRIMO BJJ</div>
                    <p style="margin: 0; opacity: 0.9;">Technique Locker</p>
                  </div>
                  
                  <div class="content">
                    <h2 style="color: #1a1a1a; margin-top: 0;">Willkommen zurück!</h2>
                    <p>Du hast Zugang zur PRIMO BJJ Technique Library angefordert.</p>
                    
                    <p>Dein Verifizierungscode lautet:</p>
                    
                    <div class="code-box">
                      <div class="code">${verificationCode}</div>
                    </div>
                    
                    <div class="warning">
                      <strong>⚠️ Wichtig:</strong> Dieser Code ist nur 15 Minuten gültig.
                    </div>
                    
                    <p>Gib diesen Code in der App ein, um dich anzumelden.</p>
                    
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
                      Falls du diese Email nicht angefordert hast, kannst du sie einfach ignorieren.
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
          })
        });
        
        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Resend API error:', errorData);
          throw new Error('Failed to send email');
        }
        
        return jsonResponse({
          success: true, 
          message: 'Verifizierungscode wurde an deine Email gesendet.',
          expiresIn: 900 // 15 Minuten in Sekunden
        });
        
      } catch (error) {
        console.error('Error sending verification email:', error);
        return jsonResponse({ 
          error: 'Fehler beim Senden der Email. Bitte versuche es erneut.' 
        }, 500);
      }
    }
    
    // POST /api/auth/verify-token
    if (url.pathname === '/api/auth/verify-token' && request.method === 'POST') {
      try {
        const { email, code } = await request.json();
        
        if (!email || !code) {
          return jsonResponse({ error: 'Email und Code erforderlich' }, 400);
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Prüfe Code in DB
        const verification = await env.DB.prepare(
          'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1'
        ).bind(normalizedEmail, code).first();
        
        if (!verification) {
          return jsonResponse({ 
            error: 'Ungültiger oder abgelaufener Code. Bitte fordere einen neuen an.' 
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
        
        // Generiere JWT
        const token = await generateJWT(normalizedEmail, env.JWT_SECRET);
        
        // Speichere Session
        await env.DB.prepare(
          'INSERT INTO sessions (email, token, created_at, expires_at) VALUES (?, ?, datetime("now"), datetime("now", "+30 days"))'
        ).bind(normalizedEmail, token).run();
        
        return jsonResponse({
          success: true,
          token,
          user: {
            email: user.email,
            validUntil: user.valid_until,
            paidMonths: user.paid_months,
          }
        });
        
      } catch (error) {
        console.error('Error verifying token:', error);
        return jsonResponse({ 
          error: 'Fehler bei der Verifizierung. Bitte versuche es erneut.' 
        }, 500);
      }
    }
    
    // POST /api/auth/validate-session
    if (url.pathname === '/api/auth/validate-session' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse({ error: 'Kein Token vorhanden' }, 401);
        }
        
        const token = authHeader.substring(7);
        
        // Verifiziere JWT
        const payload = await verifyJWT(token, env.JWT_SECRET);
        
        if (!payload) {
          return jsonResponse({ error: 'Ungültiger Token' }, 401);
        }
        
        // Prüfe ob Session noch existiert
        const session = await env.DB.prepare(
          'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")'
        ).bind(token).first();
        
        if (!session) {
          return jsonResponse({ error: 'Session abgelaufen' }, 401);
        }
        
        // Hole User-Daten
        const user = await env.DB.prepare(
          'SELECT * FROM allowed_users WHERE email = ? AND valid_until > datetime("now")'
        ).bind(payload.email).first();
        
        if (!user) {
          return jsonResponse({ error: 'Zugang abgelaufen' }, 403);
        }
        
        return jsonResponse({
          valid: true,
          user: {
            email: user.email,
            validUntil: user.valid_until,
            paidMonths: user.paid_months,
          }
        });
        
      } catch (error) {
        console.error('Error validating session:', error);
        return jsonResponse({ error: 'Fehler bei der Validierung' }, 500);
      }
    }
    
    return jsonResponse({ error: 'Endpoint nicht gefunden' }, 404);
  },
};
