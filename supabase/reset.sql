-- DESTRUCTIVE: replaces Cardeo database tables and deletes their rows.
-- Supabase Storage buckets and objects are not modified.
begin;
drop function if exists public.get_catalogue();
drop function if exists public.get_catalogue(text);
drop function if exists public.get_cards(text);
drop function if exists public.list_cards(text,text,text,text,integer,integer,integer,jsonb);
drop function if exists public.get_card(text,text);
do $$ begin
  if to_regtype('public.cards') is not null and to_regtype('public.rarity_prices') is not null then
    execute 'drop function if exists public.card_result(public.cards,public.rarity_prices,text)';
  end if;
end $$;
drop function if exists public.demo_checkout(jsonb,integer,uuid,text,text,text);
drop function if exists public.checkout(jsonb,integer,uuid,text,text,text);
drop table if exists public.order_items, public.card_translations, public.orders,
  public.checkout_attempts, public.cards, public.rarity_prices,
  public.products, public.tier_prices;
-- Fresh Cardeo database schema. Existing data is not modified by this file.
create table if not exists public.rarity_prices (
  rarity text primary key,
  unit_price_minor integer not null check (unit_price_minor >= 0)
);
insert into public.rarity_prices (rarity, unit_price_minor) values
  ('basic', 100), ('common', 1000), ('uncommon', 5000), ('rare', 10000),
  ('ancient', 200), ('curse', 200), ('status', 200), ('event', 200),
  ('quest', 200), ('token', 200)
on conflict (rarity) do nothing;

create table if not exists public.cards (
  id text primary key,
  rarity text not null references public.rarity_prices(rarity),
  data jsonb not null,
  check (data->>'id' = id),
  check (data->>'rarity' = rarity)
);
alter table public.rarity_prices enable row level security;
alter table public.cards enable row level security;
revoke all on public.rarity_prices, public.cards from public, anon, authenticated;
grant select, insert, update on public.cards to service_role;


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
  product_id text not null references public.cards(id),
  name_snapshot text not null,
  rarity_snapshot text not null,
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

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.checkout_attempts enable row level security;
revoke all on public.orders, public.order_items, public.checkout_attempts from anon, authenticated;


create or replace function public.get_cards(p_locale text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',c.id, 'slug',c.id,
    'name',coalesce(nullif(c.data->'nameI18n'->>(case when p_locale = 'en' then 'en' else 'zh-HK' end), ''), c.data->'nameI18n'->>'en', c.id),
    'character',c.data->>'class', 'rarity',c.rarity, 'isUpgraded',(c.data->>'isUpgraded')::boolean,
    'price_minor',r.unit_price_minor,
    'image_url',case when p_locale = 'en' then '/card-images/en/' || (c.data->'imageFiles'->>'en') else '/card-images/zh-HK/' || (c.data->'imageFiles'->>'zh-HK') end,
    'description',coalesce(c.data->'descI18n'->>(case when p_locale = 'en' then 'en' else 'zh-HK' end), '')
  ) order by c.id), '[]'::jsonb)
  from public.cards c join public.rarity_prices r on r.rarity=c.rarity;
$$;
create or replace function public.checkout(
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
    perform 1 from public.cards p join public.rarity_prices t on t.rarity=p.rarity
      join jsonb_to_recordset(p_items) as i("productId" text,quantity integer) on p.id=i."productId"
      for share of p,t;
    select count(*), coalesce(sum(t.unit_price_minor*i.quantity),0)::integer into item_count,total
      from jsonb_to_recordset(p_items) as i("productId" text,quantity integer)
      join public.cards p on p.id=i."productId"
      join public.rarity_prices t on t.rarity=p.rarity;
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
    insert into public.order_items(order_id,product_id,name_snapshot,rarity_snapshot,unit_price_minor,quantity)
      select created.id,p.id,coalesce(p.data->'nameI18n'->>'en',p.id),p.rarity,t.unit_price_minor,i.quantity
      from jsonb_to_recordset(p_items) as i("productId" text,quantity integer)
      join public.cards p on p.id=i."productId"
      join public.rarity_prices t on t.rarity=p.rarity;
  end if;
  select jsonb_agg(jsonb_build_object('name',name_snapshot,
    'unitPrice',unit_price_minor,'quantity',quantity) order by name_snapshot) into receipt_items
    from public.order_items where order_id=created.id;
  return jsonb_build_object('kind','completed','receipt',jsonb_build_object(
    'reference',created.reference,'createdAt',created.created_at,'total',created.total_minor,
    'currency',created.currency,'items',receipt_items));
end;
$$;
revoke all on function public.get_cards(text) from public, anon, authenticated;
revoke all on function public.checkout(jsonb,integer,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.get_cards(text) to service_role;
grant execute on function public.checkout(jsonb,integer,uuid,text,text,text) to service_role;

commit;
-- Add bounded catalogue queries without changing checkout or existing data.
create or replace function public.card_result(c public.cards, r public.rarity_prices, p_locale text) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('id',c.id,'slug',c.id,
    'name',coalesce(nullif(c.data->'nameI18n'->>(case when p_locale='en' then 'en' else 'zh-HK' end),''),c.data->'nameI18n'->>'en',c.id),
    'character',c.data->>'class','rarity',c.rarity,'isUpgraded',(c.data->>'isUpgraded')::boolean,
    'price_minor',r.unit_price_minor,
    'image_url',case when p_locale='en' then '/card-images/en/'||(c.data->'imageFiles'->>'en') else '/card-images/zh-HK/'||(c.data->'imageFiles'->>'zh-HK') end,
    'description',coalesce(c.data->'descI18n'->>(case when p_locale='en' then 'en' else 'zh-HK' end),''));
$$;
create or replace function public.list_cards(p_locale text, p_class text default null, p_keyword text default '', p_sort text default 'featured', p_page integer default 1, p_limit integer default 12, p_max_price integer default null, p_ids jsonb default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  with all_cards as materialized (
    select c.id,c.data->>'class' as class,r.unit_price_minor as price,public.card_result(c,r,p_locale) as item
    from public.cards c join public.rarity_prices r on r.rarity=c.rarity
  ), filtered as materialized (
    select * from all_cards
    where (p_class is null or class=p_class)
      and (p_keyword='' or position(lower(p_keyword) in lower(item->>'name'))>0)
      and (p_max_price is null or price<=p_max_price)
      and (p_ids is null or p_ids ? id)
  ), ordered as (
    select * from filtered order by
      case when p_sort='price-asc' then price end asc,
      case when p_sort='price-desc' then price end desc,
      case when p_sort='name' then item->>'name' end asc, id asc
    limit least(greatest(p_limit,1),30) offset (greatest(p_page,1)-1)*least(greatest(p_limit,1),30)
  )
  select jsonb_build_object('items',coalesce((select jsonb_agg(item) from ordered),'[]'::jsonb),
    'total',(select count(*) from filtered),
    'maxPrice',coalesce((select max(price) from all_cards),0),
    'counts',coalesce((select jsonb_object_agg(class,n) from (select class,count(*) n from all_cards group by class) x),'{}'::jsonb));
$$;
create or replace function public.get_card(p_locale text,p_id text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select public.card_result(c,r,p_locale) from public.cards c join public.rarity_prices r on r.rarity=c.rarity where c.id=p_id;
$$;
revoke all on function public.card_result(public.cards,public.rarity_prices,text) from public, anon, authenticated;
revoke all on function public.list_cards(text,text,text,text,integer,integer,integer,jsonb) from public, anon, authenticated;
revoke all on function public.get_card(text,text) from public, anon, authenticated;
grant execute on function public.list_cards(text,text,text,text,integer,integer,integer,jsonb) to service_role;
grant execute on function public.get_card(text,text) to service_role;
