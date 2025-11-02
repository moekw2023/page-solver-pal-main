import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language, grade } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    const VERTEX_AI_API_KEY = Deno.env.get('VERTEX_AI_API_KEY');
    if (!VERTEX_AI_API_KEY) {
      throw new Error('VERTEX_AI_API_KEY is not configured');
    }

    console.log(`Analyzing image for grade ${grade} student in ${language}`);

    // Prepare the prompt based on language
    const systemPrompt = language === 'ar' 
      ? `أنت مساعد تعليمي ذكي للطلاب في الصف ${grade}. مهمتك هي:
1. قراءة الأسئلة من صورة صفحة الكتاب
2. حل كل سؤال بخطوات واضحة ومفصلة
3. إذا لم تجد أسئلة، قدم ملخصاً للمحتوى مع أمثلة للأسئلة المحتملة

قدم إجاباتك بطريقة واضحة ومناسبة لمستوى الطالب. استخدم اللغة العربية في الإجابة.`
      : `You are an intelligent educational assistant for grade ${grade} students. Your tasks are:
1. Read questions from the book page image
2. Solve each question with clear, detailed step-by-step explanations
3. If no questions are found, provide a summary of the content with example questions

Provide answers in a clear manner appropriate for the student's grade level. Use English for your response.`;

    const userPrompt = language === 'ar'
      ? `قم بتحليل هذه الصورة من كتاب الطالب. إذا وجدت أسئلة، احلها جميعاً بخطوات واضحة. إذا لم تجد أسئلة، قدم ملخصاً للمحتوى مع 3-5 أسئلة مقترحة وإجاباتها.

قدم الرد بتنسيق JSON:
{
  "hasQuestions": true/false,
  "questions": [{"question": "السؤال", "answer": "الإجابة", "steps": ["خطوة 1", "خطوة 2"]}],
  "summary": "الملخص إذا لم توجد أسئلة",
  "suggestedQuestions": [{"question": "سؤال مقترح", "answer": "الإجابة"}]
}`
      : `Analyze this image from a student's book. If you find questions, solve them all with clear steps. If no questions are found, provide a content summary with 3-5 suggested questions and answers.

Provide the response in JSON format:
{
  "hasQuestions": true/false,
  "questions": [{"question": "The question", "answer": "The answer", "steps": ["Step 1", "Step 2"]}],
  "summary": "Summary if no questions found",
  "suggestedQuestions": [{"question": "Suggested question", "answer": "The answer"}]
}`;

    const response = await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/publishers/google/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERTEX_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: systemPrompt + "\n" + userPrompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: language === 'ar' 
            ? 'تم تجاوز الحد المسموح. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: language === 'ar'
            ? 'الرصيد غير كافٍ. يرجى إضافة رصيد إلى حسابك.'
            : 'Insufficient credits. Please add credits to your account.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI Response received successfully');

    // Try to parse JSON from the response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      result = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON, using raw response:', e);
      // If JSON parsing fails, create a structured response
      result = {
        hasQuestions: false,
        summary: aiResponse,
        suggestedQuestions: []
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
