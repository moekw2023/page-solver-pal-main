import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, User, Globe, Info, Moon, Sun, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const profile = storage.getProfile();
  const [name, setName] = useState(profile?.name || '');
  const [grade, setGrade] = useState(profile?.grade || 1);
  const [language, setLanguage] = useState(i18n.language);
  const [theme, setTheme] = useState<'light' | 'dark'>(storage.getTheme());

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSave = () => {
    storage.saveProfile({ name, grade });
    storage.saveLanguage(language);
    storage.saveTheme(theme);
    i18n.changeLanguage(language);
    toast.success(t('success'));
    navigate('/');
  };

  const handleClearHistory = () => {
    if (window.confirm(i18n.language === 'ar' ? 'هل أنت متأكد من حذف جميع السجلات؟' : 'Are you sure you want to clear all history?')) {
      storage.clearHistory();
      toast.success(i18n.language === 'ar' ? 'تم مسح السجل' : 'History cleared');
    }
  };

  const grades = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold">{t('mySettings')}</h1>
        </div>

        {/* Profile Section */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">{t('profile')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">{t('name')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">{t('grade')}</label>
              <div className="grid grid-cols-6 gap-2">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`h-12 rounded-lg font-bold transition-all ${
                      grade === g
                        ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-md scale-105'
                        : 'bg-muted hover:bg-muted-foreground/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Language Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-bold">{t('language')}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('ar')}
              className={`p-4 rounded-xl font-semibold text-lg transition-all ${
                language === 'ar'
                  ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-md'
                  : 'bg-muted hover:bg-muted-foreground/10'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl font-semibold text-lg transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-md'
                  : 'bg-muted hover:bg-muted-foreground/10'
              }`}
            >
              English
            </button>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
            </div>
            <h2 className="text-xl font-bold">
              {i18n.language === 'ar' ? 'المظهر' : 'Appearance'}
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-semibold">
                  {i18n.language === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'ar' ? 'حماية العينين في الليل' : 'Easier on the eyes at night'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </Card>

        {/* Data Management Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">
              {i18n.language === 'ar' ? 'إدارة البيانات' : 'Data Management'}
            </h2>
          </div>

          <Button
            onClick={handleClearHistory}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {i18n.language === 'ar' ? 'مسح جميع السجلات' : 'Clear All History'}
          </Button>
        </Card>

        {/* About Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">{t('about')}</h2>
          </div>
          <div className="pt-4">
            <p className="text-muted-foreground">{t('version')}: 1.0.0</p>
          </div>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary"
          size="lg"
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
};
