create table if not exists public.oauth_verification_status (
  id integer primary key default 1,
  provider text not null default 'google',
  app_name text not null default 'SmartCardSA',
  consent_screen_configured boolean not null default false,
  scopes_configured boolean not null default false,
  authorized_domains_added boolean not null default false,
  credentials_created boolean not null default false,
  credentials_saved_in_cloud boolean not null default false,
  publishing_status text not null default 'testing',
  verification_status text not null default 'not_submitted',
  notes text,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint oauth_verification_status_singleton check (id = 1),
  constraint oauth_publishing_status_check check (publishing_status in ('testing','in_production')),
  constraint oauth_verification_status_check check (verification_status in ('not_submitted','submitted','verified','rejected'))
);

grant select, insert, update on public.oauth_verification_status to authenticated;
grant all on public.oauth_verification_status to service_role;

alter table public.oauth_verification_status enable row level security;

drop policy if exists "Admins manage oauth verification status" on public.oauth_verification_status;
create policy "Admins manage oauth verification status"
  on public.oauth_verification_status for all to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role))
  with check (public.has_role(auth.uid(), 'admin'::app_role));

insert into public.oauth_verification_status (id) values (1) on conflict (id) do nothing;