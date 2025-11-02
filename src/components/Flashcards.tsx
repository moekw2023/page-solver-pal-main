// filepath: src/components/Flashcards.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { 
  CreditCard, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Trash2,
  Plus,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject?: string;
  createdAt: number;
  lastReviewed?: number;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const Flashcards = () => {
  const { i18n } = useTranslation();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = () => {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      setFlashcards(JSON.parse(saved));
    }
  };

  const saveFlashcards = (cards: Flashcard[]) => {
    localStorage.setItem('flashcards', JSON.stringify(cards));
    setFlashcards(cards);
  };

  const generateFromHistory = async () => {
    setIsGenerating(true);
    try {
      const history = storage.getHistory();
      const recentItems = history.slice(0, 5); // Last 5 solved problems
      
      const newCards: Flashcard[] = [];
      
      for (const item of recentItems) {
        if (item.result.hasQuestions && item.result.questions) {
          for (const q of item.result.questions) {
            // Generate variations using AI
            const { data, error } = await supabase.functions.invoke('generate-text', {
              body: {
                prompt: `Based on this Q&A, create 2 similar flashcard questions with answers:
Q: ${q.question}
A: ${q.answer}

Return as JSON: [{"question": "...", "answer": "..."}, ...]`,
                language: i18n.language
              }
            });

            if (!error && data) {
              try {
                const variations = JSON.parse(data.text);
                variations.forEach((v: any) => {
                  newCards.push({
                    id: `${Date.now()}-${Math.random()}`,
                    question: v.question,
                    answer: v.answer,
                    subject: item.subject,
                    createdAt: Date.now(),
                    reviewCount: 0,
                    difficulty: 'medium'
                  });
                });
              } catch (e) {
                // Fallback: use original question
                newCards.push({
                  id: `${Date.now()}-${Math.random()}`,
                  question: q.question,
                  answer: q.answer,
                  subject: item.subject,
                  createdAt: Date.now(),
                  reviewCount: 0,
                  difficulty: 'medium'
                });
              }
            }
          }
        }
      }

      if (newCards.length > 0) {
        saveFlashcards([...flashcards, ...newCards]);
        toast.success(isRTL ? `تم إنشاء ${newCards.length} بطاقة` : `Generated ${newCards.length} flashcards`);
      } else {
        toast.info(isRTL ? 'لا توجد مشاكل محلولة لإنشاء البطاقات' : 'No solved problems to generate from');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error(isRTL ? 'فشل إنشاء البطاقات' : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    saveFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success(isRTL ? 'تم خلط البطاقات' : 'Cards shuffled');
  };

  const handleMarkDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    const updated = [...flashcards];
    updated[currentIndex] = {
      ...updated[currentIndex],
      difficulty,
      lastReviewed: Date.now(),
      reviewCount: updated[currentIndex].reviewCount + 1
    };
    saveFlashcards(updated);
    handleNext();
  };

  const handleDelete = () => {
    const updated = flashcards.filter((_, i) => i !== currentIndex);
    saveFlashcards(updated);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success(isRTL ? 'تم حذف البطاقة' : 'Card deleted');
  };

  if (flashcards.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            {isRTL ? 'البطاقات التعليمية' : 'Flashcards'}
          </h1>
        </div>

        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">
            {isRTL ? 'لا توجد بطاقات تعليمية بعد' : 'No flashcards yet'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isRTL 
              ? 'إنشاء بطاقات تلقائياً من المشاكل المحلولة'
              : 'Generate flashcards automatically from solved problems'}
          </p>
          <Button onClick={generateFromHistory} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isRTL ? 'إنشاء البطاقات' : 'Generate Flashcards'}
          </Button>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          {isRTL ? 'البطاقات التعليمية' : 'Flashcards'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShuffle} size="sm">
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={generateFromHistory} disabled={isGenerating} size="sm">
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" onClick={handleDelete} size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 text-center text-sm text-muted-foreground">
        {isRTL ? `البطاقة ${currentIndex + 1} من ${flashcards.length}` : `Card ${currentIndex + 1} of ${flashcards.length}`}
      </div>

      <Card 
        className="p-12 mb-6 cursor-pointer hover:shadow-lg transition-all min-h-[300px] flex items-center justify-center perspective-1000"
        onClick={handleFlip}
      >
        <div className={`transition-all duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          {!isFlipped ? (
            <div className="text-center">
              <p className="text-xs uppercase text-muted-foreground mb-4">
                {isRTL ? 'السؤال' : 'Question'}
              </p>
              <p className="text-2xl font-semibold mb-6">{currentCard.question}</p>
              {currentCard.subject && (
                <span className="inline-block px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  {currentCard.subject}
                </span>
              )}
              <p className="text-sm text-muted-foreground mt-6">
                {isRTL ? 'اضغط لرؤية الإجابة' : 'Click to reveal answer'}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs uppercase text-muted-foreground mb-4">
                {isRTL ? 'الإجابة' : 'Answer'}
              </p>
              <p className="text-xl mb-6">{currentCard.answer}</p>
              <div className="flex gap-2 justify-center mt-8">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkDifficulty('easy');
                  }}
                >
                  {isRTL ? 'سهل' : 'Easy'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkDifficulty('medium');
                  }}
                >
                  {isRTL ? 'متوسط' : 'Medium'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-50 hover:bg-red-100 text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkDifficulty('hard');
                  }}
                >
                  {isRTL ? 'صعب' : 'Hard'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {isRTL ? 'السابق' : 'Previous'}
        </Button>
        
        <Button variant="ghost" onClick={handleFlip}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {isRTL ? 'قلب' : 'Flip'}
        </Button>

        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={flashcards.length <= 1}
        >
          {isRTL ? 'التالي' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          {isRTL ? 'عدد المراجعات: ' : 'Review count: '}{currentCard.reviewCount}
        </p>
      </div>
    </div>
  );
};
