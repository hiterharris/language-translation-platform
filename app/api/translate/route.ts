import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();

    // Validate request
    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the original meaning, context, and formatting. If the text contains any cultural references, provide appropriate equivalents in the target language.`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-4",
    });

    const translatedText = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      translation: translatedText,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}