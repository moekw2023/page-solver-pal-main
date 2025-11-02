import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Volume2, VolumeX, Share2, Bookmark, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

interface Question {
  question: string;
  answer: string;
  steps?: string[];
}

interface AIResult {
  hasQuestions: boolean;
  questions?: Question[];
  summary?: string;
  suggestedQuestions?: Question[];
}

export const Results = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';
  
  // Check if we're viewing from history or a new result
  const historyItem = location.state?.historyItem;
  const [result] = useState<AIResult>(historyItem?.result || location.state?.result);
  const [imageUrl] = useState<string>(historyItem?.imageUrl || location.state?.imageUrl);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFromHistory] = useState<boolean>(!!historyItem);

  useEffect(() => {
    if (!result || !imageUrl) {
      navigate('/');
    }
  }, [result, imageUrl, navigate]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSave = () => {
    if (isFromHistory) {
      toast.info(i18n.language === 'ar' ? 'هذا العنصر محفوظ بالفعل' : 'Already saved in history');
      return;
    }
    
    const historyItem = {
      id: Date.now().toString(),
      imageUrl,
      timestamp: Date.now(),
      hasQuestions: result.hasQuestions,
      result
    };
    storage.saveHistory(historyItem);
    toast.success(t('success'));
  };

  const handleShare = async () => {
    const shareText = result.hasQuestions
      ? result.questions?.map(q => `${q.question}\n${q.answer}`).join('\n\n')
      : result.summary;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('solution'),
          text: shareText,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText || '');
      toast.success(t('success'));
    }
  };

  if (!result) return null;

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
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
              <Sparkles className="w-8 h-8 text-primary" />
              {result.hasQuestions ? t('solution') : t('summary')}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSave}
              variant={isFromHistory ? "default" : "outline"}
              size="icon"
              className={`rounded-full ${isFromHistory ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Bookmark className={`w-5 h-5 ${isFromHistory ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Image Preview */}
        <Card className="p-4">
          <img
            src={imageUrl}
            alt="Analyzed page"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </Card>

        {/* Results */}
        {result.hasQuestions && result.questions ? (
          <div className="space-y-6">
            {result.questions.map((q, idx) => (
              <Card key={idx} className="p-6 space-y-4 border-2 border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-bold">{q.question}</h3>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSpeak(q.answer)}
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {q.steps && q.steps.length > 0 && (
                  <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                    <p className="font-semibold text-sm text-muted-foreground uppercase">
                      {i18n.language === 'ar' ? 'خطوات الحل' : 'Solution Steps'}
                    </p>
                    {q.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {stepIdx + 1}
                        </div>
                        <p className="text-foreground pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 rounded-lg p-4">
                  <p className="font-semibold text-sm text-success mb-2">
                    {i18n.language === 'ar' ? '✓ الإجابة النهائية' : '✓ Final Answer'}
                  </p>
                  <p className="text-foreground text-lg">{q.answer}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                {t('summary')}
              </h3>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </Card>

            {result.suggestedQuestions && result.suggestedQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  {i18n.language === 'ar' ? 'أسئلة مقترحة' : 'Suggested Questions'}
                </h3>
                {result.suggestedQuestions.map((q, idx) => (
                  <Card key={idx} className="p-6 space-y-3 border-2 border-secondary/20">
                    <p className="font-bold text-lg">{q.question}</p>
                    <p className="text-muted-foreground">{q.answer}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => navigate('/upload')}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary"
          size="lg"
        >
          {t('tryAnother')}
        </Button>
      </div>
    </div>
  );
};
