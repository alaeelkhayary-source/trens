/* Mapa Trens en viu sobre MapLibre GL.
   Ofereix el petit subconjunt de l'API de Leaflet que fa servir l'app (L.map, layerGroup, marker,
   polyline, geoJSON, circleMarker, circle, popup, latLngBounds…), però tot es dibuixa amb la targeta
   gràfica: vies, estacions i noms són capes GL (agrupades per capa, una sola font per grup) i els
   trens són marcadors. Permet girar el mapa (dos dits al mòbil; botó dret o Ctrl + arrossegar a l'ordinador). */
(function(){
'use strict';
const ml = window.maplibregl;
const DZ = 1;                       // zoom de Leaflet = zoom de MapLibre + 1 (teseles de 512 px)
const toLL = a => Array.isArray(a) ? {lat:+a[0], lng:+a[1]} : {lat:+a.lat, lng:+(a.lng ?? a.lon)};
const R = 6371000, rad = Math.PI/180;
function dist(a,b){ a=toLL(a); b=toLL(b); const dLa=(b.lat-a.lat)*rad, dLo=(b.lng-a.lng)*rad;
  const h=Math.sin(dLa/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
function LatLng(lat,lng){ this.lat=lat; this.lng=lng; }
LatLng.prototype.distanceTo=function(o){ return dist(this,o); };
const mkLL = a => { const p=toLL(a); return new LatLng(p.lat,p.lng); };

/* ---------- LatLngBounds ---------- */
function Bounds(a,b){ this._s=Infinity; this._w=Infinity; this._n=-Infinity; this._e=-Infinity;
  if(a && b!==undefined){ this.extend(a); this.extend(b); }
  else if(Array.isArray(a)) a.forEach(p=>this.extend(p)); }
Bounds.prototype.extend=function(o){
  if(o instanceof Bounds){ if(o.isValid()){ this.extend([o._s,o._w]); this.extend([o._n,o._e]); } return this; }
  const p=toLL(o); if(!isFinite(p.lat)||!isFinite(p.lng)) return this;
  this._s=Math.min(this._s,p.lat); this._n=Math.max(this._n,p.lat); this._w=Math.min(this._w,p.lng); this._e=Math.max(this._e,p.lng); return this; };
Bounds.prototype.isValid=function(){ return isFinite(this._s)&&isFinite(this._n); };
Bounds.prototype.pad=function(k){ const dy=(this._n-this._s)*k, dx=(this._e-this._w)*k; const b=new Bounds(); b._s=this._s-dy; b._n=this._n+dy; b._w=this._w-dx; b._e=this._e+dx; return b; };
Bounds.prototype.contains=function(o){ if(o instanceof Bounds) return this.contains([o._s,o._w])&&this.contains([o._n,o._e]);
  const p=toLL(o); return p.lat>=this._s&&p.lat<=this._n&&p.lng>=this._w&&p.lng<=this._e; };
Bounds.prototype.getSouthWest=function(){ return new LatLng(this._s,this._w); };
Bounds.prototype.getNorthEast=function(){ return new LatLng(this._n,this._e); };
Bounds.prototype.getCenter=function(){ return new LatLng((this._s+this._n)/2,(this._w+this._e)/2); };
Bounds.prototype.toML=function(){ return [[this._w,this._s],[this._e,this._n]]; };

/* ---------- Esdeveniments ---------- */
const Ev = {
  on(t,fn){ (this._h||(this._h={})); t.split(/\s+/).forEach(k=>(this._h[k]||(this._h[k]=[])).push(fn)); return this; },
  off(t,fn){ if(this._h) t.split(/\s+/).forEach(k=>{ this._h[k]=(this._h[k]||[]).filter(f=>f!==fn); }); return this; },
  fire(t,e){ ((this._h&&this._h[t])||[]).slice().forEach(f=>f.call(this,e||{})); return this; }
};

/* ---------- Mapa ---------- */
let MAP=null;            // embolcall (n'hi ha un)
let seqGroup=0, seqFeat=0;
function MapW(id, opts){
  this._h={}; this._groups=new Set(); this._popup=null;
  const el=typeof id==='string'?document.getElementById(id):id;
  this._el=el;
  this.ml=new ml.Map({ container:el, style:opts.style, center:[2.03,41.47], zoom:11-DZ,
    attributionControl:false, pitchWithRotate:false, maxPitch:0, dragRotate:true, touchPitch:false,
    fadeDuration:0, antialias:false, refreshExpiredTiles:false, maxTileCacheSize:300,
    pixelRatio:Math.min(window.devicePixelRatio||1,2), maxZoom:18.5, crossSourceCollisions:false,
    cooperativeGestures:false, trackResize:false });
  // canvi de mida gestionat aquí (fora del cicle de dibuix de MapLibre, que si no a vegades falla)
  { let pend=false; const ro=new ResizeObserver(()=>{ if(pend) return; pend=true; requestAnimationFrame(()=>{ pend=false; try{ this.ml.resize(); }catch(e){} }); }); ro.observe(el); }
  try{ this.ml.touchPitch.disable(); this.ml.keyboard.disableRotation?.(); }catch(e){}
  this._loaded=false;
  this.ml.on('style.load',()=>{ this._loaded=true; this._groups.forEach(g=>g._glInit(true)); this.fire('styleload'); });
  ['movestart','moveend','zoomstart','zoomend','dragstart','dragend','rotate','rotateend'].forEach(k=>this.ml.on(k,e=>this.fire(k,e)));
  // clic al mapa fora de cap element: tanca la bombolla
  this.ml.on('click',e=>{ if(e._shimHit) return; const t=e.originalEvent&&e.originalEvent.target; if(t&&t.closest&&t.closest('.maplibregl-marker,.maplibregl-popup')) return; this.closePopup(); this.fire('click',e); });
  MAP=this;
}
Object.assign(MapW.prototype, Ev, {
  getZoom(){ return this.ml.getZoom()+DZ; },
  getCenter(){ const c=this.ml.getCenter(); return new LatLng(c.lat,c.lng); },
  setView(ll,z,o){ const p=toLL(ll); const opts={center:[p.lng,p.lat], zoom:(z??this.getZoom())-DZ};
    if(o&&o.animate===false) this.ml.jumpTo(opts); else this.ml.easeTo({...opts, duration:500}); return this; },
  setZoom(z){ this.ml.easeTo({zoom:z-DZ, duration:300}); return this; },
  panTo(ll,o){ const p=toLL(ll), c=this.ml.getCenter();
    if(Math.abs(c.lat-p.lat)<1e-7 && Math.abs(c.lng-p.lng)<1e-7) return this;
    if(o&&o.animate===false){ if(this._panning || this.ml.isEasing() || this.ml.isMoving()) return this; this._panning=true; try{ this.ml.jumpTo({center:[p.lng,p.lat]}); } finally { this._panning=false; } }
    else this.ml.easeTo({center:[p.lng,p.lat], duration:450});
    return this; },
  panBy(xy){ this.ml.panBy(xy,{duration:250}); return this; },
  zoomIn(){ this.ml.zoomIn({duration:250}); return this; },
  zoomOut(){ this.ml.zoomOut({duration:250}); return this; },
  fitBounds(b,o={}){
    if(!(b instanceof Bounds)) b=new Bounds(b); if(!b.isValid()) return this;
    const pad={top:20,right:20,bottom:20,left:20};
    if(o.padding){ pad.left=pad.right=o.padding[0]; pad.top=pad.bottom=o.padding[1]; }
    if(o.paddingTopLeft){ pad.left=o.paddingTopLeft[0]; pad.top=o.paddingTopLeft[1]; }
    if(o.paddingBottomRight){ pad.right=o.paddingBottomRight[0]; pad.bottom=o.paddingBottomRight[1]; }
    const W=this._el.clientWidth, H=this._el.clientHeight;   // si el marge no hi cap, es redueix
    if(pad.left+pad.right>W-40){ const k=(W-40)/(pad.left+pad.right); pad.left*=k; pad.right*=k; }
    if(pad.top+pad.bottom>H-40){ const k=(H-40)/(pad.top+pad.bottom); pad.top*=k; pad.bottom*=k; }
    const opts={padding:pad, bearing:this.ml.getBearing(), duration:o.animate===false?0:600};
    if(o.maxZoom) opts.maxZoom=o.maxZoom-DZ;
    try{ this.ml.fitBounds(b.toML(), opts); }catch(e){}
    return this; },
  getBounds(){ const c=this.ml.getCanvas(), w=c.clientWidth, h=c.clientHeight; const b=new Bounds();
    [[0,0],[w,0],[0,h],[w,h]].forEach(([x,y])=>{ const p=this.ml.unproject([x,y]); b.extend([p.lat,p.lng]); }); return b; },
  distance(a,b){ return dist(a,b); },
  latLngToContainerPoint(ll){ const p=toLL(ll); const q=this.ml.project([p.lng,p.lat]); return {x:q.x,y:q.y}; },
  hasLayer(l){ return !!l && l._map===this; },
  addLayer(l){ l.addTo(this); return this; },
  removeLayer(l){ l && l.remove && l.remove(); return this; },
  closePopup(p){ p=p||this._popup; if(p) p.remove(); return this; },
  createPane(){ return {style:{}}; },
  invalidateSize(){ this.ml.resize(); return this; },
  getBearing(){ return this.ml.getBearing(); },
  // seguir un tren: s'hi apropa i el deixa al centre de la part visible (sense la fitxa ni el panell)
  seguir(ll){ const p=toLL(ll), mob=window.innerWidth<=900, H=window.innerHeight;
    const pad = mob ? {top:110, bottom:Math.round(H*0.46), left:0, right:0} : {top:90, bottom:30, left:380, right:430};
    this.ml.easeTo({center:[p.lng,p.lat], zoom:Math.max(this.ml.getZoom(), 14.3-DZ), padding:pad, duration:800}); },
  alliberar(){ this.ml.easeTo({padding:{top:0,bottom:0,left:0,right:0}, duration:300}); },
  resetNorth(){ this.ml.easeTo({bearing:0, pitch:0, duration:400}); },
  setBaseStyle(url){ if(this._styleUrl===url) return; this._styleUrl=url; this._loaded=false; this.ml.setStyle(url,{diff:false}); },
  // capa implícita per a elements afegits directament al mapa
  _solo(layer){ const g=new Group([]); g._solo=true; g.addTo(this); g.addLayer(layer); layer._soloGroup=g; return this; }
});

/* ---------- Grups de capes (una font GL per grup) ---------- */
function Group(list){ this._id='g'+(++seqGroup); this._layers=new Set(); this._map=null; this._dirty=false; this._z=seqGroup;
  (list||[]).forEach(l=>this.addLayer(l)); }
Object.assign(Group.prototype, Ev, {
  addTo(t){ if(t instanceof Group){ t.addLayer(this); return this; }
    if(this._map===t) return this; this._map=t; t._groups.add(this);
    this._layers.forEach(l=>l._attach(this)); this._glInit(); this._mark(); return this; },
  remove(){ if(!this._map) return this; const m=this._map; this._layers.forEach(l=>l._detach()); this._glDestroy(); m._groups.delete(this); this._map=null; return this; },
  addLayer(l){ if(l._group && l._group!==this) l._group.removeLayer(l); this._layers.add(l); l._group=this; if(this._map) l._attach(this); this._mark(); return this; },
  removeLayer(l){ if(!this._layers.has(l)) return this; this._layers.delete(l); l._detach(); l._group=null; this._mark(); return this; },
  clearLayers(){ this._layers.forEach(l=>{ l._detach(); l._group=null; }); this._layers.clear(); this._mark(); return this; },
  eachLayer(fn){ this._layers.forEach(fn); return this; },
  getLayers(){ return [...this._layers]; },
  hasLayer(l){ return this._layers.has(l); },
  _mark(){ if(this._dirty||!this._map) return; this._dirty=true; requestAnimationFrame(()=>{ this._dirty=false; this._flush(); }); },
  _ids(){ const i=this._id; return {src:i, line:i+'l', dash:i+'d', hit:i+'h', circ:i+'c', fill:i+'f', lab:i+'t'}; },
  _glInit(force){
    const m=this._map; if(!m||!m._loaded) return; const g=m.ml, id=this._ids();
    if(g.getSource(id.src) && !force) return;
    if(!g.getSource(id.src)) g.addSource(id.src,{type:'geojson', data:{type:'FeatureCollection',features:[]}, tolerance:.6, buffer:64});
    const add=(lay)=>{ if(g.getLayer(lay.id)) return; g.addLayer(lay, this._before(lay._k)); };
    const tipus = k => ['==',['get','k'],k];
    add({id:id.fill, _k:1, type:'fill', source:id.src, filter:tipus('a'), paint:{'fill-color':['get','fc'],'fill-opacity':['get','fo']}});
    add({id:id.line, _k:2, type:'line', source:id.src, filter:['all',tipus('l'),['!=',['get','dash'],1]], layout:{'line-cap':'round','line-join':'round','line-sort-key':['get','z']},
         paint:{'line-color':['get','c'],'line-width':['get','w'],'line-opacity':['get','o']}});
    add({id:id.dash, _k:2, type:'line', source:id.src, filter:['all',tipus('l'),['==',['get','dash'],1]], layout:{'line-cap':'round'},
         paint:{'line-color':['get','c'],'line-width':['get','w'],'line-opacity':['get','o'],'line-dasharray':[1,3]}});
    add({id:id.circ, _k:3, type:'circle', source:id.src, filter:tipus('c'),
         paint:{'circle-radius':['get','r'],'circle-color':['get','fc'],'circle-opacity':['get','fo'],'circle-stroke-color':['get','c'],'circle-stroke-width':['get','w'],'circle-stroke-opacity':['get','o'],'circle-pitch-alignment':'viewport'}});
    add({id:id.hit, _k:3, type:'circle', source:id.src, filter:['all',tipus('c'),['==',['get','i'],1]], paint:{'circle-radius':['max',14,['get','r']],'circle-opacity':0,'circle-pitch-alignment':'viewport'}});
    add({id:id.lab, _k:4, type:'symbol', source:id.src, filter:['all',tipus('c'),['has','lab']],
         layout:{'text-field':['get','lab'],'text-font':['Noto Sans Regular'],'text-size':11.5,'text-anchor':'left','text-offset':[0.9,0],'text-optional':true,'text-padding':2,'text-max-width':14,'symbol-sort-key':['get','ls']},
         paint:{'text-color':['get','tc'],'text-halo-color':['get','hc'],'text-halo-width':1.6}});
    if(!this._evOk){ this._evOk=true; this._bindEvents(); }
    this._flush();
  },
  _before(k){ // ordre: per tipus (àrees < línies < cercles < noms) i, dins de cada tipus, per ordre de creació del grup
    const g=this._map.ml, rank=k*100000+this._z; let best=null, bestRank=Infinity;
    this._map._groups.forEach(o=>{ if(o===this) return; const ids=o._ids();
      [[ids.fill,1],[ids.line,2],[ids.dash,2],[ids.circ,3],[ids.hit,3],[ids.lab,4]].forEach(([lid,kk])=>{ const r=kk*100000+o._z; if(r>rank && r<bestRank && g.getLayer(lid)){ best=lid; bestRank=r; } }); });
    return best||undefined; },
  _bindEvents(){
    const m=this._map, g=m.ml, id=this._ids(); this._hov=null;
    const feat = e => { const f=e.features&&e.features[0]; return f ? this._byFid(f.properties.fid) : null; };
    g.on('click', id.hit, e=>{ const l=feat(e); if(l){ e._shimHit=true; if(e.originalEvent) e.originalEvent._shimHit=true; l.fire('click',{latlng:l.getLatLng()}); } });
    g.on('mousemove', id.hit, e=>{ const l=feat(e); if(l!==this._hov){ if(this._hov){ this._hov.fire('mouseout'); this._hov._showTip&&this._hov._showTip(false); } this._hov=l; if(l){ g.getCanvas().style.cursor='pointer'; l.fire('mouseover'); l._showTip&&l._showTip(true); } } });
    g.on('mouseleave', id.hit, ()=>{ if(this._hov){ this._hov.fire('mouseout'); this._hov._showTip&&this._hov._showTip(false); this._hov=null; } g.getCanvas().style.cursor=''; });
  },
  _byFid(fid){ for(const l of this._layers) if(l._fid===fid) return l; return null; },
  _flush(){
    const m=this._map; if(!m||!m._loaded) return; const s=m.ml.getSource(this._ids().src); if(!s) return;
    const fs=[]; this._layers.forEach(l=>{ if(l._feature){ const f=l._feature(); if(f) fs.push(f); } });
    s.setData({type:'FeatureCollection', features:fs});
  },
  _glDestroy(){ const m=this._map; if(!m||!m._loaded) return; const g=m.ml, id=this._ids();
    [id.lab,id.hit,id.circ,id.dash,id.line,id.fill].forEach(l=>{ if(g.getLayer(l)) g.removeLayer(l); }); if(g.getSource(id.src)) g.removeSource(id.src); this._evOk=false; }
});

/* ---------- Capa base (vectorial dins d'un grup) ---------- */
const Base = Object.assign({}, Ev, {
  addTo(t){ if(t instanceof Group) t.addLayer(this); else if(t instanceof MapW) t._solo(this); return this; },
  remove(){ if(this._soloGroup){ const g=this._soloGroup; this._soloGroup=null; g.remove(); return this; } if(this._group) this._group.removeLayer(this); return this; },
  _attach(g){ this._map=g._map; this._tipAttach&&this._tipAttach(); },
  _detach(){ this._tipDetach&&this._tipDetach(); this._map=null; },
  setStyle(s){ Object.assign(this.options,s); this._group&&this._group._mark(); return this; },
  bindTooltip(html,o={}){ this._tip={html:String(html), o}; return this; },
});

/* Polilínia / GeoJSON de línies */
function Line(coords, o){ this.options=Object.assign({color:'#3388ff',weight:3,opacity:1},o||{}); this._fid=++seqFeat; this._z=seqFeat; this._set(coords); }
Line.prototype=Object.assign(Object.create(Base),{
  _set(c){ this._coords=c; },
  setLatLngs(pts){ this._coords={type:'LineString', coordinates:pts.map(p=>{ const q=toLL(p); return [q.lng,q.lat]; })}; this._group&&this._group._mark(); return this; },
  getBounds(){ const b=new Bounds(); const walk=a=>{ if(typeof a[0]==='number') b.extend([a[1],a[0]]); else a.forEach(walk); }; walk(this._coords.coordinates); return b; },
  eachLayer(fn){ fn(this); return this; }, getLayers(){ return [this]; },
  _feature(){ const o=this.options; return {type:'Feature', geometry:this._coords,
    properties:{k:'l', fid:this._fid, z:this._z, c:o.color, w:o.weight, o:o.opacity, dash:o.dashArray?1:0}}; }
});

/* Cercle de mida fixa en píxels (estacions) */
function Circ(ll,o){ this._ll=mkLL(ll); this.options=Object.assign({radius:10,color:'#3388ff',weight:3,opacity:1,fillColor:null,fillOpacity:.2,interactive:true},o||{}); this._fid=++seqFeat; }
Circ.prototype=Object.assign(Object.create(Base),{
  getLatLng(){ return this._ll; },
  setLatLng(ll){ this._ll=mkLL(ll); this._group&&this._group._mark(); this._tipPos&&this._tipPos(); return this; },
  _feature(){ const o=this.options, t=this._tip; const p={k:'c', fid:this._fid, r:o.radius, c:o.color, w:o.weight, o:o.opacity, fc:o.fillColor||o.color, fo:o.fillOpacity, i:o.interactive===false?0:1};
    if(t && t.o.permanent && /\bstl\b/.test(t.o.className||'')){ const fosc=document.documentElement.classList.contains('dark');
      p.lab=t.html.replace(/<[^>]+>/g,''); p.ls=/★/.test(p.lab)?0:1; p.tc=fosc?'#d5dbe1':'#3c4650'; p.hc=fosc?'#0f1114':'#ffffff'; }
    return {type:'Feature', geometry:{type:'Point', coordinates:[this._ll.lng,this._ll.lat]}, properties:p}; },
  // tooltips HTML (no "stl"): element DOM a sobre del punt, fix o en passar-hi el cursor
  _tipAttach(){ const t=this._tip; if(!t || /\bstl\b/.test(t.o.className||'')) return;
    const el=document.createElement('div'); el.className='ltt '+(t.o.className||''); el.innerHTML=t.html;
    this._tipM=new ml.Marker({element:el, anchor:'bottom', offset:[(t.o.offset||[0,0])[0], (t.o.offset||[0,-6])[1]-4]}).setLngLat([this._ll.lng,this._ll.lat]);
    if(t.o.permanent) this._tipM.addTo(this._map.ml); },
  _tipDetach(){ if(this._tipM){ this._tipM.remove(); this._tipM=null; } },
  _tipPos(){ this._tipM&&this._tipM.setLngLat([this._ll.lng,this._ll.lat]); },
  _showTip(on){ const t=this._tip; if(!this._tipM||!t||t.o.permanent) return; if(on) this._tipM.addTo(this._map.ml); else this._tipM.remove(); }
});

/* Cercle amb radi en metres (precisió de la ubicació) */
function Area(ll,o){ this._ll=mkLL(ll); this.options=Object.assign({radius:100,color:'#3388ff',weight:1,opacity:1,fillOpacity:.2},o||{}); this._fid=++seqFeat; }
Area.prototype=Object.assign(Object.create(Base),{
  getLatLng(){ return this._ll; },
  _feature(){ const o=this.options, n=48, c=[], la=this._ll.lat, lo=this._ll.lng, dy=o.radius/110540, dx=o.radius/(111320*Math.cos(la*rad));
    for(let i=0;i<=n;i++){ const a=i/n*2*Math.PI; c.push([lo+dx*Math.cos(a), la+dy*Math.sin(a)]); }
    return {type:'Feature', geometry:{type:'Polygon', coordinates:[c]}, properties:{k:'a', fid:this._fid, fc:o.fillColor||o.color, fo:o.fillOpacity}}; }
});

/* ---------- Marcadors DOM (trens, ciutats, punt blau) ---------- */
function Icon(o){ this.options=o||{}; }
function Marker(ll,o){ this._ll=mkLL(ll); this.options=Object.assign({},o||{}); this._h={};
  const el=document.createElement('div'); el.className='lmk'; this._el=el; this._in=document.createElement('div'); el.appendChild(this._in); this._apply(this.options.icon);
  if(this.options.interactive===false) el.style.pointerEvents='none';
  if(this.options.zIndexOffset>0) el.style.zIndex=this.options.zIndexOffset;
  el.addEventListener('click',e=>{ if(this._h.click){ e.stopPropagation(); this.fire('click',{latlng:this._ll}); } });
}
Marker.prototype=Object.assign(Object.create(Ev),{
  _apply(icon){ const o=(icon&&icon.options)||{}, el=this._el, inn=this._in;
    inn.className=o.className||''; inn.innerHTML=o.html||'';
    const sz=o.iconSize||[0,0], an=o.iconAnchor||[sz[0]/2,sz[1]/2];
    el.style.width=inn.style.width=sz[0]+'px'; el.style.height=inn.style.height=sz[1]+'px'; inn.style.position='relative';
    this._off=[sz[0]/2-an[0], sz[1]/2-an[1]];
    if(this._m) this._m.setOffset(this._off); },
  addTo(t){ if(t instanceof MapW){ this._attach({_map:t}); } else if(t instanceof Group){ t.addLayer(this); } return this; },
  _attach(g){ this._map=g._map; if(!this._m) this._m=new ml.Marker({element:this._el, anchor:'center', offset:this._off||[0,0]}); this._m.setLngLat([this._ll.lng,this._ll.lat]).addTo(this._map.ml); },
  _detach(){ if(this._m) this._m.remove(); this._map=null; },
  remove(){ if(this._group) this._group.removeLayer(this); else this._detach(); return this; },
  getLatLng(){ return this._ll; },
  setLatLng(ll){ const p=toLL(ll); this._ll.lat=p.lat; this._ll.lng=p.lng; if(this._m) this._m.setLngLat([p.lng,p.lat]); return this; },
  setIcon(icon){ this.options.icon=icon; this._apply(icon); return this; },
  setZIndexOffset(z){ this._el.style.zIndex=z>0?z:''; return this; },
  getElement(){ return this._el; },
  bindTooltip(){ return this; }
});

/* ---------- Bombolla (popup) ---------- */
function Popup(o){ this.options=Object.assign({offset:[0,-8],autoPan:true,autoPanPaddingTopLeft:[10,10],autoPanPaddingBottomRight:[10,10]},o||{}); this._html=''; }
Popup.prototype={
  setLatLng(ll){ this._ll=mkLL(ll); this._p&&this._p.setLngLat([this._ll.lng,this._ll.lat]); return this; },
  setContent(h){ this._html=h; if(this._p){ this._p.setHTML(h); } return this; },
  getElement(){ return this._p&&this._p.getElement(); },
  openOn(map){
    if(map._popup && map._popup!==this) map._popup.remove();
    const o=this.options;
    if(!this._p){ this._p=new ml.Popup({closeButton:!!o.closeButton, closeOnClick:false, closeOnMove:false, className:o.className||'', maxWidth:(o.maxWidth||300)+'px', anchor:'bottom', offset:Math.abs((o.offset||[0,-8])[1])+4, focusAfterOpen:false});
      this._p.on('close',()=>{ if(this._map){ const m=this._map; this._map=null; if(m._popup===this) m._popup=null; m.fire('popupclose',{popup:this}); } }); }
    this._map=map; map._popup=this;
    this._p.setLngLat([this._ll.lng,this._ll.lat]).setHTML(this._html).addTo(map.ml);
    if(o.autoPan) requestAnimationFrame(()=>this._adjustPan());
    return this; },
  remove(){ if(this._p) this._p.remove(); return this; },
  _adjustPan(){ const m=this._map; if(!m||!this._p) return; const el=this._p.getElement(); if(!el) return;
    const r=el.getBoundingClientRect(), c=m._el.getBoundingClientRect(), o=this.options;
    const tl=o.autoPanPaddingTopLeft||[10,10], br=o.autoPanPaddingBottomRight||[10,10]; let dx=0, dy=0;
    if(r.top < c.top+tl[1]) dy=r.top-(c.top+tl[1]); else if(r.bottom > c.bottom-br[1]) dy=r.bottom-(c.bottom-br[1]);
    if(r.left < c.left+tl[0]) dx=r.left-(c.left+tl[0]); else if(r.right > c.right-br[0]) dx=r.right-(c.right-br[0]);
    if(dx||dy) m.ml.panBy([dx,dy],{duration:250}); }
};

/* ---------- Control de crèdits ---------- */
function Attribution(o){ this.o=o||{}; }
Attribution.prototype.addTo=function(map){ map.ml.addControl(new ml.AttributionControl({compact:true}), 'bottom-left'); return this; };

window.L = {
  map:(id,o)=>new MapW(id,o||{}),
  layerGroup:l=>new Group(l),
  marker:(ll,o)=>new Marker(ll,o),
  divIcon:o=>new Icon(o),
  polyline:(pts,o)=>{ const l=new Line(null,o); l.setLatLngs(pts); return l; },
  geoJSON:(g,o)=>{ const geo=g.type==='Feature'?g.geometry:g; o=Object.assign({},o||{}, (o&&o.style)||{}); delete o.style; return new Line(geo,o); },
  circleMarker:(ll,o)=>new Circ(ll,o),
  circle:(ll,o)=>new Area(ll,o),
  popup:o=>new Popup(o),
  latLngBounds:(a,b)=>new Bounds(a,b),
  latLng:(a,b)=>b!==undefined?new LatLng(a,b):mkLL(a),
  canvas:()=>null,
  control:{attribution:o=>new Attribution(o)},
  DomEvent:{stopPropagation(e){ e&&e.stopPropagation&&e.stopPropagation(); }}
};
})();
