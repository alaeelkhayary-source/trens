// Web Push sense llibreries: xifrat aes128gcm (RFC 8291) i signatura VAPID (RFC 8292) amb WebCrypto.
const te = new TextEncoder();
export const b64u = buf => { let s=''; new Uint8Array(buf).forEach(b=>s+=String.fromCharCode(b)); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
export const unb64u = s => { s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; const b=atob(s); return Uint8Array.from(b, c=>c.charCodeAt(0)); };
const cat = (...a) => { const o=new Uint8Array(a.reduce((n,x)=>n+x.length,0)); let i=0; a.forEach(x=>{ o.set(x,i); i+=x.length; }); return o; };

async function hkdf(salt, ikm, info, len){
  const k=await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF', hash:'SHA-256', salt, info}, k, len*8));
}

// claus VAPID noves: {pub: base64url (65 bytes), jwk: clau privada}
export async function nousVapid(){
  const kp=await crypto.subtle.generateKey({name:'ECDSA', namedCurve:'P-256'}, true, ['sign','verify']);
  const pub=new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const jwk=await crypto.subtle.exportKey('jwk', kp.privateKey);
  return {pub:b64u(pub), jwk};
}

async function jwtVapid(endpoint, vapid, sub){
  const aud=new URL(endpoint).origin, exp=Math.floor(Date.now()/1000)+12*3600;
  const h=b64u(te.encode(JSON.stringify({typ:'JWT', alg:'ES256'}))), c=b64u(te.encode(JSON.stringify({aud, exp, sub})));
  const key=await crypto.subtle.importKey('jwk', vapid.jwk, {name:'ECDSA', namedCurve:'P-256'}, false, ['sign']);
  const sig=await crypto.subtle.sign({name:'ECDSA', hash:'SHA-256'}, key, te.encode(h+'.'+c));
  return h+'.'+c+'.'+b64u(sig);
}

export async function xifra(payload, p256dh, auth){
  const ua=unb64u(p256dh), au=unb64u(auth);
  const eph=await crypto.subtle.generateKey({name:'ECDH', namedCurve:'P-256'}, true, ['deriveBits']);
  const asPub=new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey));
  const uaKey=await crypto.subtle.importKey('raw', ua, {name:'ECDH', namedCurve:'P-256'}, false, []);
  const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH', public:uaKey}, eph.privateKey, 256));
  const ikm=await hkdf(au, shared, cat(te.encode('WebPush: info\0'), ua, asPub), 32);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const cek=await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce=await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const k=await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv:nonce}, k, cat(te.encode(payload), new Uint8Array([2]))));
  const rs=new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096);
  return cat(salt, rs, new Uint8Array([asPub.length]), asPub, ct);
}

// envia una notificació; torna l'estat HTTP del servei de push (201 = ok, 404/410 = subscripció morta)
export async function envia(sub, dades, vapid, contacte, ttl=1800){
  const cos=await xifra(JSON.stringify(dades), sub.p256dh, sub.auth);
  const jwt=await jwtVapid(sub.endpoint, vapid, contacte);
  const r=await fetch(sub.endpoint, {method:'POST', body:cos, headers:{
    'Content-Encoding':'aes128gcm', 'Content-Type':'application/octet-stream', 'TTL':String(ttl), 'Urgency':'high',
    'Authorization':`vapid t=${jwt}, k=${vapid.pub}`}});
  return r.status;
}
