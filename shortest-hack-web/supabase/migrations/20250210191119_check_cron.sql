-- Check active cron jobs
select * from cron.job;

-- Check recent job runs
select * from cron.job_run_details order by start_time desc limit 5; 