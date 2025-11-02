import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Onboarding
      "welcome": "مرحباً بك!",
      "whatIsYourName": "ما اسمك؟",
      "enterName": "أدخل اسمك",
      "whatsYourGrade": "ما هو صفك الدراسي؟",
      "selectGrade": "اختر الصف",
      "grade": "الصف",
      "letsStart": "لنبدأ!",
      
      // Home
      "hello": "مرحباً",
      "uploadImage": "تحميل صورة",
      "takePhoto": "التقاط صورة",
      "history": "السجل",
      "settings": "الإعدادات",
      "helpMe": "ساعدني في حل الأسئلة",
      "uploadDescription": "التقط صورة أو حمّل صورة لصفحة الكتاب",
      
      // Upload
      "selectImage": "اختر صورة",
      "analyzing": "جارٍ التحليل...",
      "analyzing_description": "نحن نقرأ أسئلتك الآن",
      "uploadYourImage": "حمّل صورتك",
      "dragDrop": "اسحب وأفلت الصورة هنا",
      "or": "أو",
      "browse": "تصفح",
      "camera": "الكاميرا",
      "analyze": "تحليل",
      
      // Results
      "solution": "الحل",
      "summary": "الملخص",
      "questions": "الأسئلة",
      "listenToAnswer": "استمع للإجابة",
      "stopListening": "إيقاف الاستماع",
      "share": "مشاركة",
      "saveToHistory": "حفظ في السجل",
      "tryAnother": "حاول مرة أخرى",
      
      // History
      "myHistory": "سجلاتي",
      "noHistory": "لا توجد سجلات بعد",
      "startUploading": "ابدأ بتحميل الصور لحل الأسئلة",
      "delete": "حذف",
      "viewDetails": "عرض التفاصيل",
      
      // Settings
      "mySettings": "إعداداتي",
      "profile": "الملف الشخصي",
      "name": "الاسم",
      "language": "اللغة",
      "arabic": "العربية",
      "english": "English",
      "about": "حول التطبيق",
      "version": "الإصدار",
      "save": "حفظ",
      "cancel": "إلغاء",
      
      // Common
      "loading": "جارٍ التحميل...",
      "error": "خطأ",
      "success": "نجح",
      "back": "رجوع",
      "next": "التالي",
      "done": "تم",
      
      // Errors
      "errorOccurred": "حدث خطأ",
      "tryAgain": "حاول مرة أخرى",
      "noQuestionsFound": "لم يتم العثور على أسئلة",
      "noQuestionsFoundDescription": "سنقدم لك ملخصاً للصفحة بدلاً من ذلك"
    }
  },
  en: {
    translation: {
      // Onboarding
      "welcome": "Welcome!",
      "whatIsYourName": "What's your name?",
      "enterName": "Enter your name",
      "whatsYourGrade": "What's your grade?",
      "selectGrade": "Select grade",
      "grade": "Grade",
      "letsStart": "Let's Start!",
      
      // Home
      "hello": "Hello",
      "uploadImage": "Upload Image",
      "takePhoto": "Take Photo",
      "history": "History",
      "settings": "Settings",
      "helpMe": "Help me solve questions",
      "uploadDescription": "Take or upload a photo of your book page",
      
      // Upload
      "selectImage": "Select Image",
      "analyzing": "Analyzing...",
      "analyzing_description": "We're reading your questions now",
      "uploadYourImage": "Upload Your Image",
      "dragDrop": "Drag and drop image here",
      "or": "or",
      "browse": "Browse",
      "camera": "Camera",
      "analyze": "Analyze",
      
      // Results
      "solution": "Solution",
      "summary": "Summary",
      "questions": "Questions",
      "listenToAnswer": "Listen to Answer",
      "stopListening": "Stop Listening",
      "share": "Share",
      "saveToHistory": "Save to History",
      "tryAnother": "Try Another",
      
      // History
      "myHistory": "My History",
      "noHistory": "No history yet",
      "startUploading": "Start uploading images to solve questions",
      "delete": "Delete",
      "viewDetails": "View Details",
      
      // Settings
      "mySettings": "My Settings",
      "profile": "Profile",
      "name": "Name",
      "language": "Language",
      "arabic": "العربية",
      "english": "English",
      "about": "About",
      "version": "Version",
      "save": "Save",
      "cancel": "Cancel",
      
      // Common
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "back": "Back",
      "next": "Next",
      "done": "Done",
      
      // Errors
      "errorOccurred": "An error occurred",
      "tryAgain": "Try Again",
      "noQuestionsFound": "No questions found",
      "noQuestionsFoundDescription": "We'll provide a summary instead"
    }
  }
};

const savedLanguage = localStorage.getItem('language') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
