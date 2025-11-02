// filepath: src/components/VoiceInput.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error(isRTL ? 'الرجاء السماح بالوصول إلى الميكروفون' : 'Please allow microphone access');
        } else if (event.error === 'no-speech') {
          toast.info(isRTL ? 'لم يتم اكتشاف صوت' : 'No speech detected');
        } else {
          toast.error(isRTL ? 'خطأ في التعرف على الصوت' : 'Speech recognition error');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
      toast.error(isRTL ? 'المتصفح لا يدعم التعرف على الصوت' : 'Browser does not support speech recognition');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [i18n.language]);

  const startListening = () => {
    if (!recognition) return;
    
    try {
      setTranscript('');
      recognition.start();
      setIsListening(true);
      toast.info(isRTL ? 'جاري الاستماع...' : 'Listening...');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
    
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      toast.success(isRTL ? 'تم تحويل الصوت إلى نص' : 'Voice converted to text');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="text-center text-sm text-muted-foreground">
          <MicOff className="w-6 h-6 mx-auto mb-2" />
          <p>{isRTL ? 'التعرف على الصوت غير مدعوم في هذا المتصفح' : 'Voice recognition not supported in this browser'}</p>
          <p className="text-xs mt-1">
            {isRTL ? 'جرب Chrome أو Edge' : 'Try Chrome or Edge'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {isRTL ? 'الإدخال الصوتي' : 'Voice Input'}
            </span>
          </div>
          <Button
            onClick={toggleListening}
            variant={isListening ? 'destructive' : 'default'}
            size="sm"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                {isRTL ? 'إيقاف' : 'Stop'}
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                {isRTL ? 'ابدأ التحدث' : 'Start Speaking'}
              </>
            )}
          </Button>
        </div>

        {isListening && (
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-8 h-8 text-primary animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              {isRTL ? 'النص المُحوّل:' : 'Transcribed text:'}
            </p>
            <p className={`text-base ${isRTL ? 'text-right' : 'text-left'}`}>
              {transcript}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {isRTL 
            ? 'اضغط على "ابدأ التحدث" وصف المسألة بصوتك'
            : 'Click "Start Speaking" and describe your problem with your voice'}
        </p>
      </div>
    </Card>
  );
};
