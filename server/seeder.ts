import { prisma } from './db/prisma.js';

export async function seedRealisticDemoData(userId: string) {
  // Subjects
  const subjectsData = [
    { name: 'Data Structures & Algorithms', code: 'CS201', credits: 4, color: '#ef4444', instructor: 'Dr. Smith', room: 'Room 101' },
    { name: 'Database Management Systems', code: 'CS202', credits: 3, color: '#3b82f6', instructor: 'Prof. Johnson', room: 'Room 102' },
    { name: 'Python', code: 'CS203', credits: 3, color: '#10b981', instructor: 'Mr. Davis', room: 'Lab 1' },
    { name: 'Mathematics', code: 'MA101', credits: 4, color: '#f59e0b', instructor: 'Dr. White', room: 'Room 201' },
    { name: 'Computer Networks', code: 'CS204', credits: 4, color: '#8b5cf6', instructor: 'Dr. Brown', room: 'Room 103' }
  ];

  const createdSubjects = [];
  for (const s of subjectsData) {
    const sub = await prisma.subject.create({
      data: {
        userId,
        name: s.name,
        code: s.code,
        credits: s.credits,
        minimumAttendance: 75,
        targetAttendance: 85,
        color: s.color,
        instructor: s.instructor,
        room: s.room
      }
    });
    createdSubjects.push(sub);
  }

  const [dsa, dbms, python, math, cn] = createdSubjects;

  // Attendance targets: DSA: 82%, DBMS: 94%, Python: 91%, Math: 78%, CN: 86%
  const today = new Date();
  const generateAttendance = async (subjectId: string, totalClasses: number, presentClasses: number) => {
    const records = [];
    for (let i = 0; i < totalClasses; i++) {
      const d = new Date();
      d.setDate(today.getDate() - (totalClasses - i));
      records.push({
        userId,
        subjectId,
        date: d.toISOString(),
        status: i < presentClasses ? 'PRESENT' : 'ABSENT',
        classType: 'LECTURE',
        notes: ''
      });
    }
    await prisma.attendanceRecord.createMany({ data: records });
  };

  await generateAttendance(dsa.id, 50, 41); // 82%
  await generateAttendance(dbms.id, 50, 47); // 94%
  await generateAttendance(python.id, 45, 41); // ~91%
  await generateAttendance(math.id, 50, 39); // 78%
  await generateAttendance(cn.id, 50, 43); // 86%

  // Marks
  const marksData = [
    { subjectId: dsa.id, assessmentName: 'CT-1', assessmentType: 'CT', obtainedMarks: 17, maximumMarks: 20, date: new Date(today.getTime() - 30 * 86400000).toISOString() },
    { subjectId: dsa.id, assessmentName: 'Assignment', assessmentType: 'ASSIGNMENT', obtainedMarks: 18, maximumMarks: 20, date: new Date(today.getTime() - 15 * 86400000).toISOString() },
    { subjectId: dsa.id, assessmentName: 'Midterm', assessmentType: 'MID_TERM', obtainedMarks: 72, maximumMarks: 100, date: new Date(today.getTime() - 5 * 86400000).toISOString() },
    
    { subjectId: dbms.id, assessmentName: 'CT-1', assessmentType: 'CT', obtainedMarks: 16, maximumMarks: 20, date: new Date(today.getTime() - 28 * 86400000).toISOString() },
    { subjectId: dbms.id, assessmentName: 'Assignment', assessmentType: 'ASSIGNMENT', obtainedMarks: 19, maximumMarks: 20, date: new Date(today.getTime() - 12 * 86400000).toISOString() },
    { subjectId: dbms.id, assessmentName: 'Midterm', assessmentType: 'MID_TERM', obtainedMarks: 78, maximumMarks: 100, date: new Date(today.getTime() - 4 * 86400000).toISOString() },
    
    { subjectId: math.id, assessmentName: 'CT-1', assessmentType: 'CT', obtainedMarks: 12, maximumMarks: 20, date: new Date(today.getTime() - 25 * 86400000).toISOString() },
    { subjectId: math.id, assessmentName: 'Assignment', assessmentType: 'ASSIGNMENT', obtainedMarks: 15, maximumMarks: 20, date: new Date(today.getTime() - 10 * 86400000).toISOString() },
    { subjectId: math.id, assessmentName: 'Midterm', assessmentType: 'MID_TERM', obtainedMarks: 61, maximumMarks: 100, date: new Date(today.getTime() - 2 * 86400000).toISOString() }
  ];

  await prisma.mark.createMany({ data: marksData.map(m => ({ ...m, userId })) });

  // Assignments
  const assignmentsData = [
    { subjectId: dbms.id, title: 'DBMS Assignment', description: 'Complete ER diagrams', deadline: new Date(today.getTime() + 2 * 86400000).toISOString(), priority: 'HIGH', status: 'NOT_STARTED' },
    { subjectId: dsa.id, title: 'DSA Practice Set', description: 'Graphs and Trees', deadline: new Date(today.getTime() + 4 * 86400000).toISOString(), priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { subjectId: math.id, title: 'Mathematics Problem Sheet', description: 'Calculus problems', deadline: new Date(today.getTime() + 1 * 86400000).toISOString(), priority: 'HIGH', status: 'NOT_STARTED' },
    { subjectId: python.id, title: 'Python Mini Project', description: 'Build a web scraper', deadline: new Date(today.getTime() + 7 * 86400000).toISOString(), priority: 'LOW', status: 'NOT_STARTED' }
  ];

  await prisma.assignment.createMany({ data: assignmentsData.map(a => ({ ...a, userId })) });

  // Timetable
  const timetableData = [
    { subjectId: dsa.id, day: 'MONDAY', startTime: '09:00', endTime: '10:00', room: 'Room 101', instructor: 'Dr. Smith', classType: 'LECTURE' },
    { subjectId: dbms.id, day: 'MONDAY', startTime: '10:00', endTime: '11:00', room: 'Room 102', instructor: 'Prof. Johnson', classType: 'LECTURE' },
    { subjectId: math.id, day: 'MONDAY', startTime: '11:00', endTime: '12:00', room: 'Room 201', instructor: 'Dr. White', classType: 'LECTURE' },
    { subjectId: python.id, day: 'TUESDAY', startTime: '09:00', endTime: '11:00', room: 'Lab 1', instructor: 'Mr. Davis', classType: 'LAB' },
    { subjectId: cn.id, day: 'TUESDAY', startTime: '11:00', endTime: '12:00', room: 'Room 103', instructor: 'Dr. Brown', classType: 'LECTURE' },
    { subjectId: dsa.id, day: 'WEDNESDAY', startTime: '10:00', endTime: '11:00', room: 'Room 101', instructor: 'Dr. Smith', classType: 'LECTURE' },
    { subjectId: math.id, day: 'THURSDAY', startTime: '09:00', endTime: '10:00', room: 'Room 201', instructor: 'Dr. White', classType: 'LECTURE' },
    { subjectId: cn.id, day: 'FRIDAY', startTime: '09:00', endTime: '11:00', room: 'Lab 2', instructor: 'Dr. Brown', classType: 'LAB' }
  ];

  await prisma.timetableEntry.createMany({ data: timetableData.map(t => ({ ...t, userId })) });

  // Events
  const eventsData = [
    { title: 'Mid Semester Exams', type: 'EXAM', date: new Date(today.getTime() + 14 * 86400000).toISOString(), description: 'All subjects' },
    { title: 'Tech Fest', type: 'HOLIDAY', date: new Date(today.getTime() + 20 * 86400000).toISOString(), description: 'Annual tech fest' }
  ];

  await prisma.academicEvent.createMany({ data: eventsData.map(e => ({ ...e, userId })) });
}
