create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  email text not null,
  location text not null,
  initials text not null
);

create table if not exists projects (
  id bigint generated always as identity primary key,
  name text not null unique,
  display_order int default 0
);

create table if not exists weekly_summary (
  id bigint generated always as identity primary key,
  week_number int not null,
  label text not null,
  range_label text not null,
  expected_hours numeric not null default 40
);

create table if not exists weekly_days (
  id bigint generated always as identity primary key,
  day_label text not null,
  hours numeric not null default 0,
  status text not null,
  sort_order int not null default 0
);

create table if not exists team_members (
  id bigint generated always as identity primary key,
  name text not null,
  initials text not null,
  days numeric[] not null default '{}'
);

create table if not exists deadlines (
  id bigint generated always as identity primary key,
  date_label text not null,
  days_left int not null,
  week_label text not null,
  late_count int not null default 0
);

create table if not exists catchup_days (
  id bigint generated always as identity primary key,
  day_label text not null,
  hours_label text not null,
  entries_count int not null default 0,
  sort_order int not null default 0
);

create table if not exists catchup_entries (
  id bigint generated always as identity primary key,
  catchup_day_id bigint not null references catchup_days(id) on delete cascade,
  project text not null,
  task text not null,
  duration text not null,
  confidence text not null,
  sort_order int not null default 0
);

create table if not exists time_entries (
  id bigint primary key,
  project text not null,
  task text not null,
  time_range text,
  duration text not null,
  confidence text not null,
  source text not null,
  confirmed boolean not null default false
);

create table if not exists notifications (
  id bigint primary key,
  unread boolean not null default true,
  type text not null,
  icon text not null,
  icon_bg text not null,
  dot_color text not null,
  title text not null,
  body text not null,
  time_label text not null,
  date_label text not null,
  action_label text,
  action_route text
);

create table if not exists timesheet_approvals (
  id bigint primary key,
  name text not null,
  initials text not null,
  week_label text not null,
  total_hours numeric not null,
  entries_count int not null,
  submitted_at_label text not null,
  status text not null
);
