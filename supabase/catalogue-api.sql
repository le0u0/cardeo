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
