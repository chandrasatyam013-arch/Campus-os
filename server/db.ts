import bcrypt from 'bcryptjs';
import { prisma } from './db/prisma';
import fs from 'fs';
import path from 'path';

import {
  User,
  Subject,
  AttendanceRecord,
  Mark,
  Assignment,
  TimetableEntry,
  AcademicEvent,
  UserSettings,
  AppNotification
} from '../src/types';

class DatabaseManager {
  constructor() {
    // Initialization handled by Prisma now
  }

  // --- JSON Data Migration Logic ---
  public async migrateFromJSONIfNeeded() {
    const DATA_DIR = path.join(process.cwd(), 'data');
    const DB_FILE = path.join(DATA_DIR, 'campus_os.json');
    if (!fs.existsSync(DB_FILE)) return;

    try {
      const userCount = await prisma.user.count();
      if (userCount > 0) return; // Already migrated or seeded

      console.log('PostgreSQL is empty. Migrating existing JSON data...');
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      
      const { users, passwordHashes, subjects, attendanceRecords, marks, assignments, timetableEntries, academicEvents, userSettings, notifications } = parsed;
      
      if (!users || users.length === 0) return;

      // Migrate Users
      for (const u of users) {
        await prisma.user.create({
          data: {
            id: u.id,
            name: u.name,
            email: u.email,
            passwordHash: passwordHashes[u.id] || bcrypt.hashSync('defaultpassword', 10),
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt)
          }
        });
      }
      
      // Settings
      if (userSettings) {
        for (const s of userSettings) {
          try {
            await prisma.userSettings.create({
              data: {
                userId: s.userId,
                theme: s.theme,
                attendanceTarget: s.attendanceTarget,
                minimumAttendance: s.minimumAttendance,
                gradingSystem: s.gradingSystem,
                notificationPreferences: s.notificationPreferences
              }
            });
          } catch (e) {
            console.warn(`Skipping duplicate setting for user ${s.userId}`);
          }
        }
      }

      // Subjects
      if (subjects) {
        for (const s of subjects) {
          await prisma.subject.create({
            data: {
              id: s.id,
              userId: s.userId,
              name: s.name,
              code: s.code,
              credits: s.credits,
              minimumAttendance: s.minimumAttendance,
              targetAttendance: s.targetAttendance,
              color: s.color,
              instructor: s.instructor,
              room: s.room,
              createdAt: new Date(s.createdAt)
            }
          });
        }
      }

      // Attendance
      if (attendanceRecords) {
        for (const a of attendanceRecords) {
          await prisma.attendanceRecord.create({
            data: {
              id: a.id,
              userId: a.userId,
              subjectId: a.subjectId,
              date: a.date,
              status: a.status,
              classType: a.classType,
              notes: a.notes,
              createdAt: new Date(a.createdAt)
            }
          });
        }
      }

      // Marks
      if (marks) {
        for (const m of marks) {
          await prisma.mark.create({
            data: {
              id: m.id,
              userId: m.userId,
              subjectId: m.subjectId,
              assessmentName: m.assessmentName,
              assessmentType: m.assessmentType,
              obtainedMarks: m.obtainedMarks,
              maximumMarks: m.maximumMarks,
              date: m.date,
              weightage: m.weightage,
              notes: m.notes,
              createdAt: new Date(m.createdAt)
            }
          });
        }
      }

      // Assignments
      if (assignments) {
        for (const a of assignments) {
          await prisma.assignment.create({
            data: {
              id: a.id,
              userId: a.userId,
              subjectId: a.subjectId,
              title: a.title,
              description: a.description,
              deadline: a.deadline,
              priority: a.priority,
              status: a.status,
              estimatedHours: a.estimatedHours,
              completedAt: a.completedAt,
              createdAt: new Date(a.createdAt)
            }
          });
        }
      }

      // Timetable
      if (timetableEntries) {
        for (const t of timetableEntries) {
          await prisma.timetableEntry.create({
            data: {
              id: t.id,
              userId: t.userId,
              subjectId: t.subjectId,
              day: t.day,
              startTime: t.startTime,
              endTime: t.endTime,
              room: t.room,
              instructor: t.instructor,
              classType: t.classType
            }
          });
        }
      }

      // Academic Events
      if (academicEvents) {
        for (const e of academicEvents) {
          await prisma.academicEvent.create({
            data: {
              id: e.id,
              userId: e.userId,
              title: e.title,
              type: e.type,
              date: e.date,
              startTime: e.startTime,
              endTime: e.endTime,
              description: e.description,
              subjectId: e.subjectId,
              location: e.location,
              createdAt: new Date(e.createdAt)
            }
          });
        }
      }

      // Notifications
      if (notifications) {
        for (const n of notifications) {
          await prisma.appNotification.create({
            data: {
              id: n.id,
              userId: n.userId,
              title: n.title,
              message: n.message,
              type: n.type,
              timestamp: n.timestamp,
              read: n.read,
              link: n.link
            }
          });
        }
      }
      
      console.log('PostgreSQL migration complete! Renaming JSON file to prevent re-runs.');
      fs.renameSync(DB_FILE, `${DB_FILE}.migrated.bak`);
      
    } catch (err) {
      console.error('Failed to migrate JSON to PostgreSQL:', err);
    }
  }

  // --- Auth & User ---
  public async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return undefined;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  public async getUserById(userId: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return undefined;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  public async getPasswordHash(userId: string): Promise<string | undefined> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.passwordHash;
  }

  public async createUser(name: string, email: string, passwordHash: string): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  public async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id: userId } });
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Core Domain ---
  public async getSettings(userId: string): Promise<UserSettings | undefined> {
    const s = await prisma.userSettings.findUnique({ where: { userId } });
    if (!s) return undefined;
    return {
      userId: s.userId,
      theme: s.theme as any,
      attendanceTarget: s.attendanceTarget,
      minimumAttendance: s.minimumAttendance,
      gradingSystem: s.gradingSystem as any,
      notificationPreferences: s.notificationPreferences as any
    };
  }

  public async getSubjects(userId: string): Promise<Subject[]> {
    const subs = await prisma.subject.findMany({ where: { userId } });
    return subs.map(s => ({
      ...s,
      targetAttendance: s.targetAttendance ?? undefined,
      instructor: s.instructor ?? undefined,
      room: s.room ?? undefined,
      createdAt: s.createdAt.toISOString()
    }));
  }

  public async getAttendanceRecords(userId: string, subjectId?: string): Promise<AttendanceRecord[]> {
    const recs = await prisma.attendanceRecord.findMany({ where: subjectId ? { userId, subjectId } : { userId } });
    return recs.map(r => ({
      ...r,
      notes: r.notes ?? undefined,
      status: r.status as any,
      classType: r.classType as any,
      createdAt: r.createdAt.toISOString()
    }));
  }

  public async getMarks(userId: string, subjectId?: string): Promise<Mark[]> {
    const marks = await prisma.mark.findMany({ where: subjectId ? { userId, subjectId } : { userId } });
    return marks.map(m => ({
      ...m,
      weightage: m.weightage ?? undefined,
      notes: m.notes ?? undefined,
      assessmentType: m.assessmentType as any,
      createdAt: m.createdAt.toISOString()
    }));
  }

  public async getAssignments(userId: string, subjectId?: string): Promise<Assignment[]> {
    const assignments = await prisma.assignment.findMany({ where: subjectId ? { userId, subjectId } : { userId } });
    return assignments.map(a => ({
      ...a,
      description: a.description ?? undefined,
      estimatedHours: a.estimatedHours ?? undefined,
      completedAt: a.completedAt ?? undefined,
      priority: a.priority as any,
      status: a.status as any,
      createdAt: a.createdAt.toISOString()
    }));
  }

  public async getTimetable(userId: string): Promise<TimetableEntry[]> {
    const tt = await prisma.timetableEntry.findMany({ where: { userId } });
    return tt.map(t => ({
      ...t,
      room: t.room ?? undefined,
      instructor: t.instructor ?? undefined,
      classType: t.classType as any,
      day: t.day as any
    }));
  }

  public async getAcademicEvents(userId: string): Promise<AcademicEvent[]> {
    const events = await prisma.academicEvent.findMany({ where: { userId } });
    return events.map(e => ({
      ...e,
      startTime: e.startTime ?? undefined,
      endTime: e.endTime ?? undefined,
      description: e.description ?? undefined,
      subjectId: e.subjectId ?? undefined,
      location: e.location ?? undefined,
      type: e.type as any,
      createdAt: e.createdAt.toISOString()
    }));
  }

  public async getNotifications(userId: string): Promise<AppNotification[]> {
    const notifs = await prisma.appNotification.findMany({ where: { userId } });
    return notifs.map(n => ({
      ...n,
      link: n.link ?? undefined,
      type: n.type as any
    }));
  }

  // --- Core Domain Mutations ---
  public async createSubject(userId: string, data: any): Promise<Subject> {
    const s = await prisma.subject.create({ data: { ...data, userId, color: data.color || '#6366f1' } });
    return { ...s, targetAttendance: s.targetAttendance ?? undefined, instructor: s.instructor ?? undefined, room: s.room ?? undefined, createdAt: s.createdAt.toISOString() };
  }
  public async updateSubject(userId: string, id: string, data: any): Promise<Subject | undefined> {
    try {
      const s = await prisma.subject.update({ where: { id, userId }, data });
      return { ...s, targetAttendance: s.targetAttendance ?? undefined, instructor: s.instructor ?? undefined, room: s.room ?? undefined, createdAt: s.createdAt.toISOString() };
    } catch { return undefined; }
  }
  public async deleteSubject(userId: string, id: string): Promise<boolean> {
    try { await prisma.subject.delete({ where: { id, userId } }); return true; } catch { return false; }
  }
  public async getSubjectById(userId: string, id: string): Promise<Subject | undefined> {
    const s = await prisma.subject.findUnique({ where: { id, userId } });
    if (!s) return undefined;
    return { ...s, targetAttendance: s.targetAttendance ?? undefined, instructor: s.instructor ?? undefined, room: s.room ?? undefined, createdAt: s.createdAt.toISOString() };
  }

  public async createAttendanceRecord(userId: string, data: any): Promise<AttendanceRecord> {
    const r = await prisma.attendanceRecord.create({ data: { ...data, userId } });
    return { ...r, notes: r.notes ?? undefined, status: r.status as any, classType: r.classType as any, createdAt: r.createdAt.toISOString() };
  }
  public async deleteAttendanceRecord(userId: string, id: string): Promise<boolean> {
    try { await prisma.attendanceRecord.delete({ where: { id, userId } }); return true; } catch { return false; }
  }

  public async createMark(userId: string, data: any): Promise<Mark> {
    const m = await prisma.mark.create({ data: { ...data, userId } });
    return { ...m, weightage: m.weightage ?? undefined, notes: m.notes ?? undefined, assessmentType: m.assessmentType as any, createdAt: m.createdAt.toISOString() };
  }
  public async updateMark(userId: string, id: string, data: any): Promise<Mark | undefined> {
    try {
      const m = await prisma.mark.update({ where: { id, userId }, data });
      return { ...m, weightage: m.weightage ?? undefined, notes: m.notes ?? undefined, assessmentType: m.assessmentType as any, createdAt: m.createdAt.toISOString() };
    } catch { return undefined; }
  }
  public async deleteMark(userId: string, id: string): Promise<boolean> {
    try { await prisma.mark.delete({ where: { id, userId } }); return true; } catch { return false; }
  }

  public async createAssignment(userId: string, data: any): Promise<Assignment> {
    const a = await prisma.assignment.create({ data: { ...data, userId } });
    return { ...a, description: a.description ?? undefined, estimatedHours: a.estimatedHours ?? undefined, completedAt: a.completedAt ?? undefined, priority: a.priority as any, status: a.status as any, createdAt: a.createdAt.toISOString() };
  }
  public async updateAssignment(userId: string, id: string, data: any): Promise<Assignment | undefined> {
    try {
      const a = await prisma.assignment.update({ where: { id, userId }, data });
      return { ...a, description: a.description ?? undefined, estimatedHours: a.estimatedHours ?? undefined, completedAt: a.completedAt ?? undefined, priority: a.priority as any, status: a.status as any, createdAt: a.createdAt.toISOString() };
    } catch { return undefined; }
  }
  public async deleteAssignment(userId: string, id: string): Promise<boolean> {
    try { await prisma.assignment.delete({ where: { id, userId } }); return true; } catch { return false; }
  }

  public async createTimetableEntry(userId: string, data: any): Promise<TimetableEntry> {
    const t = await prisma.timetableEntry.create({ data: { ...data, userId } });
    return { ...t, room: t.room ?? undefined, instructor: t.instructor ?? undefined, classType: t.classType as any, day: t.day as any };
  }
  public async updateTimetableEntry(userId: string, id: string, data: any): Promise<TimetableEntry | undefined> {
    try {
      const t = await prisma.timetableEntry.update({ where: { id, userId }, data });
      return { ...t, room: t.room ?? undefined, instructor: t.instructor ?? undefined, classType: t.classType as any, day: t.day as any };
    } catch { return undefined; }
  }
  public async deleteTimetableEntry(userId: string, id: string): Promise<boolean> {
    try { await prisma.timetableEntry.delete({ where: { id, userId } }); return true; } catch { return false; }
  }

  public async createAcademicEvent(userId: string, data: any): Promise<AcademicEvent> {
    const e = await prisma.academicEvent.create({ data: { ...data, userId } });
    return { ...e, startTime: e.startTime ?? undefined, endTime: e.endTime ?? undefined, description: e.description ?? undefined, subjectId: e.subjectId ?? undefined, location: e.location ?? undefined, type: e.type as any, createdAt: e.createdAt.toISOString() };
  }
  public async updateAcademicEvent(userId: string, id: string, data: any): Promise<AcademicEvent | undefined> {
    try {
      const e = await prisma.academicEvent.update({ where: { id, userId }, data });
      return { ...e, startTime: e.startTime ?? undefined, endTime: e.endTime ?? undefined, description: e.description ?? undefined, subjectId: e.subjectId ?? undefined, location: e.location ?? undefined, type: e.type as any, createdAt: e.createdAt.toISOString() };
    } catch { return undefined; }
  }
  public async deleteAcademicEvent(userId: string, id: string): Promise<boolean> {
    try { await prisma.academicEvent.delete({ where: { id, userId } }); return true; } catch { return false; }
  }

  public async updateSettings(userId: string, data: any): Promise<UserSettings | undefined> {
    try {
      const s = await prisma.userSettings.update({ where: { userId }, data });
      return { ...s, theme: s.theme as any, gradingSystem: s.gradingSystem as any, notificationPreferences: s.notificationPreferences as any };
    } catch { return undefined; }
  }

  public async seedUserWithRealisticData(userId: string, overwrite = false) {
    if (overwrite) {
      await prisma.userSettings.deleteMany({ where: { userId } });
      await prisma.subject.deleteMany({ where: { userId } });
      // Relations Cascade
    }
    
    // We can port over the exact seeder, or for now just create Settings
    const existing = await prisma.userSettings.findUnique({ where: { userId } });
    if (!existing) {
      await prisma.userSettings.create({
        data: {
          userId,
          theme: 'dark',
          attendanceTarget: 85,
          minimumAttendance: 75,
          gradingSystem: '10_POINT',
          notificationPreferences: {
            attendanceAlerts: true,
            assignmentReminders: true,
            examAlerts: true,
            weeklySummary: true
          }
        }
      });
    }
  }



  public async exportUserData(userId: string): Promise<any> {
    return {
      subjects: await this.getSubjects(userId),
      attendanceRecords: await this.getAttendanceRecords(userId),
      marks: await this.getMarks(userId),
      assignments: await this.getAssignments(userId),
      timetableEntries: await this.getTimetable(userId),
      academicEvents: await this.getAcademicEvents(userId),
      userSettings: await this.getSettings(userId),
      notifications: await this.getNotifications(userId)
    };
  }

  public async dismissNotification(userId: string, id: string): Promise<boolean> {
    try {
      await prisma.appNotification.update({
        where: { id, userId },
        data: { read: true }
      });
      return true;
    } catch {
      return false;
    }
  }

}

export const db = new DatabaseManager();
