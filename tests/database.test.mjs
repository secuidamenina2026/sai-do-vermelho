import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const owner = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
test('PostgreSQL: financial persistence, RLS, consent, scheduling and idempotency', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'sdv-pr2-db-'))
  let db = new PGlite(folder)
  const asUser = async id => db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`)
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      grant usage on schema auth,public to anon,authenticated,service_role;
      grant execute on function auth.uid() to anon,authenticated,service_role;`)
    await db.exec(await readFile('database.sql', 'utf8'))
    await db.exec(`insert into auth.users values ('${owner}'),('${other}');
      insert into public.users(id,email) values ('${owner}','test1@example.invalid'),('${other}','test2@example.invalid');`)
    for (const file of (await readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()) {
      await db.exec(await readFile(join('supabase/migrations', file), 'utf8'))
    }
    await asUser(owner)
    await db.exec(`insert into public.income_entries(user_id,description,amount,category,expected_date) values ('${owner}','PR2 entrada',123.45,'salary','2026-10-14');
      insert into public.expenses(user_id,description,category,actual_amount,month,due_date,status) values ('${owner}','PR2 gasto','mercado',45.67,'2026-10-01','2026-10-14','paid');`)
    assert.equal((await db.query('select * from income_entries')).rows.length, 1)
    assert.equal(Number((await db.query('select actual_amount from expenses')).rows[0].actual_amount), 45.67)
    await db.exec("update income_entries set status='received',received_date='2026-10-14'")
    await db.close(); db = new PGlite(folder)
    await asUser(owner)
    assert.equal((await db.query('select status from income_entries')).rows[0].status, 'received')
    assert.equal((await db.query('select description from expenses')).rows[0].description, 'PR2 gasto')
    await asUser(other)
    assert.equal((await db.query('select * from income_entries')).rows.length, 0)
    assert.equal((await db.query('select * from expenses')).rows.length, 0)
    await assert.rejects(db.exec(`insert into income_entries(user_id,description,amount,category,expected_date) values ('${owner}','forbidden',1,'other',current_date)`))
    assert.equal((await db.query("delete from expenses returning id")).rows.length, 0)
    await asUser(owner)
    await assert.rejects(db.exec(`update expenses set user_id='${other}'`))
    await assert.rejects(db.exec(`insert into tip_admins values ('${owner}')`))
    await assert.rejects(db.exec(`insert into tip_campaigns(title,body,href,kind,created_by) values ('forbidden','body','/dashboard','tip','${owner}')`))
    await db.exec(`reset role; insert into tip_admins values ('${owner}');`)
    await asUser(owner)
    await db.exec(`insert into notification_preferences(user_id,tips_enabled,offers_enabled) values ('${owner}',true,false);
      insert into tip_campaigns(title,body,href,kind,status,scheduled_at,created_by) values ('future','body','/dashboard','tip','scheduled',now()+interval '1 day','${owner}');`)
    await assert.rejects(db.exec('select deliver_due_tips()'))
    await assert.rejects(db.exec("update tip_campaigns set status='sent'"))
    await assert.rejects(db.exec("update tip_campaigns set title='tamper'"))
    await db.exec("update tip_campaigns set status='canceled' where title='future'")
    await db.exec(`reset role; insert into tip_campaigns(title,body,href,kind,status,scheduled_at,created_by) values
      ('due','body','/dashboard','tip','scheduled',now()-interval '1 minute','${owner}'),
      ('offer','body','/dashboard','offer','scheduled',now()-interval '1 minute','${owner}'),
      ('later','body','/dashboard','tip','scheduled',now()+interval '1 day','${owner}');
      set role service_role;`)
    assert.equal((await db.query('select deliver_due_tips() as n')).rows[0].n, 1)
    assert.equal((await db.query('select deliver_due_tips() as n')).rows[0].n, 0)
    await asUser(owner)
    assert.equal((await db.query('select title from notifications')).rows[0].title, 'due')
    await db.exec('update notifications set read_at=now()')
    assert.ok((await db.query('select read_at from notifications')).rows[0].read_at)
    await assert.rejects(db.exec("update notifications set title='tamper'"))
    await asUser(other)
    assert.equal((await db.query('select * from notifications')).rows.length, 0)
    assert.equal((await db.query('select * from tip_campaigns')).rows.length, 0)
    assert.equal((await db.query('update notifications set read_at=now() returning id')).rows.length, 0)
    await db.exec('reset role; set role anon;')
    await assert.rejects(db.exec('select * from notifications'))
    await assert.rejects(db.exec('select deliver_due_tips()'))
    await asUser(owner)
    assert.equal((await db.query('delete from expenses returning id')).rows.length, 1)
    assert.equal((await db.query('select * from expenses')).rows.length, 0)
  } finally { await db.close(); await rm(folder, { recursive: true, force: true }) }
})
