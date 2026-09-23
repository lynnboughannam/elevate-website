-- click_events — the table trackEvent() in data.js writes to.
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It cannot be created from the site: only the public anon key ships in the
-- client, and PostgREST does not execute DDL.
--
-- Context: this table never existed. trackEvent() has been POSTing to it since
-- launch and swallowing the 404 with an empty .catch(), so every WhatsApp and
-- phone click was discarded in silence. Creating it starts the data flowing;
-- data.js now surfaces failures rather than hiding them.

create table if not exists public.click_events (
  id           bigint generated always as identity primary key,
  created_at   timestamptz  not null default now(),

  -- Ephemeral, per-tab, from sessionStorage. Lets a filter journey be
  -- reconstructed ("did they narrow within a category or toggle Buy/Rent?").
  -- Not a cookie, not cross-session, not tied to a person.
  session_id   text,

  event_type   text         not null,
  page         text,                    -- index.html | listings.html | property.html

  -- Deliberately NOT a foreign key to properties. Listings get unlisted and
  -- deleted in the CRM; a FK would either fail the analytics write or
  -- cascade-delete history. Analytics should outlive what it describes.
  property_id  text,
  area         text,                    -- the property's area, when the event has one

  -- Full filter state at the moment of the event, so the shape can change
  -- without a migration.
  filters      jsonb        not null default '{}'::jsonb,
  -- Denormalised for cheap querying of the common question.
  filter_key   text,                    -- which dimension changed
  filter_value text,                    -- what it changed to
  result_count int,                     -- results the current filter state yields

  -- anon insert is necessarily open, so constrain the vocabulary: it caps how
  -- useful junk rows can be, and catches typos in new call sites.
  constraint click_events_type_ck check (event_type in (
    'whatsapp_click',
    'phone_click',
    'whatsapp_float_click',
    'filter_change',
    'filter_clear',
    'sort',
    'page_change'
  ))
);

create index if not exists click_events_created_idx  on public.click_events (created_at desc);
create index if not exists click_events_type_idx     on public.click_events (event_type);
create index if not exists click_events_property_idx on public.click_events (property_id);

alter table public.click_events enable row level security;

-- Write-only for the public key: the site records events, nobody reads them
-- back without a privileged key. Note this leaves the admin panel's "Click
-- analytics" section non-functional — it reads with the anon key and would
-- need authentication. Deliberate; revisit when that panel is addressed.
drop policy if exists "anon can insert events" on public.click_events;
create policy "anon can insert events"
  on public.click_events
  for insert
  to anon
  with check (true);

-- ── Verifying ───────────────────────────────────────────────────────────────
-- After running, load the site, tap a filter, and check:
--   select event_type, count(*) from public.click_events group by 1 order by 2 desc;
--
-- To read rows from the SQL editor you are already privileged, so no select
-- policy is needed there.

-- ── Undo ────────────────────────────────────────────────────────────────────
-- drop table if exists public.click_events;
