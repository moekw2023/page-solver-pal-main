// filepath: src/components/Achievements.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  BookOpen, 
  Calendar,
  Award,
  Medal,
  Crown,
  Sparkles
} from 'lucide-react';
import { storage } from '@/lib/storage';

interface Achievement {
  id: string;
  icon: any;
  title: string;
  description: string;
  condition: (stats: any) => boolean;
  progress: (stats: any) => number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const Achievements = () => {
  const { i18n } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>({});
  const isRTL = i18n.language === 'ar';

  const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
    {
      id: 'first_solution',
      icon: Star,
      title: isRTL ? 'البداية' : 'First Steps',
      description: isRTL ? 'حل أول مسألة' : 'Solve your first problem',
      condition: (s) => s.totalProblems >= 1,
      progress: (s) => Math.min(s.totalProblems, 1),
      maxProgress: 1,
      rarity: 'common'
    },
    {
      id: 'problem_solver_10',
      icon: Target,
      title: isRTL ? 'حلال المسائل' : 'Problem Solver',
      description: isRTL ? 'حل 10 مسائل' : 'Solve 10 problems',
      condition: (s) => s.totalProblems >= 10,
      progress: (s) => Math.min(s.totalProblems, 10),
      maxProgress: 10,
      rarity: 'common'
    },
    {
      id: 'problem_master_50',
      icon: Medal,
      title: isRTL ? 'خبير المسائل' : 'Problem Master',
      description: isRTL ? 'حل 50 مسألة' : 'Solve 50 problems',
      condition: (s) => s.totalProblems >= 50,
      progress: (s) => Math.min(s.totalProblems, 50),
      maxProgress: 50,
      rarity: 'rare'
    },
    {
      id: 'problem_legend_100',
      icon: Crown,
      title: isRTL ? 'أسطورة المسائل' : 'Problem Legend',
      description: isRTL ? 'حل 100 مسألة' : 'Solve 100 problems',
      condition: (s) => s.totalProblems >= 100,
      progress: (s) => Math.min(s.totalProblems, 100),
      maxProgress: 100,
      rarity: 'legendary'
    },
    {
      id: 'study_streak_7',
      icon: Zap,
      title: isRTL ? 'المتفاني' : 'Dedicated Student',
      description: isRTL ? '7 أيام متتالية من الدراسة' : '7 day study streak',
      condition: (s) => s.currentStreak >= 7,
      progress: (s) => Math.min(s.currentStreak, 7),
      maxProgress: 7,
      rarity: 'rare'
    },
    {
      id: 'study_time_10h',
      icon: BookOpen,
      title: isRTL ? 'عاشق التعلم' : 'Learning Enthusiast',
      description: isRTL ? '10 ساعات من الدراسة' : '10 hours of study time',
      condition: (s) => s.totalStudyMinutes >= 600,
      progress: (s) => Math.min(s.totalStudyMinutes, 600),
      maxProgress: 600,
      rarity: 'rare'
    },
    {
      id: 'all_subjects',
      icon: Sparkles,
      title: isRTL ? 'متعدد المواهب' : 'Multi-Talented',
      description: isRTL ? 'حل مسائل في 5 مواد مختلفة' : 'Solve problems in 5 different subjects',
      condition: (s) => Object.keys(s.subjectBreakdown || {}).length >= 5,
      progress: (s) => Math.min(Object.keys(s.subjectBreakdown || {}).length, 5),
      maxProgress: 5,
      rarity: 'epic'
    },
    {
      id: 'early_bird',
      icon: Calendar,
      title: isRTL ? 'الطائر المبكر' : 'Early Bird',
      description: isRTL ? 'ادرس قبل الساعة 8 صباحاً' : 'Study before 8 AM',
      condition: (s) => s.hasEarlyMorningStudy,
      progress: (s) => s.hasEarlyMorningStudy ? 1 : 0,
      maxProgress: 1,
      rarity: 'common'
    },
    {
      id: 'night_owl',
      icon: Award,
      title: isRTL ? 'بومة الليل' : 'Night Owl',
      description: isRTL ? 'ادرس بعد الساعة 10 مساءً' : 'Study after 10 PM',
      condition: (s) => s.hasLateNightStudy,
      progress: (s) => s.hasLateNightStudy ? 1 : 0,
      maxProgress: 1,
      rarity: 'common'
    },
    {
      id: 'perfect_week',
      icon: Trophy,
      title: isRTL ? 'أسبوع مثالي' : 'Perfect Week',
      description: isRTL ? 'ادرس كل يوم لمدة أسبوع' : 'Study every day for a week',
      condition: (s) => s.currentStreak >= 7,
      progress: (s) => Math.min(s.currentStreak, 7),
      maxProgress: 7,
      rarity: 'epic'
    }
  ];

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    const progressStats = storage.getProgressStats();
    const history = storage.getHistory();
    const sessions = storage.getStudySessions();

    // Calculate additional stats
    const currentStreak = calculateStreak(sessions);
    const hasEarlyMorningStudy = sessions.some(s => {
      const hour = new Date(s.startTime).getHours();
      return hour < 8;
    });
    const hasLateNightStudy = sessions.some(s => {
      const hour = new Date(s.startTime).getHours();
      return hour >= 22;
    });

    const enhancedStats = {
      ...progressStats,
      currentStreak,
      hasEarlyMorningStudy,
      hasLateNightStudy,
      totalProblems: history.length,
      totalStudyMinutes: progressStats.totalStudyTime
    };

    setStats(enhancedStats);

    // Load saved achievements
    const saved = localStorage.getItem('achievements');
    const savedAchievements = saved ? JSON.parse(saved) : {};

    // Check and update achievements
    const updated = achievementDefinitions.map(def => {
      const wasUnlocked = savedAchievements[def.id]?.unlocked || false;
      const isNowUnlocked = def.condition(enhancedStats);

      return {
        ...def,
        unlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked && !wasUnlocked ? Date.now() : savedAchievements[def.id]?.unlockedAt
      };
    });

    setAchievements(updated);

    // Save updated achievements
    const toSave = updated.reduce((acc, ach) => {
      acc[ach.id] = {
        unlocked: ach.unlocked,
        unlockedAt: ach.unlockedAt
      };
      return acc;
    }, {} as any);
    localStorage.setItem('achievements', JSON.stringify(toSave));
  };

  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = sessions
      .map(s => {
        const d = new Date(s.startTime);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    let streak = 0;
    let checkDate = today.getTime();

    for (const date of dates) {
      if (date === checkDate) {
        streak++;
        checkDate -= 86400000; // Subtract one day
      } else if (date < checkDate) {
        break;
      }
    }

    return streak;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
      case 'rare': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'epic': return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          {isRTL ? 'الإنجازات' : 'Achievements'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? `فتحت ${unlockedCount} من ${totalCount} إنجازات`
            : `Unlocked ${unlockedCount} of ${totalCount} achievements`
          }
        </p>
        <Progress value={(unlockedCount / totalCount) * 100} className="mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercent = (achievement.progress(stats) / achievement.maxProgress) * 100;

          return (
            <Card 
              key={achievement.id}
              className={`p-4 transition-all ${
                achievement.unlocked 
                  ? `border-2 ${getRarityBorder(achievement.rarity)} shadow-lg` 
                  : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <>
                      <Progress value={progressPercent} className="mb-1 h-2" />
                      <p className="text-xs text-muted-foreground">
                        {achievement.progress(stats)}/{achievement.maxProgress}
                      </p>
                    </>
                  )}

                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      ✓ {isRTL ? 'تم الفتح' : 'Unlocked'} {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}

                  <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
