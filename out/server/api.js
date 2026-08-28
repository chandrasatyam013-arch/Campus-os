import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint } from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { db } from "./db";
import { IntelligenceEngine } from "./intelligence";
import { CareerEngine } from "./careerEngine";
import { AcademicEngine } from "./academicEngine";
import { RecommendationEngine } from "./recommendationEngine";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();
const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY || "missing_key"
});
import rateLimit from "express-rate-limit";
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // Limit each IP to 20 auth requests per `window`
  message: { error: "Too many login attempts from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false
});
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("\u26A0\uFE0F WARNING: No JWT_SECRET provided in production. Sessions will be invalidated on restart.");
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "campus-os-api"
  });
});
const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User session invalid. Please log in again." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid token." });
  }
};
const signToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
};
router.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    database: "connected",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/auth/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await db.createUser(name.trim(), email.trim(), passwordHash);
    await db.seedUserWithRealisticData(user.id, false);
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.status(201).json({
      message: "Registration successful",
      user,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Registration failed." });
  }
});
router.post("/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const hash = await db.getPasswordHash(user.id);
    if (!hash || !bcrypt.compareSync(password, hash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.json({
      message: "Login successful",
      user,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Login failed." });
  }
});
router.post("/auth/demo", async (req, res) => {
  try {
    const demoEmail = "demo@campusos.internal";
    let demoUser = await db.getUserByEmail(demoEmail);
    if (!demoUser) {
      const hash = bcrypt.hashSync("demo1234", 10);
      demoUser = await db.createUser("Alex Rivera", demoEmail, hash);
      await db.seedUserWithRealisticData(demoUser.id, true);
    }
    const token = signToken(demoUser.id);
    setAuthCookie(res, token);
    res.json({
      message: "Demo session started",
      user: demoUser,
      token,
      isDemo: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to start demo session." });
  }
});
router.get("/auth/google", authLimiter, (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, { httpOnly: true, maxAge: 1e3 * 60 * 10 });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";
  if (!clientId) {
    return res.status(500).send("Google OAuth is not configured.");
  }
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&state=${state}`;
  res.redirect(googleAuthUrl);
});
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;
    if (!state || state !== storedState) {
      return res.status(400).send("Invalid state parameter. Authentication failed.");
    }
    res.clearCookie("oauth_state");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
        grant_type: "authorization_code"
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Failed to get access token from Google:", tokenData);
      return res.status(400).send("Failed to authenticate with Google. Check server logs.");
    }
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    if (!userData || !userData.email) {
      return res.status(400).send("Failed to retrieve user profile from Google.");
    }
    const email = userData.email;
    const name = userData.name || email.split("@")[0];
    let user = await db.getUserByEmail(email);
    if (!user) {
      const dummyHash = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);
      user = await db.createUser(name, email, dummyHash);
      await db.seedUserWithRealisticData(user.id, false);
    }
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.redirect("/");
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.status(500).send("Internal Server Error during Google Sign-In.");
  }
});
router.get("/auth/me", authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});
router.post("/auth/logout", async (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out successfully" });
});
const getDashboardData = async (userId) => {
  const subjects = await db.getSubjects(userId);
  const attendanceRecords = await db.getAttendanceRecords(userId);
  const marks = await db.getMarks(userId);
  const assignments = await db.getAssignments(userId);
  const timetable = await db.getTimetable(userId);
  const events = await db.getAcademicEvents(userId);
  const settings = await db.getSettings(userId);
  const notifications = await db.getNotifications(userId);
  const subjectAttendances = subjects.map(
    (s) => IntelligenceEngine.calculateSubjectAttendance(s, attendanceRecords, settings.attendanceTarget, settings.minimumAttendance)
  );
  const overallAttendance = IntelligenceEngine.calculateOverallAttendance(subjects, attendanceRecords, settings);
  const subjectPerformances = AcademicEngine.evaluateAllSubjects(subjects, marks, settings.gradingSystem || "10_POINT");
  const academicData = AcademicEngine.evaluateSemesters(subjects, subjectPerformances);
  const estimatedSGPA = academicData.semesters.length > 0 ? academicData.semesters[academicData.semesters.length - 1].sgpa : null;
  const estimatedCGPA = academicData.cgpa;
  const academicRisk = AcademicEngine.calculateAcademicRisk(
    academicData.cgpa,
    subjectPerformances.filter((p) => p.isWeakSubject).length,
    academicData.trend,
    settings.gradingSystem || "10_POINT"
  );
  const dismissedRecords = await prisma.dismissedRecommendation.findMany({
    where: { userId }
  });
  const dismissedIds = dismissedRecords.map((r) => r.recommendationId);
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
  const now = /* @__PURE__ */ new Date();
  const currentDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
  const classesToday = timetable.filter((t) => t.day === currentDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((t, idx) => {
    const sub = subjects.find((s) => s.id === t.subjectId);
    return {
      id: t.id,
      subjectName: sub?.name || "Unknown Subject",
      subjectCode: sub?.code || "---",
      color: sub?.color || "#6366f1",
      startTime: t.startTime,
      endTime: t.endTime,
      room: t.room,
      instructor: t.instructor,
      isNext: idx === 0
    };
  });
  const pendingAssignments = assignments.filter((a) => a.status !== "COMPLETED");
  const overdueAssignments = pendingAssignments.filter((a) => new Date(a.deadline).getTime() < now.getTime());
  const riskSubjects = subjectAttendances.filter((a) => a.riskLevel === "HIGH_RISK" || a.riskLevel === "CRITICAL");
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
      urgentDueNext24Hours: pendingAssignments.filter((a) => new Date(a.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime() < 24 * 3600 * 1e3).length,
      dueThisWeekCount: pendingAssignments.filter((a) => new Date(a.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime() < 7 * 24 * 3600 * 1e3).length
    },
    riskAnalysis: {
      riskLevel: overallAttendance.overallRisk,
      inDangerCount: overallAttendance.criticalSubjectsCount,
      borderlineCount: overallAttendance.riskSubjectsCount,
      riskScore: overallAttendance.overallRisk === "CRITICAL" ? 95 : overallAttendance.overallRisk === "HIGH_RISK" ? 75 : 20
    },
    whatShouldIDoToday,
    todaySchedule: {
      dayOfWeek: currentDay,
      dateFormatted: now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      classes: classesToday
    },
    weeklySummary,
    subjects,
    recentNotifications: notifications.slice(0, 5)
  };
};
router.get("/dashboard", authenticateUser, async (req, res) => {
  try {
    const data = await getDashboardData(req.user.id);
    res.json({
      user: req.user,
      ...data
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch dashboard data." });
  }
});
router.get("/subjects", authenticateUser, async (req, res) => {
  const subjects = await db.getSubjects(req.user.id);
  res.json(subjects);
});
router.post("/subjects", authenticateUser, async (req, res) => {
  try {
    const { name, code, credits, minimumAttendance, targetAttendance, color, instructor, room } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: "Subject name and code are required." });
    }
    const subject = await db.createSubject(req.user.id, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: Number(credits) || 3,
      minimumAttendance: Number(minimumAttendance) || 75,
      targetAttendance: Number(targetAttendance) || 85,
      color: color || "#6366f1",
      instructor,
      room
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create subject." });
  }
});
router.put("/subjects/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await db.updateSubject(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Subject not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update subject." });
  }
});
router.delete("/subjects/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await db.deleteSubject(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Subject not found." });
    res.json({ message: "Subject and associated records deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete subject." });
  }
});
router.get("/attendance", authenticateUser, async (req, res) => {
  const subjectId = req.query.subjectId;
  const records = await db.getAttendanceRecords(req.user.id, subjectId);
  res.json(records);
});
router.post("/attendance", authenticateUser, async (req, res) => {
  try {
    const { subjectId, date, status, classType, notes } = req.body;
    if (!subjectId || !date || !status) {
      return res.status(400).json({ error: "Subject, date, and status are required." });
    }
    const record = await db.createAttendanceRecord(req.user.id, {
      subjectId,
      date,
      status,
      classType: classType || "LECTURE",
      notes
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to log attendance." });
  }
});
router.delete("/attendance/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await db.deleteAttendanceRecord(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Attendance record not found." });
    res.json({ message: "Attendance record deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete record." });
  }
});
router.get("/attendance/:subject_id/analytics", authenticateUser, async (req, res) => {
  try {
    const subject = await db.getSubjectById(req.user.id, req.params.subject_id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    const records = await db.getAttendanceRecords(req.user.id, req.params.subject_id);
    const settings = await db.getSettings(req.user.id);
    const intel = IntelligenceEngine.calculateSubjectAttendance(subject, records, settings.attendanceTarget, settings.minimumAttendance);
    res.json(intel);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to calculate analytics." });
  }
});
router.get("/marks", authenticateUser, async (req, res) => {
  const subjectId = req.query.subjectId;
  const marks = await db.getMarks(req.user.id, subjectId);
  res.json(marks);
});
router.post("/marks", authenticateUser, async (req, res) => {
  try {
    const { subjectId, assessmentName, assessmentType, obtainedMarks, maximumMarks, date, weightage, notes } = req.body;
    if (!subjectId || !assessmentName || obtainedMarks === void 0 || !maximumMarks || !date) {
      return res.status(400).json({ error: "All primary assessment fields are required." });
    }
    if (Number(obtainedMarks) > Number(maximumMarks)) {
      return res.status(400).json({ error: "Obtained marks cannot exceed maximum marks." });
    }
    const mark = await db.createMark(req.user.id, {
      subjectId,
      assessmentName: assessmentName.trim(),
      assessmentType: assessmentType || "CT",
      obtainedMarks: Number(obtainedMarks),
      maximumMarks: Number(maximumMarks),
      date,
      weightage: weightage ? Number(weightage) : void 0,
      notes
    });
    res.status(201).json(mark);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create mark record." });
  }
});
router.put("/marks/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await db.updateMark(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Mark record not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update mark." });
  }
});
router.delete("/marks/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await db.deleteMark(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Mark record not found." });
    res.json({ message: "Mark record deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete mark." });
  }
});
router.get("/assignments", authenticateUser, async (req, res) => {
  const assignments = await db.getAssignments(req.user.id);
  res.json(assignments);
});
router.post("/assignments", authenticateUser, async (req, res) => {
  try {
    const { subjectId, title, description, deadline, priority, status, estimatedHours } = req.body;
    if (!subjectId || !title || !deadline) {
      return res.status(400).json({ error: "Subject, title, and deadline are required." });
    }
    const assignment = await db.createAssignment(req.user.id, {
      subjectId,
      title: title.trim(),
      description,
      deadline,
      priority: priority || "MEDIUM",
      status: status || "NOT_STARTED",
      estimatedHours: estimatedHours ? Number(estimatedHours) : void 0
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create assignment." });
  }
});
router.put("/assignments/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await db.updateAssignment(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Assignment not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update assignment." });
  }
});
router.delete("/assignments/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await db.deleteAssignment(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Assignment not found." });
    res.json({ message: "Assignment deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete assignment." });
  }
});
router.get("/timetable", authenticateUser, async (req, res) => {
  const timetable = await db.getTimetable(req.user.id);
  res.json(timetable);
});
router.post("/timetable", authenticateUser, async (req, res) => {
  try {
    const { subjectId, day, startTime, endTime, room, instructor, classType } = req.body;
    if (!subjectId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: "Subject, day, start time, and end time are required." });
    }
    const entry = await db.createTimetableEntry(req.user.id, {
      subjectId,
      day,
      startTime,
      endTime,
      room,
      instructor,
      classType: classType || "LECTURE"
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create timetable entry." });
  }
});
router.put("/timetable/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await db.updateTimetableEntry(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Timetable entry not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update timetable entry." });
  }
});
router.delete("/timetable/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await db.deleteTimetableEntry(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Timetable entry not found." });
    res.json({ message: "Timetable entry deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete timetable entry." });
  }
});
router.get("/events", authenticateUser, async (req, res) => {
  const events = await db.getAcademicEvents(req.user.id);
  res.json(events);
});
router.post("/events", authenticateUser, async (req, res) => {
  try {
    const { title, type, date, startTime, endTime, description, subjectId, location } = req.body;
    if (!title || !type || !date) {
      return res.status(400).json({ error: "Title, type, and date are required." });
    }
    const event = await db.createAcademicEvent(req.user.id, {
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
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create event." });
  }
});
router.put("/events/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await db.updateAcademicEvent(req.user.id, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Event not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update event." });
  }
});
router.delete("/events/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await db.deleteAcademicEvent(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Event not found." });
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete event." });
  }
});
router.get("/analytics/attendance", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const subjects = await db.getSubjects(userId);
  const records = await db.getAttendanceRecords(userId);
  const settings = await db.getSettings(userId);
  const subjectIntel = subjects.map(
    (s) => IntelligenceEngine.calculateSubjectAttendance(s, records, settings.attendanceTarget, settings.minimumAttendance)
  );
  const overall = IntelligenceEngine.calculateOverallAttendance(subjects, records, settings);
  res.json({
    overall,
    subjects: subjectIntel
  });
});
router.get("/analytics/performance", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const subjects = await db.getSubjects(userId);
  const marks = await db.getMarks(userId);
  const performances = IntelligenceEngine.calculateAllSubjectPerformances(subjects, marks);
  const weakestSubject = performances.find((p) => p.isWeakSubject);
  res.json({
    performances,
    weakestSubject
  });
});
router.get("/analytics/sgpa", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const subjects = await db.getSubjects(userId);
  const marks = await db.getMarks(userId);
  const performances = IntelligenceEngine.calculateAllSubjectPerformances(subjects, marks);
  const sgpa = IntelligenceEngine.calculateSGPA(performances);
  res.json({
    sgpa,
    performances
  });
});
router.get("/recommendations", authenticateUser, async (req, res) => {
  const userId = req.user.id;
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
router.get("/notifications", authenticateUser, async (req, res) => {
  const list = await db.getNotifications(req.user.id);
  res.json(list);
});
router.post("/notifications/:id/dismiss", authenticateUser, async (req, res) => {
  const dismissed = await db.dismissNotification(req.user.id, req.params.id);
  res.json({ success: dismissed });
});
router.get("/recommendations", authenticateUser, async (req, res) => {
  try {
    const data = await getDashboardData(req.user.id);
    res.json(data.recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch recommendations." });
  }
});
router.post("/recommendations/:id/dismiss", authenticateUser, async (req, res) => {
  try {
    const recommendationId = req.params.id;
    await prisma.dismissedRecommendation.create({
      data: {
        userId: req.user.id,
        recommendationId
      }
    }).catch((e) => {
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to dismiss recommendation." });
  }
});
router.get("/settings", authenticateUser, async (req, res) => {
  const settings = await db.getSettings(req.user.id);
  res.json(settings);
});
router.put("/settings", authenticateUser, async (req, res) => {
  try {
    const updated = await db.updateSettings(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update settings." });
  }
});
router.get("/data/export", authenticateUser, async (req, res) => {
  const data = await db.exportUserData(req.user.id);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="campus_os_backup_${Date.now()}.json"`);
  res.json(data);
});
router.post("/data/import", authenticateUser, async (req, res) => {
  try {
    const { subjects, attendance, marks, assignments } = req.body;
    const userId = req.user.id;
    let importedSubjects = 0;
    let importedAttendance = 0;
    let importedMarks = 0;
    let importedAssignments = 0;
    const subjectMap = {};
    if (Array.isArray(subjects)) {
      for (const s of subjects) {
        if (s.name && s.code) {
          const created = await db.createSubject(userId, {
            name: s.name,
            code: s.code,
            credits: Number(s.credits) || 3,
            minimumAttendance: Number(s.minimumAttendance) || 75,
            targetAttendance: Number(s.targetAttendance) || 85,
            color: s.color || "#6366f1",
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
            classType: a.classType || "LECTURE",
            notes: a.notes
          });
          importedAttendance++;
        }
      }
    }
    if (Array.isArray(marks)) {
      for (const m of marks) {
        const subId = subjectMap[m.subjectCode?.toUpperCase()] || subjectMap[m.subjectId] || m.subjectId;
        if (subId && m.assessmentName && m.obtainedMarks !== void 0 && m.maximumMarks) {
          await db.createMark(userId, {
            subjectId: subId,
            assessmentName: m.assessmentName,
            assessmentType: m.assessmentType || "CT",
            obtainedMarks: Number(m.obtainedMarks),
            maximumMarks: Number(m.maximumMarks),
            date: m.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
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
            priority: asgn.priority || "MEDIUM",
            status: asgn.status || "NOT_STARTED"
          });
          importedAssignments++;
        }
      }
    }
    res.json({
      message: "Data import completed successfully",
      stats: {
        importedSubjects,
        importedAttendance,
        importedMarks,
        importedAssignments
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Invalid import payload format." });
  }
});
router.delete("/account", authenticateUser, async (req, res) => {
  try {
    const { confirmation } = req.body;
    if (confirmation !== "DELETE") {
      return res.status(400).json({ error: 'Please provide exact confirmation string "DELETE" to permanently purge your account.' });
    }
    await db.deleteUserAccount(req.user.id);
    res.clearCookie("token");
    res.json({ message: "Account and all associated academic records deleted permanently." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete account." });
  }
});
router.get("/career/profile", authenticateUser, async (req, res) => {
  try {
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        recommendations: { orderBy: { rank: "asc" } }
      }
    });
    if (!profile) {
      return res.json({ profile: null, roadmap: null });
    }
    const roadmap = await prisma.careerRoadmap.findFirst({
      where: { userId: req.user.id },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: {
            tasks: true
          }
        }
      }
    });
    res.json({ profile, roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch career profile." });
  }
});
router.post("/career/assess", authenticateUser, async (req, res) => {
  try {
    const { targetCareer, interests, preferredSubjects, strengths, workPreferences, careerPreferences } = req.body;
    let profile = await prisma.careerProfile.findUnique({ where: { userId: req.user.id } });
    if (profile) {
      profile = await prisma.careerProfile.update({
        where: { id: profile.id },
        data: { targetCareer, interests, preferredSubjects, strengths, workPreferences, careerPreferences }
      });
      await prisma.careerRecommendation.deleteMany({ where: { profileId: profile.id } });
    } else {
      profile = await prisma.careerProfile.create({
        data: { userId: req.user.id, targetCareer, interests, preferredSubjects, strengths, workPreferences, careerPreferences }
      });
    }
    const recommendations = CareerEngine.calculateCareerFit(profile);
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      let aiExplanation = rec.explanation;
      try {
        const { text } = await generateText({
          model: groqProvider("openai/gpt-oss-20b"),
          prompt: `You are the Campus OS Career Advisor. The user is assessing their fit for the career: ${rec.career}.
The deterministic system calculated a match score of ${rec.compatibilityScore}%.
The raw match reasons are: ${rec.explanation}
User profile strengths: ${strengths.join(", ")}
User profile interests: ${interests.join(", ")}

Explain in exactly 2-3 short, encouraging sentences why this career is a good match based on their specific strengths and interests. Do NOT mention the exact numerical score, just explain why it fits.`
        });
        if (text) aiExplanation = text;
      } catch (e) {
        console.error("Failed to generate AI explanation:", e);
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
    res.json({ message: "Assessment complete", recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to process assessment." });
  }
});
router.post("/career/target", authenticateUser, async (req, res) => {
  try {
    const { careerName } = req.body;
    const userId = req.user.id;
    let profile = await prisma.careerProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: "Profile not found. Take assessment first." });
    await prisma.careerProfile.update({
      where: { id: profile.id },
      data: { targetCareer: careerName }
    });
    await prisma.careerRoadmap.deleteMany({ where: { userId } });
    const subjects = await db.getSubjects(userId);
    const marks = await db.getMarks(userId);
    const generatedPhases = CareerEngine.generateRoadmap(careerName, subjects, marks);
    const roadmap = await prisma.careerRoadmap.create({
      data: {
        userId,
        targetCareer: careerName,
        currentLevel: "Beginner",
        phases: {
          create: generatedPhases.map((p) => ({
            title: p.title,
            description: p.description,
            order: p.order,
            tasks: {
              create: p.tasks.map((t) => ({
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
    res.json({ message: "Roadmap generated", roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate roadmap." });
  }
});
router.all("/copilotkit", authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    req.url = req.originalUrl;
    const runtime = new CopilotRuntime({
      agents: {
        default: new BuiltInAgent({
          model: groqProvider("openai/gpt-oss-20b")
        })
      },
      actions: [
        {
          name: "getMyAcademicProfile",
          description: "Gets the comprehensive, canonical academic profile for the current authenticated student. Includes attendance (overall and per-subject), performance (SGPA and per-subject), pending assignments, today's schedule, and academic risk analysis. Takes NO parameters.",
          parameters: [],
          handler: async () => {
            return await getDashboardData(userId);
          }
        },
        {
          name: "getMyCareerRoadmap",
          description: "Retrieve the student's career profile and active roadmap",
          handler: async () => {
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
        },
        {
          name: "getMyAcademicSummary",
          description: "Retrieve the student's deterministic academic performance (SGPA, CGPA, trends, semesters)",
          handler: async () => {
            const data = await getDashboardData(userId);
            return {
              estimatedSGPA: data.academicPerformance.estimatedSGPA,
              estimatedCGPA: data.academicPerformance.estimatedCGPA,
              academicRisk: data.academicPerformance.academicRisk,
              trend: data.academicPerformance.trend,
              completedCredits: data.academicPerformance.completedCredits,
              strongSubjects: data.academicPerformance.subjects.filter((s) => !s.isWeakSubject && s.assessmentsCount > 0),
              weakSubjects: data.academicPerformance.subjects.filter((s) => s.isWeakSubject),
              semesters: data.academicPerformance.semesters
            };
          }
        },
        {
          name: "getMyTargetSGPA",
          description: "Calculate what SGPA/CGPA the student needs in remaining credits to hit a target. Provide targetCGPA and remainingCredits as parameters.",
          parameters: [
            { name: "targetCGPA", type: "number", description: "The CGPA the user wants to achieve" },
            { name: "remainingCredits", type: "number", description: "The number of credits left in their degree/semester" }
          ],
          handler: async ({ targetCGPA, remainingCredits }) => {
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
        },
        {
          name: "getMyRecommendations",
          description: "Retrieve the student's deterministic, prioritized smart recommendations (what should I do today/focus on). This engine merges attendance, assignment, academic, and career risks. Takes NO parameters.",
          parameters: [],
          handler: async () => {
            const data = await getDashboardData(userId);
            return data.recommendations;
          }
        }
      ]
    });
    const handler = copilotRuntimeNodeHttpEndpoint({
      endpoint: "/api/copilotkit",
      runtime
    });
    return handler(req, res);
  } catch (err) {
    next(err);
  }
});
var api_default = router;
export {
  authenticateUser,
  api_default as default,
  getDashboardData
};
