import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Volume2, VolumeX, Share2, Bookmark, Sparkles, Download, Lightbulb, Loader2, Copy } from 'lucide-react';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [explanationLevel, setExplanationLevel] = useState<'simple' | 'detailed' | 'expert'>('detailed');
  const [showPractice, setShowPractice] = useState(false);
  const [practiceProblems, setPracticeProblems] = useState<Question[]>([]);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);

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

  const handleCopyAll = async () => {
    let text = '';
    if (result.hasQuestions && result.questions) {
      text = result.questions.map((q, idx) => {
        let content = `Question ${idx + 1}: ${q.question}\n\n`;
        if (q.steps && q.steps.length > 0) {
          content += 'Steps:\n' + q.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n';
        }
        content += `Answer: ${q.answer}\n`;
        return content;
      }).join('\n---\n\n');
    } else {
      text = result.summary || '';
    }
    
    await navigator.clipboard.writeText(text);
    toast.success(i18n.language === 'ar' ? 'تم النسخ' : 'Copied to clipboard');
  };

  const handleExportPDF = async () => {
    try {
      // Create a formatted text version
      let content = `${result.hasQuestions ? 'Solutions' : 'Summary'}\n${'='.repeat(50)}\n\n`;
      
      if (result.hasQuestions && result.questions) {
        result.questions.forEach((q, idx) => {
          content += `Question ${idx + 1}:\n${q.question}\n\n`;
          if (q.steps && q.steps.length > 0) {
            content += 'Steps:\n';
            q.steps.forEach((s, i) => {
              content += `  ${i + 1}. ${s}\n`;
            });
            content += '\n';
          }
          content += `Answer:\n${q.answer}\n\n${'='.repeat(50)}\n\n`;
        });
      } else {
        content += result.summary + '\n';
      }

      // Create and download as text file (PDF generation would require additional library)
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solution-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(i18n.language === 'ar' ? 'تم التصدير' : 'Exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('errorOccurred'));
    }
  };

  const handleGeneratePractice = async () => {
    if (!result.questions || result.questions.length === 0) {
      toast.error(i18n.language === 'ar' ? 'لا توجد أسئلة لتوليد تمارين' : 'No questions to generate practice from');
      return;
    }

    setIsGeneratingPractice(true);
    const profile = storage.getProfile();

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          imageBase64: imageUrl,
          language: i18n.language,
          grade: profile?.grade || 1,
          generatePractice: true,
          originalQuestions: result.questions
        }
      });

      if (error) throw error;

      setPracticeProblems(data.questions || []);
      setShowPractice(true);
      toast.success(i18n.language === 'ar' ? 'تم توليد التمارين' : 'Practice problems generated');
    } catch (error) {
      console.error('Practice generation error:', error);
      // Generate some sample practice problems as fallback
      const sampleProblems: Question[] = result.questions.slice(0, 3).map((q, idx) => ({
        question: `${i18n.language === 'ar' ? 'تمرين' : 'Practice'} ${idx + 1}: ${q.question}`,
        answer: i18n.language === 'ar' ? 'حاول حل هذا التمرين بنفسك' : 'Try to solve this on your own',
        steps: []
      }));
      setPracticeProblems(sampleProblems);
      setShowPractice(true);
      toast.info(i18n.language === 'ar' ? 'تمارين تجريبية' : 'Sample practice problems');
    } finally {
      setIsGeneratingPractice(false);
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
              onClick={handleCopyAll}
              variant="outline"
              size="icon"
              className="rounded-full"
              title={i18n.language === 'ar' ? 'نسخ الكل' : 'Copy All'}
            >
              <Copy className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="icon"
              className="rounded-full"
              title={i18n.language === 'ar' ? 'تصدير' : 'Export'}
            >
              <Download className="w-5 h-5" />
            </Button>
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

        {/* Explanation Level Selector */}
        {result.hasQuestions && (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span className="font-semibold">
                  {i18n.language === 'ar' ? 'مستوى الشرح:' : 'Explanation Level:'}
                </span>
              </div>
              <Select value={explanationLevel} onValueChange={(value: any) => setExplanationLevel(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">
                    {i18n.language === 'ar' ? '🟢 بسيط' : '🟢 Simple'}
                  </SelectItem>
                  <SelectItem value="detailed">
                    {i18n.language === 'ar' ? '🟡 مفصل' : '🟡 Detailed'}
                  </SelectItem>
                  <SelectItem value="expert">
                    {i18n.language === 'ar' ? '🔴 خبير' : '🔴 Expert'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {explanationLevel === 'simple' && (i18n.language === 'ar' ? 'شرح مبسط للمبتدئين' : 'Simplified for beginners')}
              {explanationLevel === 'detailed' && (i18n.language === 'ar' ? 'شرح مفصل مع الخطوات' : 'Detailed with steps')}
              {explanationLevel === 'expert' && (i18n.language === 'ar' ? 'شرح متقدم للخبراء' : 'Advanced for experts')}
            </p>
          </Card>
        )}

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

        {/* Practice Problems Button */}
        {result.hasQuestions && !showPractice && (
          <Button
            onClick={handleGeneratePractice}
            disabled={isGeneratingPractice}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500"
            size="lg"
          >
            {isGeneratingPractice ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {i18n.language === 'ar' ? 'جاري التوليد...' : 'Generating...'}
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5 mr-2" />
                {i18n.language === 'ar' ? 'توليد تمارين للممارسة' : 'Generate Practice Problems'}
              </>
            )}
          </Button>
        )}

        {/* Practice Problems Section */}
        {showPractice && practiceProblems.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-purple-600" />
                {i18n.language === 'ar' ? 'تمارين للممارسة' : 'Practice Problems'}
              </h2>
              <Button
                onClick={() => setShowPractice(false)}
                variant="outline"
                size="sm"
              >
                {i18n.language === 'ar' ? 'إخفاء' : 'Hide'}
              </Button>
            </div>
            <div className="space-y-4">
              {practiceProblems.map((problem, idx) => (
                <Card key={idx} className="p-4 bg-white dark:bg-gray-800">
                  <p className="font-semibold text-lg mb-2">{problem.question}</p>
                  <details className="text-sm text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground font-semibold">
                      {i18n.language === 'ar' ? '👁️ إظهار الحل' : '👁️ Show Solution'}
                    </summary>
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      {problem.steps && problem.steps.length > 0 && (
                        <div className="mb-2">
                          {problem.steps.map((step, stepIdx) => (
                            <p key={stepIdx} className="mb-1">
                              {stepIdx + 1}. {step}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        {i18n.language === 'ar' ? 'الإجابة:' : 'Answer:'} {problem.answer}
                      </p>
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
