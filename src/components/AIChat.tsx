import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2, Bot, User, Lightbulb, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatProps {
  problemContext: {
    question: string;
    answer: string;
    steps?: string[];
  };
  imageUrl?: string;
}

export const AIChat = ({ problemContext, imageUrl }: AIChatProps) => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: i18n.language === 'ar'
        ? 'مرحباً! لدي الحل أمامي. ماذا تريد أن تعرف أكثر؟'
        : 'Hi! I have the solution in front of me. What would you like to know more about?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const profile = storage.getProfile();
      
      // Build context for AI
      const context = `
Original Problem: ${problemContext.question}
Solution: ${problemContext.answer}
${problemContext.steps ? `Steps: ${problemContext.steps.join(', ')}` : ''}

Student's follow-up question: ${input}
`;

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          imageBase64: imageUrl || '',
          language: i18n.language,
          grade: profile?.grade || 1,
          chatContext: context,
          isFollowUp: true
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || (i18n.language === 'ar' 
          ? 'عذراً، حدث خطأ. حاول مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.'),
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback responses for common questions
      const lowerInput = input.toLowerCase();
      let response = '';
      
      if (lowerInput.includes('explain') || lowerInput.includes('why')) {
        response = i18n.language === 'ar'
          ? `دعني أشرح بطريقة مختلفة: ${problemContext.answer}. هل هذا أوضح؟`
          : `Let me explain differently: ${problemContext.answer}. Is this clearer?`;
      } else if (lowerInput.includes('example') || lowerInput.includes('another')) {
        response = i18n.language === 'ar'
          ? 'يمكنك استخدام زر "توليد تمارين للممارسة" في الأسفل للحصول على أمثلة مشابهة!'
          : 'You can use the "Generate Practice Problems" button below to get similar examples!';
      } else if (lowerInput.includes('step')) {
        const stepsText = problemContext.steps?.join('\n') || problemContext.answer;
        response = i18n.language === 'ar'
          ? `إليك الخطوات:\n${stepsText}`
          : `Here are the steps:\n${stepsText}`;
      } else {
        response = i18n.language === 'ar'
          ? 'أنا هنا للمساعدة! اطرح سؤالاً محدداً عن الحل.'
          : 'I\'m here to help! Ask a specific question about the solution.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    i18n.language === 'ar' ? 'لماذا استخدمنا هذه الطريقة؟' : 'Why did we use this method?',
    i18n.language === 'ar' ? 'اشرح الخطوة 2 بشكل مختلف' : 'Explain step 2 differently',
    i18n.language === 'ar' ? 'أعطني مثالاً آخر' : 'Give me another example',
    i18n.language === 'ar' ? 'ماذا لو غيرت الرقم؟' : 'What if I change the number?'
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl flex flex-col z-50 border-2 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-bold">
            {i18n.language === 'ar' ? 'اسأل المساعد' : 'Ask Assistant'}
          </h3>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
            <Lightbulb className="w-3 h-3" />
            <span>{i18n.language === 'ar' ? 'أسئلة مقترحة:' : 'Suggested:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 2).map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={i18n.language === 'ar' ? 'اطرح سؤالاً...' : 'Ask a question...'}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
