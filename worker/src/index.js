// Trens en viu · servidor d'avisos (Cloudflare Worker + Durable Object amb SQLite)
// Guarda els avisos que la gent activa i envia la notificació al mòbil a l'hora, encara que la web estigui tancada.
// Abans d'enviar, mira el temps real d'FGC: si el tren va tard, espera; si el retard creix, també avisa.
import { DurableObject } from 'cloudflare:workers';
import { envia, nousVapid } from './webpush.js';

const ORIGENS = ['https://trensenviu.cat', 'https://www.trensenviu.cat'];
const PUSH_OK = /^https:\/\/([a-z0-9-]+\.)*(push\.apple\.com|fcm\.googleapis\.com|googleapis\.com|push\.services\.mozilla\.com|notify\.windows\.com|push\.microsoft\.com)\//i;
const CONTACTE = 'https://trensenviu.cat';
const FGC = 'https://dadesobertes.fgc.cat/api/explore/v2.1/catalog/datasets/trip-updates-gtfs_realtime/records?limit=1';

const cors = o => ({ 'Access-Control-Allow-Origin': ORIGENS.includes(o) ? o : ORIGENS[0], 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' });
const json = (d, o, st = 200) => new Response(JSON.stringify(d), { status: st, headers: { 'Content-Type': 'application/json', ...cors(o) } });

export default {
  async fetch(req, env) {
    const o = req.headers.get('Origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(o) });
    if (req.method === 'POST' && o && !ORIGENS.includes(o)) return json({ error: 'origen' }, o, 403);
    const stub = env.AVISOS.get(env.AVISOS.idFromName('tots'));
    const url = new URL(req.url);
    try {
      if (req.method === 'GET' && url.pathname === '/vapid') return json({ key: await stub.clauPublica() }, o);
      if (req.method === 'GET' && url.pathname === '/') return json({ ok: true, servei: 'Trens en viu · avisos' }, o);
      if (req.method === 'POST') {
        const txt = await req.text(); if (txt.length > 8000) return json({ error: 'massa gran' }, o, 413);
        const d = JSON.parse(txt);
        if (url.pathname === '/avis') return json(await stub.desa(d), o);
        if (url.pathname === '/treu') return json(await stub.treu(d), o);
        if (url.pathname === '/prova') return json(await stub.prova(d), o);
      }
      return json({ error: 'no trobat' }, o, 404);
    } catch (e) { return json({ error: String(e.message || e) }, o, 400); }
  }
};

// ---- protobuf mínim per al temps real d'FGC
function pb(buf) {
  let i = 0; const out = [];
  const vint = () => { let r = 0, s = 1, b; do { b = buf[i++]; r += (b & 127) * s; s *= 128; } while (b & 128); return r; };
  while (i < buf.length) {
    const k = vint(), f = Math.floor(k / 8), w = k & 7;
    if (w === 0) out.push([f, vint()]);
    else if (w === 2) { const l = vint(); out.push([f, buf.subarray(i, i + l)]); i += l; }
    else if (w === 5) { i += 4; } else if (w === 1) { i += 8; } else break;
  }
  return out;
}
const td = new TextDecoder();
const get = (m, f) => { const x = m.find(e => e[0] === f); return x ? x[1] : undefined; };
const all = (m, f) => m.filter(e => e[0] === f).map(e => e[1]);
const sint = v => v > 2 ** 31 ? v - 2 ** 32 : v;
function netejarPB(b) {   // FGC de vegades enganxa avisos de PHP davant de les dades
  if (!b.length || b[0] !== 0x3c) return b;
  const txt = new TextDecoder('latin1').decode(b.subarray(0, Math.min(b.length, 200000)));
  const marca = '<br />\n'; let ult = -1, i = 0;
  while ((i = txt.indexOf(marca, i)) !== -1) { ult = i; i += marca.length; }
  return ult >= 0 ? b.subarray(ult + marca.length) : b;
}
async function tempsReal() {
  const m = await (await fetch(FGC, { cf: { cacheTtl: 20 } })).json();
  const r = await fetch(m.results[0].file.url, { cf: { cacheTtl: 20 } }); if (!r.ok) throw new Error('fgc ' + r.status);
  const feed = pb(netejarPB(new Uint8Array(await r.arrayBuffer()))); const map = new Map();
  all(feed, 2).forEach(eb => {
    const tub = get(pb(eb), 3); if (!tub) return; const tu = pb(tub); const trip = pb(get(tu, 1) || new Uint8Array());
    const id = get(trip, 1) ? td.decode(get(trip, 1)) : null; if (!id) return;
    map.set(id, all(tu, 2).map(sb => { const s = pb(sb);
      const ev = f => { const b = get(s, f); if (!b) return null; const q = pb(b); const t = get(q, 2), d = get(q, 1); return { t: t != null ? t * 1000 : null, d: d != null ? sint(d) : null }; };
      return { stop: get(s, 4) ? td.decode(get(s, 4)) : null, arr: ev(2), dep: ev(3) }; }));
  });
  return map;
}
// hora prevista de sortida del tren a l'estació (o null si FGC no en diu res)
function horaReal(rt, a) {
  const st = rt && rt.get(a.tid); if (!st) return null;
  const stops = JSON.parse(a.stops || '[]');
  const u = st.find(x => stops.includes(x.stop)); if (!u) return null;
  const e = u.dep || u.arr; if (!e) return null;
  if (e.t) return e.t; if (e.d != null) return a.prog + e.d * 1000; return null;
}

// ---- textos de les notificacions (ca/es/en)
const hm = ms => new Date(ms).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
const TXT = {
  ca: { cap: 'cap a', abans: (n, e, m, t, r) => `Passa per ${e} ${m < 1 ? 'ara' : `d'aquí a ${m} min`} (${t}${r >= 1 ? `, +${r}′ de retard` : ''})`, ret: (l, r) => `⚠️ ${l} porta +${r} min de retard`, nova: (d, e, t) => `Cap a ${d}. Nova hora a ${e}: ${t}`, prova: ['🔔 Prova d\'avís', 'Els avisos funcionen encara que tanquis la web.'] },
  es: { cap: 'hacia', abans: (n, e, m, t, r) => `Pasa por ${e} ${m < 1 ? 'ahora' : `en ${m} min`} (${t}${r >= 1 ? `, +${r}′ de retraso` : ''})`, ret: (l, r) => `⚠️ ${l} lleva +${r} min de retraso`, nova: (d, e, t) => `Hacia ${d}. Nueva hora en ${e}: ${t}`, prova: ['🔔 Prueba de aviso', 'Los avisos funcionan aunque cierres la web.'] },
  en: { cap: 'to', abans: (n, e, m, t, r) => `Passes ${e} ${m < 1 ? 'now' : `in ${m} min`} (${t}${r >= 1 ? `, +${r}′ late` : ''})`, ret: (l, r) => `⚠️ ${l} is running +${r} min late`, nova: (d, e, t) => `To ${d}. New time at ${e}: ${t}`, prova: ['🔔 Test alert', 'Alerts work even with the website closed.'] },
};

export class Avisos extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.sql = ctx.storage.sql; this.okEp = e => PUSH_OK.test(e || '') || (!!env.PROVA_ENDPOINT && String(e || '').startsWith(env.PROVA_ENDPOINT));
    this.sql.exec(`CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS avis(endpoint TEXT, id TEXT, p256dh TEXT, auth TEXT, tid TEXT, stops TEXT, prog INTEGER, min INTEGER, ret INTEGER,
        retav INTEGER DEFAULT 0, lin TEXT, dest TEXT, nom TEXT, lang TEXT, at INTEGER, sent INTEGER DEFAULT 0, chk INTEGER, PRIMARY KEY(endpoint,id))`);
  }
  async vapid() {
    const r = this.sql.exec(`SELECT v FROM kv WHERE k='vapid'`).toArray()[0];
    if (r) return JSON.parse(r.v);
    const v = await nousVapid(); this.sql.exec(`INSERT INTO kv VALUES('vapid',?)`, JSON.stringify(v)); return v;
  }
  async clauPublica() { return (await this.vapid()).pub; }

  async desa(d) {
    const s = d.sub || {}, k = s.keys || {};
    if (!this.okEp(s.endpoint) || !k.p256dh || !k.auth) throw new Error('subscripció no vàlida');
    const ara = Date.now(), prog = +d.prog, min = Math.max(1, Math.min(180, +d.min || 10));
    if (!(prog > ara - 3600e3 && prog < ara + 2 * 86400e3)) throw new Error('hora no vàlida');
    const n = this.sql.exec(`SELECT COUNT(*) n FROM avis WHERE endpoint=? AND id<>?`, s.endpoint, String(d.id)).toArray()[0].n;
    if (n >= 30) throw new Error('massa avisos');
    const at = Math.max(ara, (+d.est || prog) - min * 60000);
    const cut = (x, l) => String(x || '').slice(0, l);
    this.sql.exec(`INSERT OR REPLACE INTO avis(endpoint,id,p256dh,auth,tid,stops,prog,min,ret,retav,lin,dest,nom,lang,at,sent,chk) VALUES(?,?,?,?,?,?,?,?,?,0,?,?,?,?,?,0,?)`,
      s.endpoint, cut(d.id, 200), cut(k.p256dh, 200), cut(k.auth, 60), cut(d.tid, 120), JSON.stringify((d.stops || []).slice(0, 12).map(x => cut(x, 20))),
      prog, min, d.ret ? 1 : 0, cut(d.lin, 8), cut(d.dest, 80), cut(d.nom, 80), ['ca', 'es', 'en'].includes(d.lang) ? d.lang : 'ca', at, d.ret ? Math.max(ara, prog - 90 * 60000) : null);
    await this.programa(); return { ok: true, at };
  }
  async treu(d) {
    if (d.id === '*') this.sql.exec(`DELETE FROM avis WHERE endpoint=?`, String(d.endpoint || ''));
    else this.sql.exec(`DELETE FROM avis WHERE endpoint=? AND id=?`, String(d.endpoint || ''), String(d.id || ''));
    await this.programa(); return { ok: true };
  }
  async prova(d) {
    const s = d.sub || {}, k = s.keys || {}; if (!this.okEp(s.endpoint)) throw new Error('subscripció no vàlida');
    const t = (TXT[d.lang] || TXT.ca).prova;
    const st = await envia({ endpoint: s.endpoint, p256dh: k.p256dh, auth: k.auth }, { title: t[0], body: t[1], tag: 'prova' }, await this.vapid(), CONTACTE, 300);
    return { ok: st >= 200 && st < 300, status: st };
  }
  async programa() {
    const r = this.sql.exec(`SELECT MIN(x) m FROM (SELECT at x FROM avis WHERE sent=0 UNION ALL SELECT chk x FROM avis WHERE ret=1 AND sent=0 AND chk IS NOT NULL UNION ALL SELECT prog+1800000 x FROM avis)`).toArray()[0];
    if (r && r.m != null) await this.ctx.storage.setAlarm(Math.max(Date.now() + 1000, r.m)); else await this.ctx.storage.deleteAlarm();
  }
  async alarm() {
    const ara = Date.now();
    this.sql.exec(`DELETE FROM avis WHERE prog < ?`, ara - 30 * 60000);          // tren ja passat fa estona
    const pend = this.sql.exec(`SELECT rowid,* FROM avis WHERE sent=0 AND (at <= ? OR (ret=1 AND chk <= ?))`, ara + 20000, ara).toArray();
    if (pend.length) {
      let rt = null; try { rt = await tempsReal(); } catch (e) { }
      const vapid = await this.vapid(), morts = new Set();
      for (const a of pend) {
        if (morts.has(a.endpoint)) continue;
        const T = TXT[a.lang] || TXT.ca, real = horaReal(rt, a), t = real || a.prog, ret = Math.round((t - a.prog) / 60000);
        const sub = { endpoint: a.endpoint, p256dh: a.p256dh, auth: a.auth };
        const push = async (title, body, tag) => { const st = await envia(sub, { title, body, tag }, vapid, CONTACTE); if (st === 404 || st === 410) morts.add(a.endpoint); };
        let retav = a.retav;
        if (a.ret && ret >= 3 && ret >= a.retav + 2 && t > ara) { await push(T.ret(a.lin, ret), T.nova(a.dest, a.nom, hm(t)), 'ret-' + a.tid); retav = ret; }
        const objectiu = t - a.min * 60000;
        if (ara >= objectiu - 20000) {
          await push(`🚆 ${a.lin} ${T.cap} ${a.dest}`, T.abans(a.lin, a.nom, Math.max(0, Math.round((t - ara) / 60000)), hm(t), ret), 'abans-' + a.tid);
          this.sql.exec(`UPDATE avis SET sent=1, retav=? WHERE rowid=?`, retav, a.rowid);
        } else {
          // encara no toca: si FGC diu que va tard, s'espera a la nova hora; si cal vigilar retards, es torna a mirar d'aquí a 2 min
          this.sql.exec(`UPDATE avis SET at=?, retav=?, chk=? WHERE rowid=?`, objectiu, retav, a.ret ? ara + 120000 : null, a.rowid);
        }
      }
      morts.forEach(e => this.sql.exec(`DELETE FROM avis WHERE endpoint=?`, e));
    }
    await this.programa();
  }
}
