-- Migrations will appear here as you chat with AI

create table projects (
  id bigint primary key generated always as identity,
  name text not null,
  html_content text not null
);

alter table projects
add column initial_prompt text;

create table chat_threads (
  id bigint primary key generated always as identity,
  project_id bigint references projects (id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null
);

alter table chat_threads
rename to messages;

alter table messages
add column created_at timestamp with time zone default now();

-- Add created_at timestamp to projects
alter table projects
add column created_at timestamp with time zone default now();

-- Add preview_image_url to projects for grid view thumbnails
alter table projects
add column preview_image_url text;

-- Add an index on created_at for efficient feed sorting
create index projects_created_at_idx on projects(created_at desc);

-- Add an index on project_id in messages for efficient chat loading
create index messages_project_id_idx on messages(project_id);