// filepath: src/components/StudyBuddyAI.tsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface StudentProfile {
  strengths: string[];
  weaknesses: string[];
  recentTopics: string[];
  studyPatterns: {
    preferredTime: string;
    averageSession: number;
    totalProblems: number;
  };
}

export const StudyBuddyAI = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadProfile();
    initializeChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadProfile = () => {
    const history = storage.getHistory();
    const stats = storage.getProgressStats();
    const sessions = storage.getStudySessions();

    // Analyze strengths and weaknesses based on subjects
    const subjectPerformance: any = {};
    history.forEach(item => {
      if (item.subject) {
        if (!subjectPerformance[item.subject]) {
          subjectPerformance[item.subject] = 0;
        }
        subjectPerformance[item.subject]++;
      }
    });

    const sortedSubjects = Object.entries(subjectPerformance)
      .sort(([, a]: any, [, b]: any) => b - a);

    const strengths = sortedSubjects.slice(0, 2).map(([subject]) => subject);
    const weaknesses = sortedSubjects.slice(-2).map(([subject]) => subject);

    // Analyze study patterns
    const studyHours = sessions.map(s => new Date(s.startTime).getHours());
    const avgHour = studyHours.length > 0 
      ? Math.round(studyHours.reduce((a, b) => a + b, 0) / studyHours.length)
      : 14;
    
    const preferredTime = avgHour < 12 ? 'morning' : avgHour < 18 ? 'afternoon' : 'evening';

    const recentTopics = [...new Set(
      history.slice(0, 10).map(item => item.subject).filter(Boolean)
    )] as string[];    const avgSessionTime = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0;

    setProfile({
      strengths,
      weaknesses,
      recentTopics,
      studyPatterns: {
        preferredTime,
        averageSession: avgSessionTime,
        totalProblems: history.length
      }
    });
  };

  const initializeChat = () => {
    const greeting: Message = {
      id: '1',
      role: 'assistant',
      content: isRTL
        ? 'مرحباً! أنا مساعدك الدراسي الذكي. لقد راجعت تقدمك وأنا هنا لمساعدتك على التحسن. ما الذي تريد العمل عليه اليوم؟'
        : 'Hi! I\'m your AI Study Buddy. I\'ve reviewed your progress and I\'m here to help you improve. What would you like to work on today?',
      timestamp: Date.now()
    };
    setMessages([greeting]);
  };

  const generateContextualPrompt = (userMessage: string) => {
    const context = profile ? `
Student Profile:
- Strengths: ${profile.strengths.join(', ') || 'Not enough data'}
- Areas to improve: ${profile.weaknesses.join(', ') || 'Not enough data'}
- Recent topics: ${profile.recentTopics.join(', ') || 'Various subjects'}
- Study pattern: Prefers ${profile.studyPatterns.preferredTime} sessions
- Total problems solved: ${profile.studyPatterns.totalProblems}

Act as a personalized tutor who knows the student's history. Provide encouraging, specific advice.
` : '';

    return `${context}\n\nStudent's question: ${userMessage}\n\nProvide a helpful, personalized response in ${i18n.language === 'ar' ? 'Arabic' : 'English'}.`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: {
          prompt: generateContextualPrompt(userMessage.content),
          language: i18n.language
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || (isRTL ? 'عذراً، حدث خطأ' : 'Sorry, an error occurred'),
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Fallback responses based on keywords
      const lowerInput = userMessage.content.toLowerCase();
      let fallbackResponse = '';

      if (lowerInput.includes('help') || lowerInput.includes('مساعدة')) {
        fallbackResponse = isRTL
          ? 'يمكنني مساعدتك في فهم المواضيع الصعبة، اقتراح خطط دراسية، وتحفيزك على التعلم. ما الموضوع الذي تحتاج المساعدة فيه؟'
          : 'I can help you understand difficult topics, suggest study plans, and motivate your learning. What subject do you need help with?';
      } else if (lowerInput.includes('math') || lowerInput.includes('رياضيات')) {
        fallbackResponse = isRTL
          ? 'الرياضيات رائعة! لقد حللت بالفعل عدة مسائل. ما هو الموضوع الذي تجده صعباً؟'
          : 'Math is great! You\'ve already solved several problems. Which topic do you find challenging?';
      } else if (profile && profile.weaknesses.length > 0) {
        fallbackResponse = isRTL
          ? `لاحظت أنك قد تحتاج مزيداً من التدريب في ${profile.weaknesses[0]}. هل تريد بعض التمارين؟`
          : `I noticed you might need more practice in ${profile.weaknesses[0]}. Would you like some exercises?`;
      } else {
        fallbackResponse = isRTL
          ? 'أخبرني المزيد عن ما تريد تعلمه، وسأساعدك!'
          : 'Tell me more about what you\'d like to learn, and I\'ll help you!';
      }

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    isRTL ? 'ما هي نقاط قوتي؟' : 'What are my strengths?',
    isRTL ? 'اقترح خطة دراسية لي' : 'Suggest a study plan',
    isRTL ? 'كيف أحسن في الرياضيات؟' : 'How can I improve in math?',
    isRTL ? 'ما المواضيع التي يجب أن أراجعها؟' : 'What topics should I review?'
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Bot className="w-8 h-8 text-primary" />
          {isRTL ? 'صديق الدراسة الذكي' : 'AI Study Buddy'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'مدرسك الشخصي الذي يعرف تقدمك ويساعدك على التحسن'
            : 'Your personal tutor who knows your progress and helps you improve'}
        </p>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">{isRTL ? 'نقاط القوة' : 'Strengths'}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.strengths.length > 0 ? (
                profile.strengths.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'حل المزيد من المسائل لتحديدها' : 'Solve more problems to identify'}
                </span>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">{isRTL ? 'للتحسين' : 'To Improve'}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.weaknesses.length > 0 ? (
                profile.weaknesses.map((w, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                    {w}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'جميع المجالات متوازنة' : 'All areas balanced'}
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Chat Area */}
      <Card className="flex flex-col h-[500px]">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Bot className="w-4 h-4 inline mr-2" />
                  )}
                  <span className="whitespace-pre-wrap">{message.content}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {isRTL ? 'أسئلة مقترحة:' : 'Suggested questions:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(q)}
                  className="text-xs"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isRTL ? 'اسأل سؤالاً...' : 'Ask a question...'}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 mt-4 bg-primary/5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">
              {isRTL ? 'كيف يساعدك صديق الدراسة؟' : 'How Study Buddy helps you'}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {isRTL ? 'يتذكر تقدمك ونقاط قوتك' : 'Remembers your progress and strengths'}</li>
              <li>• {isRTL ? 'يقترح مواضيع للمراجعة' : 'Suggests topics to review'}</li>
              <li>• {isRTL ? 'يوفر نصائح دراسية شخصية' : 'Provides personalized study tips'}</li>
              <li>• {isRTL ? 'يحفزك ويدعمك' : 'Motivates and supports you'}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
