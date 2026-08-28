import { Subject, Mark, SubjectPerformanceAnalytics, SemesterRecord, RiskLevel, TrendDirection } from '../src/types';

export class AcademicEngine {
  
  /**
   * Converts a percentage into a grade and grade point depending on the grading system.
   */
  public static calculateGrade(percentage: number, gradingSystem: string = '10_POINT'): { grade: string, gradePoint: number } {
    if (gradingSystem === '10_POINT') {
      if (percentage >= 90) return { grade: 'O', gradePoint: 10 };
      if (percentage >= 80) return { grade: 'A+', gradePoint: 9 };
      if (percentage >= 70) return { grade: 'A', gradePoint: 8 };
      if (percentage >= 60) return { grade: 'B+', gradePoint: 7 };
      if (percentage >= 50) return { grade: 'B', gradePoint: 6 };
      if (percentage >= 40) return { grade: 'C', gradePoint: 5 };
      return { grade: 'F', gradePoint: 0 };
    } else {
      // 4-Point System Fallback
      if (percentage >= 90) return { grade: 'A', gradePoint: 4.0 };
      if (percentage >= 80) return { grade: 'B', gradePoint: 3.0 };
      if (percentage >= 70) return { grade: 'C', gradePoint: 2.0 };
      if (percentage >= 60) return { grade: 'D', gradePoint: 1.0 };
      return { grade: 'F', gradePoint: 0.0 };
    }
  }

  /**
   * Evaluates the performance analytics of a single subject.
   */
  public static evaluateSubject(subject: Subject, marks: Mark[], gradingSystem: string): SubjectPerformanceAnalytics {
    const subjectMarks = marks.filter(m => m.subjectId === subject.id);
    
    if (subjectMarks.length === 0) {
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        color: subject.color,
        credits: subject.credits,
        assessmentsCount: 0,
        averagePercentage: 0,
        highestPercentage: 0,
        lowestPercentage: 0,
        trend: 'INSUFFICIENT_DATA',
        trendPercentageChange: 0,
        isWeakSubject: false
      };
    }

    const percentages = subjectMarks.map(m => (m.obtainedMarks / m.maximumMarks) * 100);
    const sumObtained = subjectMarks.reduce((a, b) => a + b.obtainedMarks, 0);
    const sumMax = subjectMarks.reduce((a, b) => a + b.maximumMarks, 0);
    
    const averagePercentage = sumMax === 0 ? 0 : Number(((sumObtained / sumMax) * 100).toFixed(1));
    const highestPercentage = Number(Math.max(...percentages).toFixed(1));
    const lowestPercentage = Number(Math.min(...percentages).toFixed(1));

    // Calculate Trend
    let trend: TrendDirection = 'INSUFFICIENT_DATA';
    let trendPercentageChange = 0;

    if (subjectMarks.length >= 2) {
      const sortedMarks = [...subjectMarks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const mid = Math.floor(sortedMarks.length / 2);
      const older = sortedMarks.slice(0, mid);
      const newer = sortedMarks.slice(mid);

      const avgOlder = older.reduce((a, b) => a + (b.obtainedMarks / b.maximumMarks) * 100, 0) / older.length;
      const avgNewer = newer.reduce((a, b) => a + (b.obtainedMarks / b.maximumMarks) * 100, 0) / newer.length;
      trendPercentageChange = Number((avgNewer - avgOlder).toFixed(1));

      if (trendPercentageChange >= 3.0) trend = 'IMPROVING';
      else if (trendPercentageChange <= -3.0) trend = 'DECLINING';
      else trend = 'STABLE';
    }

    const { grade, gradePoint } = this.calculateGrade(averagePercentage, gradingSystem);

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      color: subject.color,
      credits: subject.credits,
      assessmentsCount: subjectMarks.length,
      averagePercentage,
      highestPercentage,
      lowestPercentage,
      trend,
      trendPercentageChange,
      isWeakSubject: false, // Updated later via comparative analysis
      gradeEstimate: grade,
      gradePointEstimate: gradePoint
    };
  }

  /**
   * Aggregates subject performances and flags weak/strong subjects based on dynamic thresholds.
   */
  public static evaluateAllSubjects(subjects: Subject[], marks: Mark[], gradingSystem: string): SubjectPerformanceAnalytics[] {
    const list = subjects.map(s => this.evaluateSubject(s, marks, gradingSystem));
    
    const subjectsWithMarks = list.filter(p => p.assessmentsCount > 0);
    if (subjectsWithMarks.length === 0) return list;

    // Define weak/strong dynamically
    const minAvgScore = Math.min(...subjectsWithMarks.map(p => p.averagePercentage));
    
    // Configurable thresholds for weak subjects
    const weakThreshold = gradingSystem === '10_POINT' ? 6.0 : 2.0;

    for (const p of list) {
      if (p.assessmentsCount > 0) {
        if ((p.gradePointEstimate !== undefined && p.gradePointEstimate < weakThreshold) || 
            p.averagePercentage === minAvgScore || 
            p.trend === 'DECLINING') {
          
          p.isWeakSubject = true;
          p.weakReason = p.averagePercentage === minAvgScore 
            ? `Lowest overall score (${p.averagePercentage}%) among all subjects.`
            : p.trend === 'DECLINING' 
            ? `Performance declining (${p.trendPercentageChange}% drop recently).`
            : `Grade point is below the healthy threshold (${p.gradePointEstimate} vs ${weakThreshold}).`;
        }
      }
    }

    return list;
  }

  /**
   * Calculates SGPA for a given array of subject performances.
   * Formula: Σ(Credit × Grade Point) / Σ(Credit)
   */
  public static calculateSGPA(performances: SubjectPerformanceAnalytics[]): number | null {
    let totalCreditPoints = 0;
    let totalCredits = 0;

    const validPerformances = performances.filter(p => p.assessmentsCount > 0 && p.gradePointEstimate !== undefined);
    if (validPerformances.length === 0) return null;

    for (const p of validPerformances) {
      totalCreditPoints += (p.gradePointEstimate!) * p.credits;
      totalCredits += p.credits;
    }

    return totalCredits === 0 ? 0 : Number((totalCreditPoints / totalCredits).toFixed(2));
  }

  /**
   * Extracts semester-wise records and calculates SGPA and CGPA safely.
   * Assumes subjects belong to semesters dynamically fetched via their .semester property.
   */
  public static evaluateSemesters(subjects: any[], performances: SubjectPerformanceAnalytics[]): {
    semesters: SemesterRecord[],
    cgpa: number | null,
    totalCredits: number,
    completedCredits: number,
    trend: TrendDirection
  } {
    const semestersMap = new Map<number, SubjectPerformanceAnalytics[]>();
    
    for (const sub of subjects) {
      const p = performances.find(perf => perf.subjectId === sub.id);
      if (p && p.assessmentsCount > 0) { // Only count if there's data
        const sem = sub.semester || 1;
        if (!semestersMap.has(sem)) semestersMap.set(sem, []);
        semestersMap.get(sem)!.push(p);
      }
    }

    const semesters: SemesterRecord[] = [];
    let grandCreditPoints = 0;
    let completedCredits = 0;
    
    const sortedSems = Array.from(semestersMap.keys()).sort((a, b) => a - b);
    
    for (const sem of sortedSems) {
      const perfs = semestersMap.get(sem)!;
      let semCreditPoints = 0;
      let semCredits = 0;
      
      for (const p of perfs) {
        const gp = p.gradePointEstimate || 0;
        semCreditPoints += gp * p.credits;
        semCredits += p.credits;
      }

      grandCreditPoints += semCreditPoints;
      completedCredits += semCredits;
      
      semesters.push({
        semesterNumber: sem,
        semesterName: `Semester ${sem}`,
        sgpa: semCredits === 0 ? 0 : Number((semCreditPoints / semCredits).toFixed(2)),
        totalCredits: semCredits
      });
    }

    const cgpa = completedCredits === 0 ? null : Number((grandCreditPoints / completedCredits).toFixed(2));
    
    let trend: TrendDirection = 'INSUFFICIENT_DATA';
    if (semesters.length >= 2) {
      const last = semesters[semesters.length - 1].sgpa;
      const prev = semesters[semesters.length - 2].sgpa;
      if (last > prev + 0.2) trend = 'IMPROVING';
      else if (last < prev - 0.2) trend = 'DECLINING';
      else trend = 'STABLE';
    }

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);

    return {
      semesters,
      cgpa,
      totalCredits,
      completedCredits,
      trend
    };
  }

  /**
   * Calculates the required future grade point to hit a target SGPA/CGPA.
   */
  public static calculateTarget(
    targetCGPA: number, 
    completedCredits: number, 
    currentCGPA: number | null, 
    remainingCredits: number,
    gradingSystem: string = '10_POINT'
  ): { possible: boolean, requiredAverageGradePoint: number, message: string } {
    
    if (remainingCredits <= 0) {
      return { 
        possible: false, 
        requiredAverageGradePoint: 0, 
        message: 'You have no remaining credits to change your CGPA.' 
      };
    }

    const currentPoints = (currentCGPA || 0) * completedCredits;
    const targetPoints = targetCGPA * (completedCredits + remainingCredits);
    const requiredPoints = targetPoints - currentPoints;
    
    const requiredAverage = requiredPoints / remainingCredits;
    
    const maxGradePoint = gradingSystem === '10_POINT' ? 10.0 : 4.0;

    if (requiredAverage > maxGradePoint) {
      return { 
        possible: false, 
        requiredAverageGradePoint: requiredAverage, 
        message: `That target is mathematically unreachable with the remaining credits. You would need an average grade point of ${requiredAverage.toFixed(2)}.` 
      };
    }
    
    if (requiredAverage <= 0) {
      return {
        possible: true,
        requiredAverageGradePoint: 0,
        message: `You have already achieved this mathematically, even if you score zero on the remaining credits.`
      };
    }

    return {
      possible: true,
      requiredAverageGradePoint: Number(requiredAverage.toFixed(2)),
      message: `You need to maintain an average grade point of ${requiredAverage.toFixed(2)} across your remaining ${remainingCredits} credits.`
    };
  }

  /**
   * Determines the Campus OS Academic Risk Indicator.
   */
  public static calculateAcademicRisk(
    cgpa: number | null,
    weakSubjectsCount: number,
    trend: TrendDirection,
    gradingSystem: string
  ): RiskLevel {
    if (cgpa === null) return 'SAFE';

    const safeThreshold = gradingSystem === '10_POINT' ? 7.5 : 3.0;
    const dangerThreshold = gradingSystem === '10_POINT' ? 6.0 : 2.0;

    if (cgpa < dangerThreshold || (cgpa < dangerThreshold + 0.5 && trend === 'DECLINING') || weakSubjectsCount >= 3) {
      return 'CRITICAL';
    }
    
    if (cgpa < safeThreshold || weakSubjectsCount >= 1 || trend === 'DECLINING') {
      return 'HIGH_RISK';
    }

    return 'SAFE';
  }

}
