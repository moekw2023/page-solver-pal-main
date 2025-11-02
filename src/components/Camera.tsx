import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera as CameraIcon, RotateCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/storage';

export const Camera = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const isRTL = i18n.language === 'ar';

  const startCamera = async () => {
    setIsLoadingCamera(true);
    setCameraError(null);
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
        setStream(mediaStream);
        toast.success(i18n.language === 'ar' ? 'تم تشغيل الكاميرا' : 'Camera started');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = t('errorOccurred');
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = i18n.language === 'ar' 
          ? 'يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح'
          : 'Please allow camera access in your browser settings';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = i18n.language === 'ar'
          ? 'لم يتم العثور على كاميرا'
          : 'No camera found on this device';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = i18n.language === 'ar'
          ? 'الكاميرا قيد الاستخدام من تطبيق آخر'
          : 'Camera is being used by another application';
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Small delay to ensure camera is fully released
    await new Promise(resolve => setTimeout(resolve, 300));
    await startCamera();
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    const profile = storage.getProfile();

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          imageBase64: capturedImage,
          language: i18n.language,
          grade: profile?.grade || 1,
        }
      });

      if (error) throw error;

      toast.success(t('success'));
      navigate('/results', { 
        state: { 
          result: data,
          imageUrl: capturedImage 
        } 
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('errorOccurred'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              stopCamera();
              navigate('/');
            }}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">{t('camera')}</h1>
        </div>

        {/* Camera View */}
        <Card className="p-4 space-y-4">
          {!stream && !capturedImage && (
            <div className="text-center py-12">
              <CameraIcon className="w-16 h-16 mx-auto text-primary mb-4" />
              {cameraError && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {cameraError}
                </div>
              )}
              <Button
                onClick={startCamera}
                className="bg-gradient-to-r from-primary to-primary-light"
                size="lg"
                disabled={isLoadingCamera}
              >
                {isLoadingCamera ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </>
                ) : (
                  t('camera')
                )}
              </Button>
            </div>
          )}

          {stream && !capturedImage && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg"
              />
              <div className="flex gap-3">
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <RotateCw className="w-5 h-5" />
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-secondary to-secondary-light"
                  size="lg"
                >
                  {t('takePhoto')}
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  {t('tryAgain')}
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

          <canvas ref={canvasRef} className="hidden" />
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
