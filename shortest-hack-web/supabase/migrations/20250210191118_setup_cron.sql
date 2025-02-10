-- Enable the required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists http with schema extensions;

-- Drop any existing schedule with the same name
select cron.unschedule('process-messages');

-- Schedule the function to run every 5 seconds
select cron.schedule(
  'process-messages',    -- schedule name
  '*/5 * * * * *',      -- every 5 seconds (cronspec)
  $$
  begin;
    perform extensions.http((
      'POST',
      'https://gyqshpqnyyqyuynngpxn.supabase.co/functions/v1/process-messages',
      ARRAY[('Content-Type', 'application/json'), ('Authorization', 'Bearer ' || current_setting('supabase.service_role_key'))],
      'application/json',
      '{}'
    )::extensions.http_request);
  end;
  $$
); 