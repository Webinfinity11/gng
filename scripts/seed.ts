import pg from "pg";
import { defaultContact, defaultHero, seedProjects } from "../src/lib/seed";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in .env.local first.");
const pool = new pg.Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
const client = await pool.connect();
try {
  await client.query("begin");
  const h = defaultHero;
  await client.query("insert into hero (id,eyebrow,title,description,image_url,button_label,button_href,title_en,description_en,button_label_en) values (1,$1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict do nothing",[h.eyebrow,h.title,h.description,h.image_url,h.button_label,h.button_href,h.title_en,h.description_en,h.button_label_en]);
  const c = defaultContact;
  await client.query("insert into contact_settings (id,phone,phones,email,address,map_url,instagram,facebook,linkedin,address_en) values (1,$1,$9::jsonb,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing",[c.phone,c.email,c.address,c.map_url,c.instagram,c.facebook,c.linkedin,c.address_en,JSON.stringify(c.phones)]);
  for (const p of seedProjects) {
    await client.query("insert into projects (id,slug,title,summary,description,category,location,year,cover_url,images,status,featured,sort_order,title_en,location_en,category_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,$16) on conflict do nothing",[p.id,p.slug,p.title,p.summary,p.description,p.category,p.location,p.year,p.cover_url,JSON.stringify(p.images),p.status,p.featured,p.sort_order,p.title_en,p.location_en,p.category_id]);
  }
  await client.query("commit");
  console.log("GNG content seeded: projects with photographs are published, the rest are drafts. Existing edits were preserved.");
} catch (error) { await client.query("rollback"); throw error; }
finally { client.release(); await pool.end(); }
