-- Drop existing objects
drop trigger if exists handle_new_message on messages;
drop trigger if exists on_new_message on messages;
drop function if exists handle_new_message() cascade;

-- Create the wrapper function
create function handle_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform
    supabase_functions.http_request(
      'https://gyqshpqnyyqyuynngpxn.supabase.co/functions/v1/handle-message',
      'POST',
      '{"Content-Type":"application/json"}',
      jsonb_build_object('record', row_to_json(new))::text
    );
  return new;
end;
$$;

-- Create the trigger
create trigger handle_new_message
  after insert on messages
  for each row
  execute function handle_new_message();

-- Add processed column to messages
alter table messages 
add column if not exists processed boolean default false; 