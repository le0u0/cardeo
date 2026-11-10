create table if not exists public.tier_prices (
  tier text primary key check (tier in ('S','A','B','C','D')),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  character text not null,
  tier text references public.tier_prices(tier),
  image_url text not null,
  description text not null,
  active boolean not null default true,
  tier_source_url text not null default 'https://mobalytics.gg/slay-the-spire-2/tier-lists/cards',
  source_updated_on date not null default '2026-08-12',
  tier_verified_on date not null default '2026-11-07'
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default 'DEMO-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
  request_key uuid not null unique,
  request_fingerprint text not null,
  status text not null default 'demo_completed' check (status = 'demo_completed'),
  currency text not null default 'HKD' check (currency = 'HKD'),
  subtotal_minor integer not null check (subtotal_minor >= 0),
  shipping_minor integer not null default 0 check (shipping_minor = 0),
  total_minor integer not null check (total_minor = subtotal_minor),
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  product_id text not null references public.products(id),
  name_snapshot text not null,
  tier_snapshot text not null,
  unit_price_minor integer not null check (unit_price_minor >= 0),
  quantity integer not null check (quantity between 1 and 10),
  unique(order_id, product_id)
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create table if not exists public.checkout_attempts (
  bucket_key text primary key,
  attempts integer not null,
  expires_at timestamptz not null
);

alter table public.products enable row level security;
alter table public.tier_prices enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.checkout_attempts enable row level security;
revoke all on public.products, public.tier_prices, public.orders, public.order_items, public.checkout_attempts from anon, authenticated;

create or replace function public.get_catalogue() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'slug',p.slug,'name',p.name,'character',p.character,'tier',p.tier,
    'price_minor',t.unit_price_minor,'image_url',p.image_url,'description',p.description
  ) order by array_position(array['S','A','B','C','D'],p.tier),p.name),'[]'::jsonb)
  from public.products p join public.tier_prices t on p.tier=t.tier where p.active;
$$;

create or replace function public.demo_checkout(
  p_items jsonb, p_expected_total integer, p_request_key uuid,
  p_fingerprint text, p_outcome text, p_bucket text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  existing public.orders%rowtype;
  created public.orders%rowtype;
  total integer;
  item_count integer;
  attempt_count integer;
  receipt_items jsonb;
begin
  -- Serialize identical requests across instances before checking for an existing order.
  perform pg_advisory_xact_lock(hashtextextended(p_request_key::text,0));
  select * into existing from public.orders where request_key=p_request_key;
  if found then
    if existing.request_fingerprint <> p_fingerprint then
      return jsonb_build_object('kind','conflict','message','This request key belongs to a different cart.');
    end if;
    created := existing;
  else
    -- Rate limiting is database-backed, not instance memory. Domain failures return
    -- normally so the counter is committed even when no order is created.
    delete from public.checkout_attempts where expires_at < now();
    insert into public.checkout_attempts(bucket_key,attempts,expires_at)
      values(p_bucket,1,now()+interval '15 minutes')
      on conflict(bucket_key) do update set attempts=public.checkout_attempts.attempts+1
      returning attempts into attempt_count;
    if attempt_count > 20 then
      return jsonb_build_object('kind','limited','message','Too many attempts. Please try again in 15 minutes.');
    end if;
    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
      return jsonb_build_object('kind','invalid','message','Your cart needs 1–30 different cards.');
    end if;
    if exists(select 1 from jsonb_to_recordset(p_items) as i("productId" text,quantity integer)
      where quantity is null or quantity not between 1 and 10)
      or (select count(distinct i->>'productId') from jsonb_array_elements(p_items) i) <> jsonb_array_length(p_items) then
      return jsonb_build_object('kind','invalid','message','Invalid quantities or duplicate cards.');
    end if;
    -- Lock the catalogue rows and prices through the write, preventing partial repricing.
    perform 1 from public.products p join public.tier_prices t on t.tier=p.tier
      join jsonb_to_recordset(p_items) as i("productId" text,quantity integer) on p.id=i."productId"
      where p.active for share of p,t;
    select count(*), coalesce(sum(t.unit_price_minor*i.quantity),0)::integer into item_count,total
      from jsonb_to_recordset(p_items) as i("productId" text,quantity integer)
      join public.products p on p.id=i."productId" and p.active
      join public.tier_prices t on t.tier=p.tier;
    if item_count <> jsonb_array_length(p_items) then
      return jsonb_build_object('kind','invalid','message','A card is unavailable. Review your cart.');
    end if;
    if total <> p_expected_total then
      return jsonb_build_object('kind','requote','total',total);
    end if;
    if p_outcome='failure' then
      return jsonb_build_object('kind','failed','message','Simulated payment failure. Your cart is safe; try again.');
    end if;
    if p_outcome <> 'success' then
      return jsonb_build_object('kind','invalid','message','Unknown simulation outcome.');
    end if;
    insert into public.orders(request_key,request_fingerprint,subtotal_minor,total_minor)
      values(p_request_key,p_fingerprint,total,total) returning * into created;
    insert into public.order_items(order_id,product_id,name_snapshot,tier_snapshot,unit_price_minor,quantity)
      select created.id,p.id,p.name,p.tier,t.unit_price_minor,i.quantity
      from jsonb_to_recordset(p_items) as i("productId" text,quantity integer)
      join public.products p on p.id=i."productId"
      join public.tier_prices t on t.tier=p.tier;
  end if;
  select jsonb_agg(jsonb_build_object('name',name_snapshot,'tier',tier_snapshot,
    'unitPrice',unit_price_minor,'quantity',quantity) order by name_snapshot) into receipt_items
    from public.order_items where order_id=created.id;
  return jsonb_build_object('kind','completed','receipt',jsonb_build_object(
    'reference',created.reference,'createdAt',created.created_at,'total',created.total_minor,
    'currency',created.currency,'items',receipt_items));
end;
$$;
revoke all on function public.get_catalogue() from public, anon, authenticated;
revoke all on function public.demo_checkout(jsonb,integer,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.get_catalogue() to service_role;
grant execute on function public.demo_checkout(jsonb,integer,uuid,text,text,text) to service_role;
