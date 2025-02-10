import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.14.1';

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();

    // Only process user messages
    if (record.role !== 'user') {
      return new Response('Not a user message', { status: 200 });
    }

    // Get the project details
    const { data: project } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', record.project_id)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    // Get the chat history
    const { data: messages } = await supabaseClient
      .from('messages')
      .select('role, content')
      .eq('project_id', record.project_id)
      .order('created_at', { ascending: true });

    // Format chat history for Claude
    const chatHistory = messages?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];

    // Get AI response
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: `You are a website generator. When asked to create or modify a website, respond with valid HTML that matches the request. 
          The HTML should be complete and self-contained, including any necessary CSS and JavaScript.
          Use modern, semantic HTML5.
          Include beautiful styling directly in a <style> tag.
          Make the design match brutalist principles - raw, utilitarian, and unpolished aesthetics.
          Do not explain the code, just return the HTML.
          The response should start with <html> and end with </html>.`
        },
        ...chatHistory
      ],
    });

    const aiResponse = response.content[0].text;

    // Insert AI response message
    await supabaseClient
      .from('messages')
      .insert({
        project_id: record.project_id,
        role: 'assistant',
        content: aiResponse,
      });

    // Update project HTML
    await supabaseClient
      .from('projects')
      .update({ html_content: aiResponse })
      .eq('id', record.project_id);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(String(error?.message || error), { status: 500 });
  }
}); 