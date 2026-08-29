import {
  User,
  Subject,
  AttendanceRecord,
  Mark,
  Assignment,
  TimetableEntry,
  AcademicEvent,
  UserSettings,
  DashboardData,
  SubjectAttendanceIntelligence,
  SubjectPerformanceAnalytics,
  ActionRecommendation,
  AppNotification
} from '../types';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Rely on HTTP-only cookies instead of localStorage for authentication
    this.token = null;
  }

  public setToken(token: string | null) {
    this.token = token;
    // Local storage persistence removed for security; relying on secure HTTP-only cookies
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Ensure we don't have double slashes like /api//health which causes Vercel 308 redirects (breaking CORS preflight)
    const baseUrl = 'https://campus-os-pi.vercel.app/api';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Always send secure HTTP-only cookies
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Health
  public async getHealth() {
    return this.request<{ status: string; database: string }>('/health');
  }

  // Auth
  public async register(payload: any) {
    const res = await this.request<{ user: User; token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public async login(payload: any) {
    const res = await this.request<{ user: User; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public async startDemo() {
    const res = await this.request<{ user: User; token?: string; isDemo: boolean }>('/auth/demo', {
      method: 'POST'
    });
    this.setToken(res.token || null);
    return res;
  }

  public async forgotPassword(email: string) {
    return await this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public async resetPassword(token: string, password: string) {
    return await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  }

  public async exchangeTokenForCookie(token: string) {
    const res = await this.request<{ message: string }>('/auth/session', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    this.setToken(token);
    return res;
  }

  public async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  public async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Dashboard
  public async getDashboard() {
    return this.request<DashboardData>('/dashboard');
  }

  // Subjects
  public async getSubjects() {
    return this.request<Subject[]>('/subjects');
  }

  public async createSubject(payload: Partial<Subject>) {
    return this.request<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateSubject(id: string, payload: Partial<Subject>) {
    return this.request<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async deleteSubject(id: string) {
    return this.request<{ message: string }>(`/subjects/${id}`, {
      method: 'DELETE'
    });
  }

  // Attendance
  public async getAttendance(subjectId?: string) {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return this.request<AttendanceRecord[]>(`/attendance${query}`);
  }

  public async logAttendance(payload: { subjectId: string; date: string; status: string; classType?: string; notes?: string }) {
    return this.request<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async deleteAttendance(id: string) {
    return this.request<{ message: string }>(`/attendance/${id}`, {
      method: 'DELETE'
    });
  }

  public async getSubjectAttendanceAnalytics(subjectId: string) {
    return this.request<SubjectAttendanceIntelligence>(`/attendance/${subjectId}/analytics`);
  }

  // Marks
  public async getMarks(subjectId?: string) {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return this.request<Mark[]>(`/marks${query}`);
  }

  public async createMark(payload: Partial<Mark>) {
    return this.request<Mark>('/marks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateMark(id: string, payload: Partial<Mark>) {
    return this.request<Mark>(`/marks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async deleteMark(id: string) {
    return this.request<{ message: string }>(`/marks/${id}`, {
      method: 'DELETE'
    });
  }

  // Assignments
  public async getAssignments() {
    return this.request<Assignment[]>('/assignments');
  }

  public async createAssignment(payload: Partial<Assignment>) {
    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateAssignment(id: string, payload: Partial<Assignment>) {
    return this.request<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async deleteAssignment(id: string) {
    return this.request<{ message: string }>(`/assignments/${id}`, {
      method: 'DELETE'
    });
  }

  // Timetable
  public async getTimetable() {
    return this.request<TimetableEntry[]>('/timetable');
  }

  public async createTimetableEntry(payload: Partial<TimetableEntry>) {
    return this.request<TimetableEntry>('/timetable', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateTimetableEntry(id: string, payload: Partial<TimetableEntry>) {
    return this.request<TimetableEntry>(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async deleteTimetableEntry(id: string) {
    return this.request<{ message: string }>(`/timetable/${id}`, {
      method: 'DELETE'
    });
  }

  // Events (Calendar)
  public async getEvents() {
    return this.request<AcademicEvent[]>('/events');
  }

  public async createEvent(payload: Partial<AcademicEvent>) {
    return this.request<AcademicEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateEvent(id: string, payload: Partial<AcademicEvent>) {
    return this.request<AcademicEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async deleteEvent(id: string) {
    return this.request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics & Recommendations
  public async getAttendanceAnalytics() {
    return this.request<{ overall: any; subjects: SubjectAttendanceIntelligence[] }>('/analytics/attendance');
  }

  public async getPerformanceAnalytics() {
    return this.request<{ performances: SubjectPerformanceAnalytics[]; weakestSubject?: SubjectPerformanceAnalytics }>('/analytics/performance');
  }

  public async getSGPAAnalytics() {
    return this.request<{ sgpa: number; performances: SubjectPerformanceAnalytics[] }>('/analytics/sgpa');
  }



  // Notifications
  public async getNotifications() {
    return this.request<AppNotification[]>('/notifications');
  }

  public async dismissNotification(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/dismiss`, {
      method: 'POST'
    });
  }

  // Recommendations
  public async getRecommendations() {
    return this.request<ActionRecommendation[]>('/recommendations');
  }

  public async dismissRecommendation(id: string) {
    return this.request<{ success: boolean }>(`/recommendations/${id}/dismiss`, {
      method: 'POST'
    });
  }

  // Settings
  public async getSettings() {
    return this.request<UserSettings>('/settings');
  }

  public async updateSettings(payload: Partial<UserSettings>) {
    return this.request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Export & Import
  public async exportData() {
    return this.request<any>('/export');
  }

  public async importData(payload: { subjects?: any[]; attendance?: any[]; marks?: any[]; assignments?: any[] }) {
    return this.request<{ message: string; stats: any }>('/import', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Delete Account
  public async deleteAccount(confirmation: string) {
    const res = await this.request<{ message: string }>('/account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation })
    });
    this.setToken(null);
    return res;
  }
}

export const api = new ApiClient();
