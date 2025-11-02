import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Clock, Target, TrendingUp } from 'lucide-react';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export const StudyTimer = () => {
  const { i18n } = useTranslation();
  const [session, setSession] = useState(storage.getActiveSession());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(25); // Pomodoro default

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session?.isActive) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Update session
        const updatedSession = { ...session, duration: elapsed };
        storage.updateSession(updatedSession);
        
        // Check if target reached
        if (elapsed >= targetMinutes * 60) {
          toast.success(
            i18n.language === 'ar' 
              ? `🎉 رائع! أكملت ${targetMinutes} دقيقة من الدراسة`
              : `🎉 Great! You completed ${targetMinutes} minutes of study`
          );
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session, targetMinutes, i18n.language]);

  const startSession = () => {
    const newSession = storage.startStudySession();
    setSession(newSession);
    setElapsedTime(0);
    toast.success(i18n.language === 'ar' ? 'بدأت الجلسة الدراسية' : 'Study session started');
  };

  const pauseSession = () => {
    if (session) {
      const updatedSession = { ...session, isActive: false };
      setSession(updatedSession);
      storage.updateSession(updatedSession);
      toast.info(i18n.language === 'ar' ? 'تم إيقاف الجلسة مؤقتاً' : 'Session paused');
    }
  };

  const resumeSession = () => {
    if (session) {
      const updatedSession = { ...session, isActive: true };
      setSession(updatedSession);
      storage.updateSession(updatedSession);
      toast.success(i18n.language === 'ar' ? 'تم استئناف الجلسة' : 'Session resumed');
    }
  };

  const endSession = () => {
    const endedSession = storage.endStudySession();
    setSession(null);
    setElapsedTime(0);
    
    if (endedSession) {
      const minutes = Math.floor(endedSession.duration / 60);
      toast.success(
        i18n.language === 'ar'
          ? `تم إنهاء الجلسة! درست لمدة ${minutes} دقيقة`
          : `Session ended! You studied for ${minutes} minutes`
      );
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((elapsedTime / (targetMinutes * 60)) * 100, 100);

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold">
              {i18n.language === 'ar' ? 'مؤقت الدراسة' : 'Study Timer'}
            </h3>
          </div>
          {session && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              session.isActive 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {session.isActive 
                ? (i18n.language === 'ar' ? '🟢 نشط' : '🟢 Active')
                : (i18n.language === 'ar' ? '⏸️ موقف' : '⏸️ Paused')
              }
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatTime(elapsedTime)}
          </div>
          {session && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          {session && (
            <p className="text-sm text-muted-foreground mt-2">
              {i18n.language === 'ar' ? 'الهدف:' : 'Target:'} {targetMinutes} {i18n.language === 'ar' ? 'دقيقة' : 'minutes'}
            </p>
          )}
        </div>

        {/* Target Selector */}
        {!session && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {i18n.language === 'ar' ? 'حدد وقت الدراسة:' : 'Set study time:'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => setTargetMinutes(mins)}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    targetMinutes === mins
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {mins}{i18n.language === 'ar' ? 'د' : 'm'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Session Stats */}
        {session && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  {i18n.language === 'ar' ? 'المشاكل المحلولة' : 'Problems Solved'}
                </span>
              </div>
              <p className="text-2xl font-bold">{session.problemsSolved}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">
                  {i18n.language === 'ar' ? 'معدل السرعة' : 'Pace'}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {elapsedTime > 0 ? Math.floor(elapsedTime / Math.max(session.problemsSolved, 1) / 60) : 0}
                {i18n.language === 'ar' ? 'د/سؤال' : 'min/q'}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!session ? (
            <Button
              onClick={startSession}
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Play className="w-5 h-5 mr-2" />
              {i18n.language === 'ar' ? 'ابدأ الدراسة' : 'Start Session'}
            </Button>
          ) : (
            <>
              {session.isActive ? (
                <Button
                  onClick={pauseSession}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  {i18n.language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}
                </Button>
              ) : (
                <Button
                  onClick={resumeSession}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {i18n.language === 'ar' ? 'استئناف' : 'Resume'}
                </Button>
              )}
              <Button
                onClick={endSession}
                variant="destructive"
                className="flex-1 h-12"
              >
                <Square className="w-5 h-5 mr-2" />
                {i18n.language === 'ar' ? 'إنهاء' : 'End Session'}
              </Button>
            </>
          )}
        </div>

        {/* Pomodoro Tips */}
        {!session && (
          <div className="text-xs text-muted-foreground text-center">
            💡 {i18n.language === 'ar' 
              ? 'نصيحة: استخدم تقنية بومودورو (25 دقيقة دراسة + 5 دقائق راحة)'
              : 'Tip: Use Pomodoro technique (25 min study + 5 min break)'}
          </div>
        )}
      </div>
    </Card>
  );
};
