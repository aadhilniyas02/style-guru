alter table wardrobe_items
  add column if not exists primary_category text;

alter table wardrobe_items
  add column if not exists specific_label text;

alter table wardrobe_items
  drop constraint if exists wardrobe_items_clothing_type_check;

alter table wardrobe_items
  add constraint wardrobe_items_clothing_type_check
  check (clothing_type in ('shirt', 'tshirt', 'trousers', 'shorts', 'shoes', 'jacket', 'traditional', 'innerwear', 'dress', 'accessory'));

alter table wardrobe_items
  drop constraint if exists wardrobe_items_primary_category_check;

alter table wardrobe_items
  add constraint wardrobe_items_primary_category_check
  check (primary_category in ('shirt', 'tshirt', 'trousers', 'shorts', 'shoes', 'jacket', 'traditional', 'innerwear', 'dress', 'accessory'));

update wardrobe_items
set
  primary_category = coalesce(primary_category, clothing_type),
  specific_label = coalesce(specific_label, clothing_type);
