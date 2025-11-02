export interface UserProfile {
  name: string;
  grade: number;
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  problemsSolved: number;
  subject?: string;
  isActive: boolean;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
  hasQuestions: boolean;
  isFavorite?: boolean;
  subject?: string; // NEW: Math, Physics, Chemistry, etc.
  studySessionId?: string; // NEW: Link to study session
  result: {
    hasQuestions: boolean;
    questions?: Array<{
      question: string;
      answer: string;
      steps?: string[];
    }>;
    summary?: string;
    suggestedQuestions?: Array<{
      question: string;
      answer: string;
      steps?: string[];
    }>;
  };
}

export const storage = {
  // User Profile
  saveProfile(profile: UserProfile) {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  },

  getProfile(): UserProfile | null {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : null;
  },

  // Language
  saveLanguage(lang: string) {
    localStorage.setItem('language', lang);
  },

  getLanguage(): string {
    return localStorage.getItem('language') || 'ar';
  },

  // History
  saveHistory(item: HistoryItem) {
    const history = this.getHistory();
    history.unshift(item);
    localStorage.setItem('history', JSON.stringify(history.slice(0, 50))); // Keep last 50
  },

  getHistory(): HistoryItem[] {
    const data = localStorage.getItem('history');
    return data ? JSON.parse(data) : [];
  },

  deleteHistoryItem(id: string) {
    const history = this.getHistory().filter(item => item.id !== id);
    localStorage.setItem('history', JSON.stringify(history));
  },

  clearHistory() {
    localStorage.setItem('history', JSON.stringify([]));
  },

  // Favorites
  toggleFavorite(id: string) {
    const history = this.getHistory();
    const item = history.find(h => h.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      localStorage.setItem('history', JSON.stringify(history));
    }
  },

  getFavorites(): HistoryItem[] {
    return this.getHistory().filter(item => item.isFavorite);
  },

  // Theme
  saveTheme(theme: 'light' | 'dark') {
    localStorage.setItem('theme', theme);
  },

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  },

  // Study Sessions
  startStudySession(): StudySession {
    const session: StudySession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      duration: 0,
      problemsSolved: 0,
      isActive: true
    };
    localStorage.setItem('activeSession', JSON.stringify(session));
    return session;
  },

  getActiveSession(): StudySession | null {
    const data = localStorage.getItem('activeSession');
    return data ? JSON.parse(data) : null;
  },

  updateSession(session: StudySession) {
    localStorage.setItem('activeSession', JSON.stringify(session));
  },

  endStudySession(): StudySession | null {
    const session = this.getActiveSession();
    if (session) {
      session.endTime = Date.now();
      session.duration = Math.floor((session.endTime - session.startTime) / 1000);
      session.isActive = false;
      
      // Save to history
      const sessions = this.getStudySessions();
      sessions.unshift(session);
      localStorage.setItem('studySessions', JSON.stringify(sessions.slice(0, 100)));
      
      // Clear active session
      localStorage.removeItem('activeSession');
      return session;
    }
    return null;
  },

  getStudySessions(): StudySession[] {
    const data = localStorage.getItem('studySessions');
    return data ? JSON.parse(data) : [];
  },

  // Progress & Analytics
  getProgressStats() {
    const history = this.getHistory();
    const sessions = this.getStudySessions();
    
    const totalProblems = history.length;
    const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration, 0);
    
    // Problems by subject
    const bySubject: Record<string, number> = {};
    history.forEach(item => {
      const subject = item.subject || 'Uncategorized';
      bySubject[subject] = (bySubject[subject] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentProblems = history.filter(h => h.timestamp > sevenDaysAgo).length;
    const recentStudyTime = sessions
      .filter(s => s.startTime > sevenDaysAgo)
      .reduce((acc, s) => acc + s.duration, 0);

    return {
      totalProblems,
      totalStudyTime,
      bySubject,
      recentProblems,
      recentStudyTime,
      averagePerDay: recentProblems / 7,
      favoriteCount: history.filter(h => h.isFavorite).length
    };
  },

  // Subject categorization
  updateItemSubject(id: string, subject: string) {
    const history = this.getHistory();
    const item = history.find(h => h.id === id);
    if (item) {
      item.subject = subject;
      localStorage.setItem('history', JSON.stringify(history));
    }
  }
};
