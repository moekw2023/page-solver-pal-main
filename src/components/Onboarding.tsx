import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Sparkles, GraduationCap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(1);
  const isRTL = i18n.language === 'ar';

  const handleComplete = () => {
    if (name.trim()) {
      storage.saveProfile({ name: name.trim(), grade });
      onComplete();
    }
  };

  const grades = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md p-8 space-y-8 shadow-lg animate-in fade-in-50 duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('welcome')}
          </h1>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <label className="text-lg font-semibold text-foreground">
                {t('whatIsYourName')}
              </label>
              <Input
                type="text"
                placeholder={t('enterName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg h-12 border-2 focus:border-primary"
                autoFocus
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary-light hover:shadow-lg"
              size="lg"
            >
              {t('next')}
            </Button>
          </div>
        )}

        {/* Step 2: Grade */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                {t('whatsYourGrade')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`h-14 rounded-xl font-bold text-lg transition-all ${
                      grade === g
                        ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-md scale-105'
                        : 'bg-card hover:bg-muted border-2 border-border'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 h-12"
                size="lg"
              >
                {t('back')}
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-secondary to-secondary-light hover:shadow-lg"
                size="lg"
              >
                {t('letsStart')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
