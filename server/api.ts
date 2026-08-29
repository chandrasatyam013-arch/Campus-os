import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime';
import { BuiltInAgent } from '@copilotkit/runtime/v2';
import { createGroq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { db } from './db.js';
import { IntelligenceEngine } from './intelligence.js';
import { CareerEngine } from './careerEngine.js';
import { AcademicEngine } from './academicEngine.js';
import { RecommendationEngine } from './recommendationEngine.js';
import { User, DayOfWeek } from '../src/types/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();
const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY || 'missing_key'
});

// Import Rate Limiter
import rateLimit from 'express-rate-limit';

// Strict Rate Limiting for Auth Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per `window`
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ensure JWT secret is not hardcoded fallback in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: No JWT_SECRET provided in production. Sessions will be invalidated on restart.');
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// Auth Request Interface
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Health endpoint root (Vercel Requirement)
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: "campus-os-api"
  });
});

// Authentication Middleware
export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User session invalid. Please log in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
};

// Helper to sign JWT
const signToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// ==========================================
// 1. HEALTHCHECK
// ==========================================
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION
// ==========================================
router.post('/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await db.createUser(name.trim(), email.trim(), passwordHash);
    
    await db.seedUserWithRealisticData(user.id, false);

    const token = signToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registration successful',
      user,
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

router.post('/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const hash = await db.getPasswordHash(user.id);
    if (!hash || !bcrypt.compareSync(password, hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

router.post('/auth/demo', async (req, res) => {
  try {
    const demoEmail = 'demo@campusos.internal';
    let demoUser = await db.getUserByEmail(demoEmail);
    if (!demoUser) {
      const hash = bcrypt.hashSync('demo1234', 10);
      demoUser = await db.createUser('Alex Rivera', demoEmail, hash);
    }
    
    // Always reseed the data for demo logins to ensure a fresh state
    await db.seedUserWithRealisticData(demoUser.id, true);

    const token = signToken(demoUser.id);
    setAuthCookie(res, token);

    res.json({
      message: 'Demo session started',
      user: demoUser,
      token,
      isDemo: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start demo session.' });
  }
});

router.get('/auth/google', authLimiter, (req, res) => {
  const isAndroid = req.query.platform === 'android';
  const stateData = {
    state: crypto.randomBytes(16).toString('hex'),
    isAndroid
  };
  const stateString = Buffer.from(JSON.stringify(stateData)).toString('base64');
  res.cookie('oauth_state', stateString, { httpOnly: true, maxAge: 1000 * 60 * 10 }); // 10 minutes
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
  
  if (!clientId) {
    return res.status(500).send('Google OAuth is not configured.');
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&state=${stateData.state}&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedStateString = req.cookies.oauth_state;
    
    if (!state || !storedStateString) {
      return res.status(400).send('Invalid state parameter. Authentication failed.');
    }

    const stateData = JSON.parse(Buffer.from(storedStateString, 'base64').toString());
    
    if (state !== stateData.state) {
      return res.status(400).send('State mismatch. Authentication failed.');
    }
    
    res.clearCookie('oauth_state');
    
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Failed to get access token from Google:', tokenData);
      return res.status(400).send('Failed to authenticate with Google. Check server logs.');
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    
    const userData = await userRes.json();
    if (!userData || !userData.email) {
      return res.status(400).send('Failed to retrieve user profile from Google.');
    }
    
    const email = userData.email;
    const name = userData.name || email.split('@')[0];

    let user = await db.getUserByEmail(email);
    if (!user) {
      // Create a dummy hash since Google users don't have passwords
      const dummyHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10);
      user = await db.createUser(name, email, dummyHash);
      // Removed seedUserWithRealisticData to prevent Google users from seeing demo data
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);
    
    if (stateData.isAndroid) {
      // Use an HTML-based JS redirect to bypass Chrome Custom Tabs 302 restrictions on custom schemes
      const deepLink = `campusos://auth?token=${token}`;
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Authenticating...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #FAFAFA; color: #333; }
            .spinner { border: 3px solid rgba(0,0,0,0.1); width: 24px; height: 24px; border-radius: 50%; border-left-color: #000; animation: spin 1s linear infinite; margin-bottom: 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .btn { margin-top: 24px; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>Returning to Campus OS...</h2>
          <p>You have successfully authenticated.</p>
          <script>
            setTimeout(function() {
              window.location.href = "${deepLink}";
            }, 100);
          </script>
          <a href="${deepLink}" class="btn">Click here if nothing happens</a>
        </body>
        </html>
      `);
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.status(500).send('Internal Server Error during Google Sign-In.');
  }
});

router.get('/auth/me', authenticateUser, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

router.post('/auth/logout', async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
});

router.post('/auth/session', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    
    // Verify token
    jwt.verify(token, JWT_SECRET);
    setAuthCookie(res, token);
    res.json({ message: 'Session created' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.error('[FORGOT PASSWORD ERROR] Server email configuration is missing.');
      return res.status(500).json({ error: 'Server email configuration is missing.' });
    }

    const user = await db.getUserByEmail(email);
    // Generic response to prevent enumeration
    const successMsg = 'If an account exists for this email, a password reset link has been sent.';

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = bcrypt.hashSync(resetToken, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });

      const frontendUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_PORT === '465',
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Campus OS" <noreply@campusos.internal>',
          to: user.email,
          subject: 'Campus OS - Password Reset',
          html: `<p>You requested a password reset for your Campus OS account.</p><p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a><p>If you didn't request this, you can safely ignore this email. It expires in 1 hour.</p>`
        });
      } catch (emailErr) {
        console.error(`[EMAIL ERROR] Failed to send reset email to ${user.email}:`, emailErr);
        return res.status(500).json({ error: 'Failed to send password reset email. Please try again later.' });
      }
    }

    res.json({ message: successMsg });
  } catch (err: any) {
    console.error('[FORGOT PASSWORD ERROR]', err);
    res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
});

router.post('/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Find valid token
    const tokens = await prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } }
    });

    let matchedToken = null;
    for (const t of tokens) {
      if (bcrypt.compareSync(token, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Update password via direct Prisma query since DB abstraction might not have updatePassword
    await prisma.user.update({
      where: { id: matchedToken.userId },
      data: { passwordHash }
    });

    await prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: new Date() }
    });

    // Option: Invalidate existing sessions here if supported
    // Since sessions are JWTs, invalidation requires a token blacklist or updating a user timestamp.

    res.json({ message: 'Password reset successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});



// ==========================================
// 3. DASHBOARD (AGGREGATED COMMAND CENTER)
// ==========================================
export const getDashboardData = async (userId: string) => {
  const subjects = await db.getSubjects(userId);
  const attendanceRecords = await db.getAttendanceRecords(userId);
  const marks = await db.getMarks(userId);
  const assignments = await db.getAssignments(userId);
  const timetable = await db.getTimetable(userId);
  const events = await db.getAcademicEvents(userId);
  const settings = await db.getSettings(userId);
  const notifications = await db.getNotifications(userId);

  // Run Intelligence Engines
  const subjectAttendances = subjects.map(s =>
    IntelligenceEngine.calculateSubjectAttendance(s, attendanceRecords, settings.attendanceTarget, settings.minimumAttendance)
  );
  const overallAttendance = IntelligenceEngine.calculateOverallAttendance(subjects, attendanceRecords, settings);
  const subjectPerformances = AcademicEngine.evaluateAllSubjects(subjects, marks, settings.gradingSystem || '10_POINT');
  const academicData = AcademicEngine.evaluateSemesters(subjects, subjectPerformances);
  const estimatedSGPA = academicData.semesters.length > 0 ? academicData.semesters[academicData.semesters.length - 1].sgpa : null;
  const estimatedCGPA = academicData.cgpa;
  const academicRisk = AcademicEngine.calculateAcademicRisk(
    academicData.cgpa,
    subjectPerformances.filter(p => p.isWeakSubject).length,
    academicData.trend,
    settings.gradingSystem || '10_POINT'
  );
  
  const dismissedRecords = await prisma.dismissedRecommendation.findMany({
    where: { userId }
  });
  const dismissedIds = dismissedRecords.map((r: any) => r.recommendationId);

  const recommendations = RecommendationEngine.generateRecommendations(
    subjects,
    assignments,
    events,
    subjectAttendances,
    subjectPerformances,
    dismissedIds
  );
  const whatShouldIDoToday = IntelligenceEngine.generateWhatShouldIDoToday(recommendations, timetable, subjects);
  const weeklySummary = IntelligenceEngine.generateWeeklySummary(subjects, attendanceRecords, marks, assignments, events);

  // Today's classes
  const now = new Date();
  const currentDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()] as DayOfWeek;
  const classesToday = timetable
    .filter(t => t.day === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((t, idx) => {
      const sub = subjects.find(s => s.id === t.subjectId);
      return {
        id: t.id,
        subjectName: sub?.name || 'Unknown Subject',
        subjectCode: sub?.code || '---',
        color: sub?.color || '#6366f1',
        startTime: t.startTime,
        endTime: t.endTime,
        room: t.room,
        instructor: t.instructor,
        isNext: idx === 0
      };
    });

  const pendingAssignments = assignments.filter(a => a.status !== 'COMPLETED');
  const overdueAssignments = pendingAssignments.filter(a => new Date(a.deadline).getTime() < now.getTime());
  const riskSubjects = subjectAttendances.filter(a => a.riskLevel === 'HIGH_RISK' || a.riskLevel === 'CRITICAL');

  return {
    overallAttendance: {
      overallPercentage: overallAttendance.overallPercentage,
      totalAttended: overallAttendance.totalAttended,
      totalHeld: overallAttendance.totalClasses,
      isAboveTarget: overallAttendance.overallPercentage !== null ? overallAttendance.overallPercentage >= settings.attendanceTarget : true,
      isAboveMinimum: overallAttendance.overallPercentage !== null ? overallAttendance.overallPercentage >= settings.minimumAttendance : true,
      subjects: subjectAttendances
    },
    academicPerformance: {
      estimatedSGPA,
      estimatedCGPA,
      academicRisk,
      trend: academicData.trend,
      completedCredits: academicData.completedCredits,
      semesters: academicData.semesters,
      subjects: subjectPerformances
    },
    recommendations,
    pendingTasks: {
      pendingCount: pendingAssignments.length,
      urgentDueNext24Hours: pendingAssignments.filter(a => (new Date(a.deadline).getTime() - new Date().getTime()) < 24 * 3600 * 1000).length,
      dueThisWeekCount: pendingAssignments.filter(a => (new Date(a.deadline).getTime() - new Date().getTime()) < 7 * 24 * 3600 * 1000).length
    },
    riskAnalysis: {
      riskLevel: overallAttendance.overallRisk,
      inDangerCount: overallAttendance.criticalSubjectsCount,
      borderlineCount: overallAttendance.riskSubjectsCount,
      riskScore: overallAttendance.overallRisk === 'CRITICAL' ? 95 : overallAttendance.overallRisk === 'HIGH_RISK' ? 75 : 20
    },
    whatShouldIDoToday,
    todaySchedule: {
      dayOfWeek: currentDay,
      dateFormatted: now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      classes: classesToday
    },
    weeklySummary,
    subjects,
    recentNotifications: notifications.slice(0, 5)
  };
};

router.get('/dashboard', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await getDashboardData(req.user!.id);
    res.json({
      user: req.user,
      ...data
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch dashboard data.' });
  }
});

// ==========================================
// 4. SUBJECTS
// ==========================================
router.get('/subjects', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const subjects = await db.getSubjects(req.user!.id);
  res.json(subjects);
});

router.post('/subjects', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, code, credits, minimumAttendance, targetAttendance, color, instructor, room } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Subject name and code are required.' });
    }

    const subject = await db.createSubject(req.user!.id, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: Number(credits) || 3,
      minimumAttendance: Number(minimumAttendance) || 75,
      targetAttendance: Number(targetAttendance) || 85,
      color: color || '#6366f1',
      instructor,
      room
    });

    res.status(201).json(subject);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create subject.' });
  }
});

router.put('/subjects/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateSubject(req.user!.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Subject not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update subject.' });
  }
});

router.delete('/subjects/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteSubject(req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ message: 'Subject and associated records deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete subject.' });
  }
});

// ==========================================
// 5. ATTENDANCE & ATTENDANCE INTELLIGENCE
// ==========================================
router.get('/attendance', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  const records = await db.getAttendanceRecords(req.user!.id, subjectId);
  res.json(records);
});

router.post('/attendance', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { subjectId, date, status, classType, notes } = req.body;
    if (!subjectId || !date || !status) {
      return res.status(400).json({ error: 'Subject, date, and status are required.' });
    }

    const record = await db.createAttendanceRecord(req.user!.id, {
      subjectId,
      date,
      status,
      classType: classType || 'LECTURE',
      notes
    });

    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to log attendance.' });
  }
});

router.delete('/attendance/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteAttendanceRecord(req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Attendance record not found.' });
    res.json({ message: 'Attendance record deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete record.' });
  }
});

router.get('/attendance/:subject_id/analytics', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const subject = await db.getSubjectById(req.user!.id, req.params.subject_id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const records = await db.getAttendanceRecords(req.user!.id, req.params.subject_id);
    const settings = await db.getSettings(req.user!.id);
    const intel = IntelligenceEngine.calculateSubjectAttendance(subject, records, settings.attendanceTarget, settings.minimumAttendance);
    res.json(intel);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate analytics.' });
  }
});

// ==========================================
// 6. MARKS & ASSESSMENTS
// ==========================================
router.get('/marks', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const subjectId = req.query.subjectId as string | undefined;
  const marks = await db.getMarks(req.user!.id, subjectId);
  res.json(marks);
});

router.post('/marks', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { subjectId, assessmentName, assessmentType, obtainedMarks, maximumMarks, date, weightage, notes } = req.body;
    if (!subjectId || !assessmentName || obtainedMarks === undefined || !maximumMarks || !date) {
      return res.status(400).json({ error: 'All primary assessment fields are required.' });
    }

    if (Number(obtainedMarks) > Number(maximumMarks)) {
      return res.status(400).json({ error: 'Obtained marks cannot exceed maximum marks.' });
    }

    const mark = await db.createMark(req.user!.id, {
      subjectId,
      assessmentName: assessmentName.trim(),
      assessmentType: assessmentType || 'CT',
      obtainedMarks: Number(obtainedMarks),
      maximumMarks: Number(maximumMarks),
      date,
      weightage: weightage ? Number(weightage) : undefined,
      notes
    });

    res.status(201).json(mark);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create mark record.' });
  }
});

router.put('/marks/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateMark(req.user!.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Mark record not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update mark.' });
  }
});

router.delete('/marks/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteMark(req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Mark record not found.' });
    res.json({ message: 'Mark record deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete mark.' });
  }
});

// ==========================================
// 7. ASSIGNMENTS
// ==========================================
router.get('/assignments', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const assignments = await db.getAssignments(req.user!.id);
  res.json(assignments);
});

router.post('/assignments', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { subjectId, title, description, deadline, priority, status, estimatedHours } = req.body;
    if (!subjectId || !title || !deadline) {
      return res.status(400).json({ error: 'Subject, title, and deadline are required.' });
    }

    const assignment = await db.createAssignment(req.user!.id, {
      subjectId,
      title: title.trim(),
      description,
      deadline,
      priority: priority || 'MEDIUM',
      status: status || 'NOT_STARTED',
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined
    });

    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create assignment.' });
  }
});

router.put('/assignments/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateAssignment(req.user!.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Assignment not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update assignment.' });
  }
});

router.delete('/assignments/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteAssignment(req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Assignment not found.' });
    res.json({ message: 'Assignment deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete assignment.' });
  }
});

// ==========================================
// 8. TIMETABLE
// ==========================================
router.get('/timetable', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const timetable = await db.getTimetable(req.user!.id);
  res.json(timetable);
});

router.post('/timetable', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { subjectId, day, startTime, endTime, room, instructor, classType } = req.body;
    if (!subjectId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'Subject, day, start time, and end time are required.' });
    }

    const entry = await db.createTimetableEntry(req.user!.id, {
      subjectId,
      day,
      startTime,
      endTime,
      room,
      instructor,
      classType: classType || 'LECTURE'
    });

    res.status(201).json(entry);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create timetable entry.' });
  }
});

router.put('/timetable/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateTimetableEntry(req.user!.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Timetable entry not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update timetable entry.' });
  }
});

router.delete('/timetable/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteTimetableEntry(req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Timetable entry not found.' });
    res.json({ message: 'Timetable entry deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete timetable entry.' });
  }
});

// ==========================================
// 9. ACADEMIC CALENDAR & EVENTS
// ==========================================
router.get('/events', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const events = await db.getAcademicEvents(req.user!.id);
  res.json(events);
});

router.post('/events', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, type, date, startTime, endTime, description, subjectId, location } = req.body;
    if (!title || !type || !date) {
      return res.status(400).json({ error: 'Title, type, and date are required.' });
    }

    const event = await db.createAcademicEvent(req.user!.id, {
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      description,
      subjectId,
      location
    });

    res.status(201).json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create event.' });
  }
});

router.put('/events/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateAcademicEvent(req.user!.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Event not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update event.' });
  }
});

router.delete('/events/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteAcademicEvent(req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event.' });
  }
});

// ==========================================
// 10. ANALYTICS & RECOMMENDATIONS
// ==========================================
router.get('/analytics/attendance', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const subjects = await db.getSubjects(userId);
  const records = await db.getAttendanceRecords(userId);
  const settings = await db.getSettings(userId);

  const subjectIntel = subjects.map(s => 
    IntelligenceEngine.calculateSubjectAttendance(s, records, settings.attendanceTarget, settings.minimumAttendance)
  );
  const overall = IntelligenceEngine.calculateOverallAttendance(subjects, records, settings);

  res.json({
    overall,
    subjects: subjectIntel
  });
});

router.get('/analytics/performance', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const subjects = await db.getSubjects(userId);
  const marks = await db.getMarks(userId);

  const performances = IntelligenceEngine.calculateAllSubjectPerformances(subjects, marks);
  const weakestSubject = performances.find(p => p.isWeakSubject);

  res.json({
    performances,
    weakestSubject
  });
});

router.get('/analytics/sgpa', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const subjects = await db.getSubjects(userId);
  const marks = await db.getMarks(userId);

  const performances = IntelligenceEngine.calculateAllSubjectPerformances(subjects, marks);
  const sgpa = IntelligenceEngine.calculateSGPA(performances);

  res.json({
    sgpa,
    performances
  });
});

router.get('/recommendations', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const subjects = await db.getSubjects(userId);
  const attendanceRecords = await db.getAttendanceRecords(userId);
  const marks = await db.getMarks(userId);
  const assignments = await db.getAssignments(userId);
  const timetable = await db.getTimetable(userId);
  const events = await db.getAcademicEvents(userId);
  const settings = await db.getSettings(userId);

  const recommendations = IntelligenceEngine.generateRecommendations(
    subjects,
    attendanceRecords,
    marks,
    assignments,
    timetable,
    events,
    settings
  );

  res.json(recommendations);
});

// ==========================================
// 11. NOTIFICATIONS
// ==========================================
router.get('/notifications', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const list = await db.getNotifications(req.user!.id);
  res.json(list);
});

router.post('/notifications/:id/dismiss', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const dismissed = await db.dismissNotification(req.user!.id, req.params.id);
  res.json({ success: dismissed });
});

// ==========================================
// 11a. RECOMMENDATIONS
// ==========================================
router.get('/recommendations', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await getDashboardData(req.user!.id);
    res.json(data.recommendations);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch recommendations.' });
  }
});

router.post('/recommendations/:id/dismiss', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const recommendationId = req.params.id;
    await prisma.dismissedRecommendation.create({
      data: {
        userId: req.user!.id,
        recommendationId
      }
    }).catch(e => {
      // Ignore unique constraint violation if already dismissed
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dismiss recommendation.' });
  }
});

// ==========================================
// 12. SETTINGS
// ==========================================
router.get('/settings', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const settings = await db.getSettings(req.user!.id);
  res.json(settings);
});

router.put('/settings', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateSettings(req.user!.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings.' });
  }
});

// ==========================================
// 13. DATA EXPORT & IMPORT
// ==========================================
router.get('/data/export', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const data = await db.exportUserData(req.user!.id);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="campus_os_backup_${Date.now()}.json"`);
  res.json(data);
});

router.post('/data/import', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { subjects, attendance, marks, assignments } = req.body;
    const userId = req.user!.id;
    let importedSubjects = 0;
    let importedAttendance = 0;
    let importedMarks = 0;
    let importedAssignments = 0;

    const subjectMap: Record<string, string> = {}; // code or oldId -> newId

    if (Array.isArray(subjects)) {
      for (const s of subjects) {
        if (s.name && s.code) {
          const created = await db.createSubject(userId, {
            name: s.name,
            code: s.code,
            credits: Number(s.credits) || 3,
            minimumAttendance: Number(s.minimumAttendance) || 75,
            targetAttendance: Number(s.targetAttendance) || 85,
            color: s.color || '#6366f1',
            instructor: s.instructor,
            room: s.room
          });
          subjectMap[s.code.toUpperCase()] = created.id;
          if (s.id) subjectMap[s.id] = created.id;
          importedSubjects++;
        }
      }
    }

    if (Array.isArray(attendance)) {
      for (const a of attendance) {
        const subId = subjectMap[a.subjectCode?.toUpperCase()] || subjectMap[a.subjectId] || a.subjectId;
        if (subId && a.date && a.status) {
          await db.createAttendanceRecord(userId, {
            subjectId: subId,
            date: a.date,
            status: a.status,
            classType: a.classType || 'LECTURE',
            notes: a.notes
          });
          importedAttendance++;
        }
      }
    }

    if (Array.isArray(marks)) {
      for (const m of marks) {
        const subId = subjectMap[m.subjectCode?.toUpperCase()] || subjectMap[m.subjectId] || m.subjectId;
        if (subId && m.assessmentName && m.obtainedMarks !== undefined && m.maximumMarks) {
          await db.createMark(userId, {
            subjectId: subId,
            assessmentName: m.assessmentName,
            assessmentType: m.assessmentType || 'CT',
            obtainedMarks: Number(m.obtainedMarks),
            maximumMarks: Number(m.maximumMarks),
            date: m.date || new Date().toISOString().split('T')[0]
          });
          importedMarks++;
        }
      }
    }

    if (Array.isArray(assignments)) {
      for (const asgn of assignments) {
        const subId = subjectMap[asgn.subjectCode?.toUpperCase()] || subjectMap[asgn.subjectId] || asgn.subjectId;
        if (subId && asgn.title && asgn.deadline) {
          await db.createAssignment(userId, {
            subjectId: subId,
            title: asgn.title,
            description: asgn.description,
            deadline: asgn.deadline,
            priority: asgn.priority || 'MEDIUM',
            status: asgn.status || 'NOT_STARTED'
          });
          importedAssignments++;
        }
      }
    }

    res.json({
      message: 'Data import completed successfully',
      stats: {
        importedSubjects,
        importedAttendance,
        importedMarks,
        importedAssignments
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid import payload format.' });
  }
});

// ==========================================
// 14. ACCOUNT DELETION (STRICT CONFIRMATION)
// ==========================================
router.delete('/account', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: 'Please provide exact confirmation string "DELETE" to permanently purge your account.' });
    }

    await db.deleteUserAccount(req.user!.id);
    res.clearCookie('token');
    res.json({ message: 'Account and all associated academic records deleted permanently.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete account.' });
  }
});

// ==========================================
// 15. CAREER ROADMAP DESIGNER
// ==========================================

router.get('/career/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        recommendations: { orderBy: { rank: 'asc' } }
      }
    });
    
    if (!profile) {
      return res.json({ profile: null, roadmap: null });
    }

    const roadmap = await prisma.careerRoadmap.findFirst({
      where: { userId: req.user!.id },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: true
          }
        }
      }
    });

    res.json({ profile, roadmap });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch career profile.' });
  }
});

router.post('/career/assess', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { targetCareer, interests, preferredSubjects, strengths, workPreferences, careerPreferences } = req.body;
    
    let profile = await prisma.careerProfile.findUnique({ where: { userId: req.user!.id } });
    if (profile) {
      profile = await prisma.careerProfile.update({
        where: { id: profile.id },
        data: { targetCareer, interests, preferredSubjects, strengths, workPreferences, careerPreferences }
      });
      // clear old recommendations
      await prisma.careerRecommendation.deleteMany({ where: { profileId: profile.id } });
    } else {
      profile = await prisma.careerProfile.create({
        data: { userId: req.user!.id, targetCareer, interests, preferredSubjects, strengths, workPreferences, careerPreferences }
      });
    }

    // Run Engine
    const recommendations = CareerEngine.calculateCareerFit(profile);
    
    // Save Recommendations with AI Explanation
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      let aiExplanation = rec.explanation; // fallback

      try {
        const { text } = await generateText({
          model: groqProvider('openai/gpt-oss-20b'),
          prompt: `You are the Campus OS Career Advisor. The user is assessing their fit for the career: ${rec.career}.
The deterministic system calculated a match score of ${rec.compatibilityScore}%.
The raw match reasons are: ${rec.explanation}
User profile strengths: ${strengths.join(', ')}
User profile interests: ${interests.join(', ')}

Explain in exactly 2-3 short, encouraging sentences why this career is a good match based on their specific strengths and interests. Do NOT mention the exact numerical score, just explain why it fits.`
        });
        if (text) aiExplanation = text;
      } catch (e) {
        console.error('Failed to generate AI explanation:', e);
      }

      await prisma.careerRecommendation.create({
        data: {
          profileId: profile.id,
          career: rec.career,
          compatibilityScore: rec.compatibilityScore,
          explanation: aiExplanation,
          rank: i + 1
        }
      });
    }

    res.json({ message: 'Assessment complete', recommendations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process assessment.' });
  }
});

router.post('/career/target', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { careerName } = req.body;
    const userId = req.user!.id;
    
    let profile = await prisma.careerProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found. Take assessment first.' });

    // Update target
    await prisma.careerProfile.update({
      where: { id: profile.id },
      data: { targetCareer: careerName }
    });

    // Delete existing roadmap if any
    await prisma.careerRoadmap.deleteMany({ where: { userId } });

    // Generate Roadmap
    const subjects = await db.getSubjects(userId);
    const marks = await db.getMarks(userId);
    const generatedPhases = CareerEngine.generateRoadmap(careerName, subjects, marks);

    const roadmap = await prisma.careerRoadmap.create({
      data: {
        userId,
        targetCareer: careerName,
        currentLevel: 'Beginner',
        phases: {
          create: generatedPhases.map(p => ({
            title: p.title,
            description: p.description,
            order: p.order,
            tasks: {
              create: p.tasks.map((t: any) => ({
                title: t.title,
                description: t.description,
                priority: t.priority,
                status: t.status
              }))
            }
          }))
        }
      },
      include: {
        phases: {
          include: { tasks: true }
        }
      }
    });

    res.json({ message: 'Roadmap generated', roadmap });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate roadmap.' });
  }
});

// ==========================================
// 16. AI ASSISTANT (NATIVE)
// ==========================================

router.post('/ai/chat', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'missing_key') {
      return res.status(503).json({ error: 'AI service is not configured' });
    }

    const systemPrompt = `You are the user's personal Campus OS academic assistant/copilot. 
Your primary goal is to use the available secure backend tools to answer personal academic questions (e.g. attendance, SGPA, grades, subjects, assignments).
CRITICAL RULES:
1. ALWAYS use the provided tools to retrieve data FIRST before answering. 
2. NEVER ask the user to manually provide their subjects, attendance, marks, assignments, timetable, user ID, or account ID. The tools will securely fetch this using their session automatically.
3. Use the 'getMyAcademicProfile' tool to fetch the user's canonical academic data, which perfectly matches the dashboard.
4. If the user asks about their career, what career suits them, or their roadmap progress, ALWAYS call the 'getMyCareerRoadmap' tool first.
5. If the user asks "What should I focus on today?", "What are my priorities?", or "What should I do?", ALWAYS call the 'getMyRecommendations' tool to fetch the deterministic priority list.
6. If a tool returns no data or insufficient data for a question, respond honestly. Do NOT invent or estimate data.
7. Do NOT over-promise or make up numbers. Use only the PostgreSQL data returned by the tools.
8. Always identify yourself as the Campus OS academic assistant/copilot, not a generic AI.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const result = await generateText({
      model: groqProvider('llama3-8b-8192'),
      messages,
      maxSteps: 5,
      tools: {
        getMyAcademicProfile: tool({
          description: "Gets the comprehensive, canonical academic profile for the current authenticated student. Includes attendance (overall and per-subject), performance (SGPA and per-subject), pending assignments, today's schedule, and academic risk analysis. Takes NO parameters.",
          parameters: z.object({}),
          execute: async () => {
            return await getDashboardData(userId);
          }
        }),
        getMyCareerRoadmap: tool({
          description: "Retrieve the student's career profile and active roadmap",
          parameters: z.object({}),
          execute: async () => {
            const profile = await prisma.careerProfile.findUnique({
              where: { userId },
              include: { recommendations: true }
            });
            const roadmaps = await prisma.careerRoadmap.findMany({
              where: { userId, status: "ACTIVE" },
              include: { phases: { include: { tasks: true } } }
            });
            return { profile, roadmaps };
          }
        }),
        getMyAcademicSummary: tool({
          description: "Retrieve the student's deterministic academic performance (SGPA, CGPA, trends, semesters)",
          parameters: z.object({}),
          execute: async () => {
            const data = await getDashboardData(userId);
            return {
              estimatedSGPA: data.academicPerformance.estimatedSGPA,
              estimatedCGPA: data.academicPerformance.estimatedCGPA,
              academicRisk: data.academicPerformance.academicRisk,
              trend: data.academicPerformance.trend,
              completedCredits: data.academicPerformance.completedCredits,
              strongSubjects: data.academicPerformance.subjects.filter((s: any) => !s.isWeakSubject && s.assessmentsCount > 0),
              weakSubjects: data.academicPerformance.subjects.filter((s: any) => s.isWeakSubject),
              semesters: data.academicPerformance.semesters
            };
          }
        }),
        getMyTargetSGPA: tool({
          description: "Calculate what SGPA/CGPA the student needs in remaining credits to hit a target. Provide targetCGPA and remainingCredits as parameters.",
          parameters: z.object({
            targetCGPA: z.number().describe("The CGPA the user wants to achieve"),
            remainingCredits: z.number().describe("The number of credits left in their degree/semester")
          }),
          execute: async ({ targetCGPA, remainingCredits }) => {
            const data = await getDashboardData(userId);
            const settings = await db.getSettings(userId);
            return AcademicEngine.calculateTarget(
              targetCGPA, 
              data.academicPerformance.completedCredits, 
              data.academicPerformance.estimatedCGPA, 
              remainingCredits, 
              settings.gradingSystem
            );
          }
        }),
        getMyRecommendations: tool({
          description: "Retrieve the student's deterministic, prioritized smart recommendations (what should I do today/focus on). This engine merges attendance, assignment, academic, and career risks. Takes NO parameters.",
          parameters: z.object({}),
          execute: async () => {
            const data = await getDashboardData(userId);
            return data.recommendations;
          }
        })
      }
    });

    res.json({ message: result.text });
  } catch (err: any) {
    console.error('[AI ERROR]', err);
    res.status(502).json({ error: 'AI service temporarily unavailable' });
  }
});

export default router;
