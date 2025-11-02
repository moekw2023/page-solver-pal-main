// filepath: src/components/VideoExplanation.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, ChevronRight, Video } from 'lucide-react';
import { toast } from 'sonner';

interface Step {
  title: string;
  content: string;
  duration?: number;
}

interface VideoExplanationProps {
  steps: string[] | Step[];
  title: string;
}

export const VideoExplanation = ({ steps, title }: VideoExplanationProps) => {
  const { i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const isRTL = i18n.language === 'ar';

  // Convert string steps to Step objects
  const normalizedSteps: Step[] = steps.map((step, index) => {
    if (typeof step === 'string') {
      return {
        title: `${isRTL ? 'الخطوة' : 'Step'} ${index + 1}`,
        content: step,
        duration: 3000 // 3 seconds per step
      };
    }
    return step;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      const currentStepData = normalizedSteps[currentStep];
      const duration = currentStepData.duration || 3000;
      const increment = 100 / (duration / 100); // Update every 100ms
      
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next step
            if (currentStep < normalizedSteps.length - 1) {
              setCurrentStep((s) => s + 1);
              return 0;
            } else {
              // End of animation
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + increment;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, normalizedSteps]);

  const handlePlayPause = () => {
    if (currentStep === normalizedSteps.length - 1 && progress >= 100) {
      handleRestart();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleNextStep = () => {
    if (currentStep < normalizedSteps.length - 1) {
      setCurrentStep((s) => s + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setProgress(0);
    setIsPlaying(false);
  };

  const currentStepData = normalizedSteps[currentStep];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {/* Video Display Area */}
      <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8 mb-4 min-h-[300px] flex items-center justify-center">
        <div className="text-center max-w-2xl">
          {/* Step Title */}
          <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full mb-4 text-sm font-medium">
            {currentStepData.title}
          </div>

          {/* Step Content with Animation */}
          <div 
            className={`text-lg leading-relaxed transition-all duration-500 ${
              isPlaying ? 'animate-fade-in scale-105' : 'scale-100'
            }`}
            style={{
              animation: isPlaying ? 'slideInUp 0.5s ease-out' : 'none'
            }}
          >
            {currentStepData.content}
          </div>

          {/* Progress Bar */}
          <div className="mt-8 w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Counter */}
          <p className="mt-4 text-sm text-muted-foreground">
            {isRTL 
              ? `الخطوة ${currentStep + 1} من ${normalizedSteps.length}`
              : `Step ${currentStep + 1} of ${normalizedSteps.length}`
            }
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          disabled={currentStep === 0 && progress === 0}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          onClick={handlePlayPause}
          size="lg"
          className="px-8"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              {isRTL ? 'إيقاف مؤقت' : 'Pause'}
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              {isRTL ? 'تشغيل' : 'Play'}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextStep}
          disabled={currentStep === normalizedSteps.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Step Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {normalizedSteps.map((step, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={`p-3 rounded-lg text-left transition-all ${
              currentStep === index
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <p className="text-xs font-medium mb-1">{step.title}</p>
            <p className="text-xs opacity-80 line-clamp-2">{step.content}</p>
          </button>
        ))}
      </div>      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}} />
    </Card>
  );
};
