-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Create custom types
create type entry_category as enum (
  'konflikt',
  'gespraech', 
  'verhalten',
  'beweis',
  'kindbetreuung',
  'sonstiges'
);

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create entries table
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  category entry_category not null default 'sonstiges',
  date date not null default current_date,
  time time not null default current_time,
  important boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create attachments table
create table public.attachments (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references public.entries(id) on delete cascade not null,
  filename text not null,
  file_path text not null,
  file_size bigint not null,
  mime_type text not null,
  context text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index entries_user_id_idx on public.entries(user_id);
create index entries_date_idx on public.entries(date desc);
create index entries_category_idx on public.entries(category);
create index entries_important_idx on public.entries(important);
create index entries_tags_idx on public.entries using gin(tags);
create index attachments_entry_id_idx on public.attachments(entry_id);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.entries enable row level security;
alter table public.attachments enable row level security;

-- Create RLS policies for users table
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Create RLS policies for entries table
create policy "Users can view own entries" on public.entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.entries
  for delete using (auth.uid() = user_id);

-- Create RLS policies for attachments table
create policy "Users can view own attachments" on public.attachments
  for select using (
    auth.uid() = (
      select user_id from public.entries where id = attachments.entry_id
    )
  );

create policy "Users can insert own attachments" on public.attachments
  for insert with check (
    auth.uid() = (
      select user_id from public.entries where id = attachments.entry_id
    )
  );

create policy "Users can update own attachments" on public.attachments
  for update using (
    auth.uid() = (
      select user_id from public.entries where id = attachments.entry_id
    )
  );

create policy "Users can delete own attachments" on public.attachments
  for delete using (
    auth.uid() = (
      select user_id from public.entries where id = attachments.entry_id
    )
  );

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute procedure update_updated_at_column();

create trigger update_entries_updated_at before update on public.entries
  for each row execute procedure update_updated_at_column();

-- Create function to handle user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create storage bucket for attachments
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false);

-- Create storage policies
create policy "Users can upload own attachments" on storage.objects
  for insert with check (
    bucket_id = 'attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own attachments" on storage.objects
  for select using (
    bucket_id = 'attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own attachments" on storage.objects
  for update using (
    bucket_id = 'attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own attachments" on storage.objects
  for delete using (
    bucket_id = 'attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );