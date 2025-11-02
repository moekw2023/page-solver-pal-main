import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Camera, Upload, History, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const profile = storage.getProfile();
  const isRTL = i18n.language === 'ar';

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

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
};
