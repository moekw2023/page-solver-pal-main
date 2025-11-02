import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { useState } from 'react';

export const History = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [historyItems, setHistoryItems] = useState(storage.getHistory());

  const handleDelete = (id: string) => {
    storage.deleteHistoryItem(id);
    setHistoryItems(storage.getHistory());
  };

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold">{t('myHistory')}</h1>
        </div>

        {/* History List */}
        {historyItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('noHistory')}</h3>
            <p className="text-muted-foreground mb-6">{t('startUploading')}</p>
            <Button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-primary to-primary-light"
            >
              {t('uploadImage')}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {historyItems.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-lg transition-all">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt="History item"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(item.timestamp).toLocaleDateString(i18n.language)}
                    </p>
                    <p className="font-semibold truncate">
                      {item.hasQuestions ? t('questions') : t('summary')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate('/results', { state: { historyItem: item } })}
                      variant="outline"
                      size="icon"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
