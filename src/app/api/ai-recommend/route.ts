import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const systemPrompt = `You are a personalized movie recommendation engine.
The user has recently watched the following titles: ${history.join(', ')}.
Based strictly on the themes, genres, and vibes of these titles, recommend 10 similar or highly related movies or TV shows.
Return ONLY a JSON object with the following schema:
{
  "recommendations": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6", "Title 7", "Title 8", "Title 9", "Title 10"]
}
Do not include any explanation, markdown blocks, or extra text. Output strictly valid JSON.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content from Groq');

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
