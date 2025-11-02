import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload as UploadIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/storage';

export const Upload = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    const profile = storage.getProfile();
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          imageBase64: selectedImage,
          language: i18n.language,
          grade: profile?.grade || 1,
        }
      });

      if (error) throw error;
      
      toast.success(t('success'));
      navigate('/results', { 
        state: { 
          result: data,
          imageUrl: selectedImage 
        } 
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('errorOccurred'));
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          <h1 className="text-3xl font-bold">{t('uploadYourImage')}</h1>
        </div>

        {/* Upload Area */}
        <Card className="p-8">
          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <UploadIcon className="w-16 h-16 mx-auto text-primary mb-4" />
              <p className="text-xl font-semibold mb-2">{t('dragDrop')}</p>
              <p className="text-muted-foreground mb-4">{t('or')}</p>
              <Button className="bg-gradient-to-r from-primary to-primary-light">
                {t('browse')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-auto rounded-xl shadow-lg"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleAnalyze}
                  className="flex-1 bg-gradient-to-r from-secondary to-secondary-light font-semibold"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('analyzing')}
                    </>
                  ) : (
                    t('analyze')
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </Card>

        {isAnalyzing && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div>
                <h3 className="text-xl font-bold">{t('analyzing')}</h3>
                <p className="text-muted-foreground">{t('analyzing_description')}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
