import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clipId } = await req.json();
    
    if (!clipId) {
      return new Response(
        JSON.stringify({ error: 'clipId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing clip: ${clipId}`);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

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

    const { data: clip, error: clipError } = await supabaseAdmin
      .from('clips')
      .select('*, episodes(*)')
      .eq('id', clipId)
      .eq('user_id', user.id)
      .single();

    if (clipError || !clip) {
      throw new Error('Clip não encontrado');
    }

    const episode = clip.episodes;
    if (!episode?.youtube_video_id) {
      throw new Error('Video ID do YouTube não encontrado');
    }

    console.log(`Generating clip URL for ${episode.youtube_video_id}: ${clip.start_time}s - ${clip.end_time}s`);

    const embedUrl = `https://www.youtube.com/embed/${episode.youtube_video_id}?start=${clip.start_time}&end=${clip.end_time}&autoplay=0`;

    const { error: updateError } = await supabaseAdmin
      .from('clips')
      .update({ 
        video_url: embedUrl,
        status: 'ready'
      })
      .eq('id', clipId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Clip ${clipId} ready`);

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: embedUrl,
        message: 'Clip pronto para visualização'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
