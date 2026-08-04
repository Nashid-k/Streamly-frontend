import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const systemPrompt = `You are an intelligent streaming search assistant. 
The user is searching for content. Parse their query and return ONLY a JSON object with the following schema:
{
  "keywords": ["array of strings matching titles, actor names, or general concepts"],
  "genre": "string (one of: 'All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Sci-Fi', 'Romance', 'Animation', 'Documentary', 'Crime', 'Fantasy' - choose the closest single match or 'All')",
  "yearRange": "string (one of: 'all', '2020s', '2010s', '2000s', 'older')",
  "type": "string (one of: 'all', 'movies', 'series', 'anime')",
  "minRating": "number (0, 60, 70, 80, 90 - use this if they ask for 'good', 'highly rated', 'best', etc. otherwise 0)"
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return NextResponse.json({ error: 'Failed to process AI search' }, { status: 500 });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI search endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
