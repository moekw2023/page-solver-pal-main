export interface UserProfile {
  name: string;
  grade: number;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
  hasQuestions: boolean;
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
  }
};
