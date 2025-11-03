import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Camera, Upload, History, Settings, Sparkles, TrendingUp, Clock, CreditCard, Users, Trophy, Target, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudyTimer } from './StudyTimer';
import { VoiceInput } from './VoiceInput';
import { useState } from 'react';
import { toast } from 'sonner';

export const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const profile = storage.getProfile();
  const isRTL = i18n.language === 'ar';
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleVoiceTranscript = (text: string) => {
    // Store the voice transcript for processing
    sessionStorage.setItem('voiceQuery', text);
    toast.success(isRTL ? 'تم تحويل الصوت، جاري المعالجة...' : 'Voice converted, processing...');
    // Navigate to upload page which can handle voice queries
    navigate('/upload');
  };

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-light to-secondary flex items-center justify-center shadow-xl animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            {t('hello')} {profile?.name}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('grade')} {profile?.grade}
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-primary"
                onClick={() => navigate('/upload')}>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t('uploadImage')}</h3>
                <p className="text-muted-foreground">{t('uploadDescription')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-secondary"
                onClick={() => navigate('/camera')}>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t('takePhoto')}</h3>
                <p className="text-muted-foreground">{t('uploadDescription')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Voice Input Section */}
        <div>
          <Button
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            variant={showVoiceInput ? "default" : "outline"}
            className="w-full mb-4"
            size="lg"
          >
            {showVoiceInput 
              ? (isRTL ? 'إخفاء الإدخال الصوتي' : 'Hide Voice Input')
              : (isRTL ? 'استخدم صوتك لطرح سؤال' : 'Use Voice to Ask a Question')
            }
          </Button>
          {showVoiceInput && <VoiceInput onTranscript={handleVoiceTranscript} />}
        </div>

        {/* Study Timer */}
        <StudyTimer />

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/10"
          >
            <TrendingUp className="w-6 h-6 mr-2" />
            {i18n.language === 'ar' ? 'التقدم' : 'Progress'}
          </Button>
          <Button
            onClick={() => navigate('/history')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-accent hover:bg-accent/10"
          >
            <History className="w-6 h-6 mr-2" />
            {t('history')}
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-accent hover:bg-accent/10"
          >
            <Settings className="w-6 h-6 mr-2" />
            {t('settings')}
          </Button>
          <Button
            onClick={() => navigate('/flashcards')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-purple-500 hover:bg-purple-500/10"
          >
            <CreditCard className="w-6 h-6 mr-2" />
            {isRTL ? 'البطاقات' : 'Flashcards'}
          </Button>
          <Button
            onClick={() => navigate('/study-groups')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-blue-500 hover:bg-blue-500/10"
          >
            <Users className="w-6 h-6 mr-2" />
            {isRTL ? 'المجموعات' : 'Groups'}
          </Button>
        </div>

        {/* Tier 4: Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={() => navigate('/achievements')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-yellow-500 hover:bg-yellow-500/10"
          >
            <Trophy className="w-6 h-6 mr-2" />
            {isRTL ? 'الإنجازات' : 'Achievements'}
          </Button>
          <Button
            onClick={() => navigate('/daily-challenge')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-orange-500 hover:bg-orange-500/10"
          >
            <Target className="w-6 h-6 mr-2" />
            {isRTL ? 'التحدي اليومي' : 'Daily Challenge'}
          </Button>
          <Button
            onClick={() => navigate('/study-buddy')}
            variant="outline"
            size="lg"
            className="h-20 text-lg font-semibold border-2 hover:border-indigo-500 hover:bg-indigo-500/10"
          >
            <Bot className="w-6 h-6 mr-2" />
            {isRTL ? 'صديق الدراسة' : 'Study Buddy'}
          </Button>
        </div>
      </div>
    </div>
  );
};
