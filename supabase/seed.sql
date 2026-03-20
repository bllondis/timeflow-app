begin;

delete from catchup_entries;
delete from catchup_days;
delete from weekly_days;
delete from weekly_summary;
delete from team_members;
delete from deadlines;
delete from time_entries;
delete from notifications;
delete from timesheet_approvals;
delete from projects;
delete from profiles;

insert into profiles (name, role, email, location, initials)
values
  ('Tetiana Dovgalenko', 'UX Designer', 'olena@company.com', 'Lviv', 'OL');

insert into projects (name, display_order)
values
  ('ACME Corp · Design', 1),
  ('Internal · Planning', 2),
  ('Beta Client · Research', 3),
  ('ACME Corp · Strategy', 4);

insert into weekly_summary (week_number, label, range_label, expected_hours)
values
  (10, 'Week 10', 'March 10 – 14, 2026', 40);

insert into weekly_days (day_label, hours, status, sort_order)
values
  ('Mon', 7.5, 'pending', 1),
  ('Tue', 8, 'submitted', 2),
  ('Wed', 8, 'submitted', 3),
  ('Thu', 7.5, 'pending', 4),
  ('Fri', 0, 'future', 5);

insert into team_members (name, initials, days)
values
  ('Olena Kovalenko', 'OL', array[8, 7.5, 8, 0, 0]::numeric[]),
  ('Mykola Shevchenko', 'MY', array[4, 8, 0, 0, 0]::numeric[]),
  ('Taras Bondarenko', 'TB', array[8, 8, 7, 0, 0]::numeric[]),
  ('Anna Petrenko', 'AP', array[7.5, 0, 0, 0, 0]::numeric[]),
  ('Ihor Kovalenko', 'IK', array[8, 8, 8, 0, 0]::numeric[]);

insert into deadlines (date_label, days_left, week_label, late_count)
values
  ('Fri 20 Mar · 17:00', 4, 'Week 10', 2);

insert into catchup_days (id, day_label, hours_label, entries_count, sort_order) overriding system value
values
  (1, 'Monday, 10 March', '7h 30m', 4, 1),
  (2, 'Tuesday, 11 March', '8h 00m', 3, 2),
  (3, 'Wednesday, 12 March', '6h 45m', 3, 3);

insert into catchup_entries (id, catchup_day_id, project, task, duration, confidence, sort_order) overriding system value
values
  (10, 1, 'ACME Corp · Design', 'Wireframe reviews', '3h 00m', 'high', 1),
  (11, 1, 'Internal · Planning', 'Daily standup', '0h 30m', 'high', 2),
  (12, 1, 'Beta Client · Research', 'User interviews', '2h 30m', 'low', 3),
  (13, 1, 'ACME Corp · Strategy', 'Design review', '1h 30m', 'high', 4),
  (14, 2, 'ACME Corp · Design', 'Prototype iteration', '4h 00m', 'high', 1),
  (15, 2, 'Internal · Planning', 'Sprint retro', '1h 00m', 'high', 2),
  (16, 2, 'Beta Client · Research', 'Competitor analysis', '3h 00m', 'high', 3),
  (17, 3, 'ACME Corp · Design', 'Design system updates', '3h 45m', 'high', 1),
  (18, 3, 'Internal · Planning', '1:1 with manager', '0h 30m', 'high', 2),
  (19, 3, 'Beta Client · Research', 'Figma cleanup', '2h 30m', 'low', 3);

insert into time_entries (id, project, task, time_range, duration, confidence, source, confirmed)
values
  (1, 'ACME Corp · Design', 'Figma — Homepage redesign v3', '09:14–12:29', '3h 15m', 'high', 'Figma', true),
  (2, 'Internal · Planning', 'Sprint planning · Google Meet', '13:00–14:00', '1h 00m', 'high', 'Calendar', true),
  (3, 'Beta Client · Research', 'Browser activity · Notion + Loom', '14:05–16:35', '2h 30m', 'low', 'Browser', false),
  (4, 'ACME Corp · Strategy', 'Kick-off call · Google Meet', '16:40–17:25', '0h 45m', 'high', 'Calendar', true);

insert into notifications (id, unread, type, icon, icon_bg, dot_color, title, body, time_label, date_label, action_label, action_route)
values
  (1, true, 'ai', '✦', '#EFF2FF', '#1A3CFF', 'AI draft is ready', '7h 30m logged across 3 projects. 1 entry needs review.', '2 min ago', 'Today', 'Review & Submit', '/review'),
  (2, true, 'deadline', '⚠', '#FFF7ED', '#FF5C1A', 'Deadline reminder', 'Week 10 timesheet due Fri 20 Mar · 4 days left.', '1 hour ago', 'Today', null, null),
  (3, true, 'approved', '✓', '#F0FDFB', '#00BFA6', 'Timesheet approved', 'Week 9 approved by Taras B.', 'Yesterday', '17:45', null, null),
  (4, false, 'ai', '✦', '#F8FAFC', '#E2E8F0', 'AI draft was ready', 'Week 9 · 38.5h across 4 projects.', 'Mon 16 Mar', '17:02', null, null),
  (5, false, 'submitted', '✓', '#F8FAFC', '#E2E8F0', 'Timesheet submitted', 'Week 8 timesheet submitted successfully · 40h logged.', 'Fri 13 Mar', '16:58', null, null);

insert into timesheet_approvals (id, name, initials, week_label, total_hours, entries_count, submitted_at_label, status)
values
  (1, 'Olena Kovalenko', 'OL', 'Week 9 (Mar 3–7)', 38.5, 18, 'Fri 7 Mar, 16:42', 'pending'),
  (2, 'Taras Bondarenko', 'TB', 'Week 9 (Mar 3–7)', 41, 22, 'Fri 7 Mar, 17:10', 'pending'),
  (3, 'Ihor Kovalenko', 'IK', 'Week 9 (Mar 3–7)', 39, 19, 'Fri 7 Mar, 15:30', 'pending');

commit;
