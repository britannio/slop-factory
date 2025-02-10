-- Create projects table
create table projects (
  id bigint primary key generated always as identity,
  name text not null,
  html_content text not null,
  initial_prompt text,
  created_at timestamp with time zone default now(),
  preview_image_url text
);

-- Create messages table (for chat history)
create table messages (
  id bigint primary key generated always as identity,
  project_id bigint references projects (id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index projects_created_at_idx on projects(created_at desc);
create index messages_project_id_idx on messages(project_id);
