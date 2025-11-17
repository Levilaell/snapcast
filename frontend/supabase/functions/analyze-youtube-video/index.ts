import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ViralSegment {
  start_time: number;
  end_time: number;
  duration: number;
  viral_score: number;
  title: string;
  reason: string;
  transcript_text: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl, videoId } = await req.json();
    
    if (!youtubeUrl || !videoId) {
      return new Response(
        JSON.stringify({ error: 'YouTube URL e videoId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing video: ${videoId}`);

    // Get YouTube API key and Gemini API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY não configurada');
    }
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Get video details from YouTube API
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const videoResponse = await fetch(videoDetailsUrl);
    const videoData = await videoResponse.json();

    if (!videoResponse.ok || !videoData.items || videoData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Vídeo não encontrado ou indisponível' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videoInfo = videoData.items[0];
    const title = videoInfo.snippet.title;
    const duration = videoInfo.contentDetails.duration;
    const thumbnail = videoInfo.snippet.thumbnails.high.url;

    // Get captions/transcript from YouTube
    const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`;
    const captionsResponse = await fetch(captionsUrl);
    const captionsData = await captionsResponse.json();

    if (!captionsResponse.ok || !captionsData.items || captionsData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Este vídeo não possui legendas/transcrições disponíveis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For MVP, we'll use a simplified transcript
    // In production, you'd download the actual caption file
    console.log('Analyzing with AI...');

    // Analyze with Gemini AI
    const systemPrompt = `Você é um especialista em identificar momentos virais em podcasts e vídeos longos.
Analise o vídeo e identifique 5-10 segmentos com maior potencial viral.

Para cada segmento, retorne um JSON no seguinte formato:
{
  "segments": [
    {
      "start_time": número em segundos,
      "end_time": número em segundos,
      "duration": duração em segundos (15-90s),
      "viral_score": número de 1-100,
      "title": "título curto e chamativo",
      "reason": "por que este momento é viral (história/humor/polêmica/conselho)",
      "transcript_text": "transcrição do trecho"
    }
  ]
}

Critérios para momentos virais:
- Histórias impactantes ou emocionais
- Humor e momentos engraçados
- Polêmicas e opiniões fortes
- Conselhos práticos e valiosos
- Revelações surpreendentes
- Momentos de transformação`;

    const userPrompt = `Analise este vídeo e identifique os momentos com maior potencial viral:
Título: ${title}
Duração: ${duration}

Retorne apenas o JSON com os segmentos identificados.`;

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', errorText);
      
      // Parse error details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.code === 429) {
          throw new Error('Limite de quota da API do Gemini excedido. Aguarde alguns minutos e tente novamente.');
        }
      } catch {
        // If parsing fails, use generic message
      }
      throw new Error('Erro ao analisar vídeo com IA. Verifique sua chave de API do Gemini.');
    }

    const aiData = await aiResponse.json();
    console.log('Gemini response:', JSON.stringify(aiData));

    // Parse the Gemini response
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiContent) {
      throw new Error('Resposta da IA inválida');
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonContent = aiContent;
    const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const analysisResult = JSON.parse(jsonContent);
    const segments: ViralSegment[] = analysisResult.segments || [];

    console.log(`Found ${segments.length} viral segments`);

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse duration from ISO 8601 format (e.g., "PT1H30M45S") to seconds
    const parseDuration = (isoDuration: string): number => {
      const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return hours * 3600 + minutes * 60 + seconds;
    };

    const durationInSeconds = parseDuration(duration);

    // Create episode record
    const { data: episode, error: episodeError } = await supabaseAdmin
      .from('episodes')
      .insert({
        title,
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        duration: durationInSeconds,
        cover_image: thumbnail,
        user_id: user.id,
        transcript_data: { captions: captionsData.items },
        viral_scores: { segments: segments.map(s => s.viral_score) },
        status: 'processed'
      })
      .select()
      .single();

    if (episodeError) {
      console.error('Error creating episode:', episodeError);
      throw episodeError;
    }

    // Create clip records for each viral segment
    const clipInserts = segments.map(segment => ({
      episode_id: episode.id,
      user_id: user.id,
      title: segment.title,
      start_time: segment.start_time,
      end_time: segment.end_time,
      duration: segment.duration,
      viral_reason: segment.reason,
      virality_score: segment.viral_score,
      transcript_text: segment.transcript_text,
      thumbnail_url: thumbnail,
      status: 'pending'
    }));

    const { error: clipsError } = await supabaseAdmin
      .from('clips')
      .insert(clipInserts);

    if (clipsError) {
      console.error('Error creating clips:', clipsError);
      throw clipsError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        episodeId: episode.id,
        viralSegmentsCount: segments.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-youtube-video function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
