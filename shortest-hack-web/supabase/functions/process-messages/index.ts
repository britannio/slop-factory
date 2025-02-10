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

async function processMessage(message: any) {
  console.log(`Processing message ${message.id} for project ${message.project_id}`);
  try {
    // Get the project details
    console.log(`Fetching project details for project ${message.project_id}`);
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', message.project_id)
      .single();

    if (projectError) {
      throw new Error(`Failed to fetch project: ${projectError.message}`);
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Get the chat history
    console.log(`Fetching chat history for project ${message.project_id}`);
    const { data: messages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('role, content')
      .eq('project_id', message.project_id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`);
    }

    // Format chat history for Claude
    console.log(`Found ${messages?.length || 0} messages in chat history`);
    const chatHistory = messages?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];

    // Get AI response
    console.log('Calling Claude API to generate response');
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
    console.log('Received response from Claude');
    console.log(`Generated HTML length: ${aiResponse.length} characters`);

    // Insert AI response message
    console.log('Inserting AI response as new message');
    const { error: insertError } = await supabaseClient
      .from('messages')
      .insert({
        project_id: message.project_id,
        role: 'assistant',
        content: aiResponse,
        processed: true
      });

    if (insertError) {
      throw new Error(`Failed to insert AI response: ${insertError.message}`);
    }

    // Update project HTML
    console.log('Updating project HTML content');
    const { error: updateError } = await supabaseClient
      .from('projects')
      .update({ html_content: aiResponse })
      .eq('id', message.project_id);

    if (updateError) {
      throw new Error(`Failed to update project HTML: ${updateError.message}`);
    }

    // Mark message as processed
    console.log('Marking original message as processed');
    const { error: markError } = await supabaseClient
      .from('messages')
      .update({ processed: true })
      .eq('id', message.id);

    if (markError) {
      throw new Error(`Failed to mark message as processed: ${markError.message}`);
    }

    console.log(`Successfully processed message ${message.id}`);
  } catch (error) {
    console.error(`Error processing message ${message.id}:`, error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
  }
}

Deno.serve(async () => {
  console.log('Starting message processing cycle');
  try {
    // Get unprocessed user messages
    console.log('Fetching unprocessed user messages');
    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('processed', false)
      .eq('role', 'user')
      .order('created_at', { ascending: true })
      .limit(5); // Process 5 messages at a time

    if (error) {
      throw new Error(`Failed to fetch unprocessed messages: ${error.message}`);
    }

    console.log(`Found ${messages?.length || 0} unprocessed messages`);

    // Process each message
    if (messages && messages.length > 0) {
      console.log('Processing messages in parallel');
      await Promise.all(messages.map(processMessage));
      console.log('Finished processing all messages');
    } else {
      console.log('No messages to process');
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error in processing cycle:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return new Response(String(error?.message || error), { status: 500 });
  }
}); 