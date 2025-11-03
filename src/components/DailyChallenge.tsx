import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Check, 
  Clock, 
  Flame,
  Trophy,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  date: string;
  title: string;
  description: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  completed: boolean;
  attempts: number;
}

export const DailyChallenge = () => {
  const { i18n } = useTranslation();
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const isRTL = i18n.language === 'ar';

  const challengeBank = [
    {
      title: isRTL ? 'حساب الجذور' : 'Square Root Calculation',
      description: isRTL ? 'أوجد الجذر التربيعي' : 'Find the square root',
      question: isRTL ? 'ما هو √144؟' : 'What is √144?',
      answer: '12',
      difficulty: 'easy' as const,
      points: 10
    },
    {
      title: isRTL ? 'حل المعادلة' : 'Solve the Equation',
      description: isRTL ? 'أوجد قيمة x' : 'Find the value of x',
      question: isRTL ? '2x + 5 = 15، ما قيمة x؟' : '2x + 5 = 15, what is x?',
      answer: '5',
      difficulty: 'easy' as const,
      points: 10
    },
    {
      title: isRTL ? 'النسبة المئوية' : 'Percentage Problem',
      description: isRTL ? 'احسب النسبة المئوية' : 'Calculate the percentage',
      question: isRTL ? 'ما هو 25% من 80؟' : 'What is 25% of 80?',
      answer: '20',
      difficulty: 'easy' as const,
      points: 10
    },
    {
      title: isRTL ? 'المعادلة التربيعية' : 'Quadratic Equation',
      description: isRTL ? 'أوجد الحل' : 'Find the solution',
      question: isRTL ? 'x² - 5x + 6 = 0، ما قيم x؟' : 'x² - 5x + 6 = 0, what are the values of x?',
      answer: '2,3',
      difficulty: 'medium' as const,
      points: 20
    },
    {
      title: isRTL ? 'المثلثات' : 'Triangles',
      description: isRTL ? 'احسب المساحة' : 'Calculate the area',
      question: isRTL ? 'مثلث قاعدته 10 وارتفاعه 6، ما مساحته؟' : 'A triangle has base 10 and height 6, what is its area?',
      answer: '30',
      difficulty: 'medium' as const,
      points: 20
    },
    {
      title: isRTL ? 'الأسس' : 'Exponents',
      description: isRTL ? 'احسب القوة' : 'Calculate the power',
      question: isRTL ? 'ما هو 2⁵؟' : 'What is 2⁵?',
      answer: '32',
      difficulty: 'easy' as const,
      points: 10
    },
    {
      title: isRTL ? 'المتوسط الحسابي' : 'Average',
      description: isRTL ? 'احسب المتوسط' : 'Calculate the average',
      question: isRTL ? 'ما متوسط الأعداد 4، 8، 12، 16؟' : 'What is the average of 4, 8, 12, 16?',
      answer: '10',
      difficulty: 'easy' as const,
      points: 10
    }
  ];

  useEffect(() => {
    loadDailyChallenge();
    loadStats();
  }, []);

  const loadDailyChallenge = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('dailyChallenges');
    const challenges = saved ? JSON.parse(saved) : {};

    if (challenges[today]) {
      setTodayChallenge(challenges[today]);
    } else {
      const dayIndex = new Date().getDate() % challengeBank.length;
      const challenge = challengeBank[dayIndex];
      
      const newChallenge: Challenge = {
        id: Date.now().toString(),
        date: today,
        ...challenge,
        completed: false,
        attempts: 0
      };

      challenges[today] = newChallenge;
      localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
      setTodayChallenge(newChallenge);
    }
  };

  const loadStats = () => {
    const stats = localStorage.getItem('challengeStats');
    if (stats) {
      const parsed = JSON.parse(stats);
      setStreak(parsed.streak || 0);
      setTotalPoints(parsed.totalPoints || 0);
    }
  };

  const saveStats = (newStreak: number, newPoints: number) => {
    localStorage.setItem('challengeStats', JSON.stringify({
      streak: newStreak,
      totalPoints: newPoints
    }));
  };

  const handleSubmit = () => {
    if (!todayChallenge || !userAnswer.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال إجابة' : 'Please enter an answer');
      return;
    }

    const normalizedAnswer = userAnswer.trim().toLowerCase().replace(/\s/g, '');
    const normalizedCorrect = todayChallenge.answer.toLowerCase().replace(/\s/g, '');

    const isCorrect = normalizedAnswer === normalizedCorrect;

    if (isCorrect) {
      const newStreak = streak + 1;
      const newPoints = totalPoints + todayChallenge.points;
      
      setStreak(newStreak);
      setTotalPoints(newPoints);
      saveStats(newStreak, newPoints);

      const saved = localStorage.getItem('dailyChallenges');
      const challenges = saved ? JSON.parse(saved) : {};
      challenges[todayChallenge.date] = {
        ...todayChallenge,
        completed: true,
        attempts: todayChallenge.attempts + 1
      };
      localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
      setTodayChallenge(challenges[todayChallenge.date]);

      toast.success(isRTL ? `صحيح! +${todayChallenge.points} نقطة` : `Correct! +${todayChallenge.points} points`, {
        icon: '🎉'
      });
    } else {
      const updated = {
        ...todayChallenge,
        attempts: todayChallenge.attempts + 1
      };
      setTodayChallenge(updated);

      const saved = localStorage.getItem('dailyChallenges');
      const challenges = saved ? JSON.parse(saved) : {};
      challenges[todayChallenge.date] = updated;
      localStorage.setItem('dailyChallenges', JSON.stringify(challenges));

      toast.error(isRTL ? 'إجابة خاطئة، حاول مرة أخرى' : 'Incorrect, try again');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const timeLeft = getTimeUntilMidnight();

  if (!todayChallenge) return null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          {isRTL ? 'التحدي اليومي' : 'Daily Challenge'}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-lg">{streak}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-lg">{totalPoints}</span>
          </div>
        </div>
      </div>

      <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {isRTL ? 'التحدي التالي في:' : 'Next challenge in:'}
            </span>
          </div>
          <span className="text-2xl font-bold">
            {timeLeft.hours}:{timeLeft.minutes.toString().padStart(2, '0')}
          </span>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{todayChallenge.title}</h2>
            <p className="text-muted-foreground">{todayChallenge.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(todayChallenge.difficulty)}`}>
              {todayChallenge.difficulty.toUpperCase()}
            </span>
            <span className="text-sm text-muted-foreground">
              {todayChallenge.points} {isRTL ? 'نقطة' : 'points'}
            </span>
          </div>
        </div>

        <div className="p-6 bg-muted rounded-lg mb-6">
          <p className="text-xl font-semibold text-center">
            {todayChallenge.question}
          </p>
        </div>

        {!todayChallenge.completed ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={isRTL ? 'أدخل إجابتك' : 'Enter your answer'}
                className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={todayChallenge.completed}
              />
              {todayChallenge.attempts > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL ? `المحاولات: ${todayChallenge.attempts}` : `Attempts: ${todayChallenge.attempts}`}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1" size="lg">
                {isRTL ? 'إرسال الإجابة' : 'Submit Answer'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAnswer(!showAnswer)}
                size="lg"
              >
                {showAnswer ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'تلميح' : 'Hint')}
              </Button>
            </div>

            {showAnswer && (
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <p className="text-sm">
                  <strong>{isRTL ? 'تلميح:' : 'Hint:'}</strong> {todayChallenge.description}
                </p>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-6 bg-green-50 dark:bg-green-950 border-2 border-green-500">
            <div className="text-center">
              <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold mb-2 text-green-700 dark:text-green-300">
                {isRTL ? 'أحسنت!' : 'Well Done!'}
              </h3>
              <p className="text-lg mb-4">
                {isRTL ? `لقد أكملت تحدي اليوم وحصلت على ${todayChallenge.points} نقطة!` 
                       : `You've completed today's challenge and earned ${todayChallenge.points} points!`}
              </p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="w-5 h-5" />
                <span>{isRTL ? 'عد غداً للتحدي التالي' : 'Come back tomorrow for the next challenge'}</span>
              </div>
            </div>
          </Card>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'سلسلة النجاح' : 'Current Streak'}</p>
              <p className="text-2xl font-bold">{streak} {isRTL ? 'يوم' : 'days'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'مجموع النقاط' : 'Total Points'}</p>
              <p className="text-2xl font-bold">{totalPoints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'المحاولات اليوم' : 'Today\'s Attempts'}</p>
              <p className="text-2xl font-bold">{todayChallenge.attempts}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
