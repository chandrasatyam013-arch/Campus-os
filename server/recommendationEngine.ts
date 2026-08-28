import { DismissedRecommendation } from '@prisma/client';
import { Subject, Assignment, AcademicEvent, SubjectAttendanceIntelligence, SubjectPerformanceAnalytics, ActionRecommendation } from '../src/types';

export class RecommendationEngine {
  /**
   * Generates a deduplicated, prioritized list of recommendations for a user.
   */
  public static generateRecommendations(
    subjects: Subject[],
    assignments: Assignment[],
    events: AcademicEvent[],
    attendanceIntel: SubjectAttendanceIntelligence[],
    academicIntel: SubjectPerformanceAnalytics[],
    dismissedIds: string[],
    now: Date = new Date()
  ): ActionRecommendation[] {
    const rawRecommendations: ActionRecommendation[] = [];

    // 1. Process Assignments (Overdue & Urgent)
    const pendingAssignments = assignments.filter(a => a.status !== 'COMPLETED');
    for (const a of pendingAssignments) {
      const subj = subjects.find(s => s.id === a.subjectId);
      const deadlineDate = new Date(a.deadline);
      const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let urgencyScore = 10;
      
      if (hoursLeft < 0) {
        priority = 'CRITICAL';
        urgencyScore = 100;
      } else if (hoursLeft <= 36) {
        priority = 'HIGH';
        urgencyScore = 80;
      } else if (hoursLeft <= 72) {
        priority = 'MEDIUM';
        urgencyScore = 50;
      } else {
        continue; // Don't recommend far-future assignments unless there's nothing else
      }

      rawRecommendations.push({
        id: `rec-assign-${a.id}`, // Deterministic ID
        priority,
        category: 'ASSIGNMENT',
        title: hoursLeft < 0 ? `Overdue: ${a.title}` : `Due Soon: ${a.title}`,
        reason: hoursLeft < 0 
          ? `Submission passed deadline on ${deadlineDate.toLocaleDateString()}.` 
          : `Due in ${Math.round(hoursLeft)} hours.`,
        action: `Complete and submit immediately.`,
        subjectId: a.subjectId,
        subjectName: subj?.name,
        subjectColor: subj?.color,
        deadline: a.deadline,
        urgencyScore
      });
    }

    // 2. Process Attendance & Academic (and merge them if they overlap)
    for (const subject of subjects) {
      const att = attendanceIntel.find(a => a.subjectId === subject.id);
      const acad = academicIntel.find(a => a.subjectId === subject.id);

      const hasAttendanceRisk = att && (att.riskLevel === 'CRITICAL' || att.riskLevel === 'HIGH_RISK');
      const hasAcademicRisk = acad && acad.isWeakSubject;

      // Merged Risk!
      if (hasAttendanceRisk && hasAcademicRisk) {
        rawRecommendations.push({
          id: `rec-merged-risk-${subject.id}`,
          priority: 'CRITICAL',
          category: 'ACADEMIC', // Merged acts as academic intervention
          title: `Critical Intervention: ${subject.name}`,
          reason: `Both attendance (${att.attendancePercentage}%) and academic performance (Grade Pt: ${acad.gradePointEstimate}) are dangerously low.`,
          action: `Attend all upcoming classes and immediately begin remedial study for ${subject.code}.`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color,
          urgencyScore: 98
        });
      } 
      else if (hasAttendanceRisk) {
        rawRecommendations.push({
          id: `rec-att-risk-${subject.id}`,
          priority: att.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          category: 'ATTENDANCE',
          title: `Protect Attendance: ${subject.name}`,
          reason: `Current attendance is ${att.attendancePercentage}%. You have ${att.classesCanMiss} safe absences remaining.`,
          action: `Attend the next ${att.classesNeededForTarget} classes without exception.`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color,
          urgencyScore: att.riskLevel === 'CRITICAL' ? 95 : 85
        });
      }
      else if (hasAcademicRisk) {
        rawRecommendations.push({
          id: `rec-acad-weak-${subject.id}`,
          priority: 'HIGH',
          category: 'ACADEMIC',
          title: `Improve Grade: ${subject.name}`,
          reason: acad.weakReason || `Performance in this subject is below expectations.`,
          action: `Dedicate extra study time. Focus on completing all upcoming assignments.`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color,
          urgencyScore: 82
        });
      }
    }

    // 2.5 Process Upcoming Exams
    const upcomingEvents = events.filter(e => {
      const eventTime = new Date(e.date).getTime();
      const diffDays = (eventTime - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7 && (e.type === 'EXAM' || e.type === 'CT');
    });

    for (const ev of upcomingEvents) {
      const subj = subjects.find(s => s.id === ev.subjectId);
      const diffDays = Math.ceil((new Date(ev.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      rawRecommendations.push({
        id: `rec-event-${ev.id}`,
        priority: diffDays <= 2 ? 'CRITICAL' : 'HIGH',
        category: 'EXAM_PREP',
        title: `Prepare: ${ev.title}`,
        reason: diffDays === 0 ? 'Assessment is today!' : `Assessment is in ${diffDays} day${diffDays > 1 ? 's' : ''}.`,
        action: `Review syllabus notes, previous test solutions, and key theorems.`,
        subjectId: ev.subjectId || undefined,
        subjectName: subj?.name,
        subjectColor: subj?.color,
        deadline: ev.date,
        urgencyScore: diffDays <= 2 ? 92 : 78
      });
    }

    // 3. Filter dismissed recommendations
    const filteredRecommendations = rawRecommendations.filter(rec => !dismissedIds.includes(rec.id));

    // 4. Sort by urgency score descending
    filteredRecommendations.sort((a, b) => b.urgencyScore - a.urgencyScore);

    return filteredRecommendations;
  }
}
