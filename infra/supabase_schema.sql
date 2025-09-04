create extension if not exists pgcrypto;

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  bio text,
  age int,
  location text,
  photos text[],
  created_at timestamptz default now()
);

create table swipes (
  id uuid default gen_random_uuid() primary key,
  swiper uuid references profiles(id) not null,
  target uuid references profiles(id) not null,
  direction text check (direction in ('left','right')) not null,
  created_at timestamptz default now()
);

create table matches (
  id uuid default gen_random_uuid() primary key,
  a uuid references profiles(id) not null,
  b uuid references profiles(id) not null,
  matched_at timestamptz default now(),
  unlocked boolean default false,
  unlock_reason text,
  constraint unique_pair unique (least(a,b), greatest(a,b))
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) not null,
  sender uuid references profiles(id) not null,
  content text not null,
  created_at timestamptz default now()
);

create table billing (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text default 'FREE',
  updated_at timestamptz default now()
);

create or replace function check_unlock() returns trigger as $$
begin
  update matches set unlocked = true, unlock_reason = '3_chat_days'
  where id = NEW.match_id
  and (select count(distinct date_trunc('day', created_at)) from messages where match_id = NEW.match_id) >= 3;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_check_unlock after insert on messages
for each row execute procedure check_unlock();
