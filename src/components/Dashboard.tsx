import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Clock, BookOpen, Star, Award, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

export const Dashboard = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const stats = storage.getProgressStats();
  const recentSessions = storage.getStudySessions().slice(0, 5);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return i18n.language === 'ar' ? `${hours} ساعة ${minutes} دقيقة` : `${hours}h ${minutes}m`;
    }
    return i18n.language === 'ar' ? `${minutes} دقيقة` : `${minutes} minutes`;
  };

  const topSubjects = Object.entries(stats.bySubject)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            {i18n.language === 'ar' ? 'لوحة التقدم' : 'Progress Dashboard'}
          </h1>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stats.totalProblems}
            </p>
            <p className="text-sm text-muted-foreground">
              {i18n.language === 'ar' ? 'مشاكل محلولة' : 'Problems Solved'}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {Math.floor(stats.totalStudyTime / 3600)}h
            </p>
            <p className="text-sm text-muted-foreground">
              {i18n.language === 'ar' ? 'وقت الدراسة الكلي' : 'Total Study Time'}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-600" />
              <Star className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats.recentProblems}
            </p>
            <p className="text-sm text-muted-foreground">
              {i18n.language === 'ar' ? 'هذا الأسبوع' : 'This Week'}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {stats.favoriteCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {i18n.language === 'ar' ? 'المفضلة' : 'Favorites'}
            </p>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Subject Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {i18n.language === 'ar' ? 'المواد' : 'Subjects'}
            </h3>
            {topSubjects.length > 0 ? (
              <div className="space-y-3">
                {topSubjects.map(([subject, count]) => {
                  const percentage = (count / stats.totalProblems) * 100;
                  return (
                    <div key={subject}>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{subject}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {i18n.language === 'ar' 
                  ? 'لا توجد بيانات بعد. ابدأ بحل المشاكل!'
                  : 'No data yet. Start solving problems!'}
              </p>
            )}
          </Card>

          {/* Recent Sessions */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {i18n.language === 'ar' ? 'الجلسات الأخيرة' : 'Recent Sessions'}
            </h3>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {formatDuration(session.duration)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString(i18n.language)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{session.problemsSolved}</p>
                      <p className="text-xs text-muted-foreground">
                        {i18n.language === 'ar' ? 'مشاكل' : 'problems'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {i18n.language === 'ar'
                  ? 'لم تبدأ أي جلسة دراسية بعد'
                  : 'No study sessions yet'}
              </p>
            )}
          </Card>
        </div>

        {/* Daily Average */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {i18n.language === 'ar' ? 'المعدل اليومي' : 'Daily Average'}
              </h3>
              <p className="text-muted-foreground">
                {i18n.language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">
                {stats.averagePerDay.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'مشاكل/يوم' : 'problems/day'}
              </p>
            </div>
          </div>
        </Card>

        {/* Motivational Message */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h3 className="text-xl font-bold mb-2">
              {stats.totalProblems >= 100
                ? (i18n.language === 'ar' ? '🌟 عمل رائع!' : '🌟 Amazing Work!')
                : stats.totalProblems >= 50
                ? (i18n.language === 'ar' ? '🔥 مستمر بشكل رائع!' : '🔥 Keep It Up!')
                : stats.totalProblems >= 10
                ? (i18n.language === 'ar' ? '💪 بداية قوية!' : '💪 Great Start!')
                : (i18n.language === 'ar' ? '🚀 لنبدأ!' : '🚀 Let\'s Go!')
              }
            </h3>
            <p className="text-muted-foreground">
              {i18n.language === 'ar'
                ? 'استمر في التعلم! كل مشكلة تحلها تجعلك أقوى.'
                : 'Keep learning! Every problem you solve makes you stronger.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
