import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trash2, Eye, Image as ImageIcon, Star, Search, Filter, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Other'];
const SUBJECT_COLORS: Record<string, string> = {
  Math: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Physics: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Chemistry: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Biology: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  English: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  History: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  Geography: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:teal-pink-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
};

export const History = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [historyItems, setHistoryItems] = useState(storage.getHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'questions' | 'summary'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const handleDelete = (id: string) => {
    storage.deleteHistoryItem(id);
    setHistoryItems(storage.getHistory());
  };

  const handleToggleFavorite = (id: string) => {
    storage.toggleFavorite(id);
    setHistoryItems(storage.getHistory());
  };

  const handleSetSubject = (id: string, subject: string) => {
    storage.updateItemSubject(id, subject);
    setHistoryItems(storage.getHistory());
  };

  const filteredItems = useMemo(() => {
    let items = historyItems;

    // Filter by type
    if (filterType === 'favorites') {
      items = items.filter(item => item.isFavorite);
    } else if (filterType === 'questions') {
      items = items.filter(item => item.hasQuestions);
    } else if (filterType === 'summary') {
      items = items.filter(item => !item.hasQuestions);
    }

    // Filter by subject
    if (filterSubject !== 'all') {
      items = items.filter(item => item.subject === filterSubject);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const hasMatchInQuestions = item.result.questions?.some(q => 
          q.question.toLowerCase().includes(query) || 
          q.answer.toLowerCase().includes(query)
        );
        const hasMatchInSummary = item.result.summary?.toLowerCase().includes(query);
        const hasMatchInSubject = item.subject?.toLowerCase().includes(query);
        return hasMatchInQuestions || hasMatchInSummary || hasMatchInSubject;
      });
    }

    return items;
  }, [historyItems, searchQuery, filterType, filterSubject]);

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

        {/* Search and Filter */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={i18n.language === 'ar' ? 'ابحث في السجل...' : 'Search history...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {i18n.language === 'ar' ? 'الكل' : 'All'}
              </SelectItem>
              <SelectItem value="favorites">
                {i18n.language === 'ar' ? 'المفضلة' : 'Favorites'}
              </SelectItem>
              <SelectItem value="questions">
                {i18n.language === 'ar' ? 'الأسئلة' : 'Questions'}
              </SelectItem>
              <SelectItem value="summary">
                {i18n.language === 'ar' ? 'الملخصات' : 'Summaries'}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger>
              <Tag className="w-4 h-4 mr-2" />
              <SelectValue placeholder={i18n.language === 'ar' ? 'المادة' : 'Subject'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {i18n.language === 'ar' ? 'كل المواد' : 'All Subjects'}
              </SelectItem>
              {SUBJECTS.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* History List */}
        {filteredItems.length === 0 && historyItems.length === 0 ? (
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
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {i18n.language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
            </h3>
            <p className="text-muted-foreground">
              {i18n.language === 'ar' ? 'جرب مصطلح بحث مختلف' : 'Try a different search term'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
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
                    <div className="flex gap-2 mt-2">
                      <Select value={item.subject} onValueChange={(value: any) => handleSetSubject(item.id, value)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map(subject => (
                            <SelectItem key={subject} value={subject}>
                              {i18n.language === 'ar' ? t(subject) : subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className={`px-2 py-1 rounded-full text-xs ${SUBJECT_COLORS[item.subject]}`}>
                        {i18n.language === 'ar' ? t(item.subject) : item.subject}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleFavorite(item.id)}
                      variant={item.isFavorite ? "default" : "outline"}
                      size="icon"
                      className={item.isFavorite ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
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
