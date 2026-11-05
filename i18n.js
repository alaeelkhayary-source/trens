/* Idiomes de Trens en viu: català (per defecte), castellà i anglès.
   La web està escrita en català; aquí es tradueixen els textos de la pantalla quan l'idioma triat és un altre.
   Cada fila: [català, castellà, anglès]. Les frases llargues van primer automàticament. */
(function(){
const D = [
["Trens en viu","Trens en viu","Trens en viu"],
// ---- capçalera i pestanyes
["Trens en viu · FGC en directe","Trens en viu · FGC en directo","Trens en viu · FGC live trains"],
["Carregant la xarxa d'FGC…","Cargando la red de FGC…","Loading the FGC network…"],
["En directe · calculant retards…","En directo · calculando retrasos…","Live · calculating delays…"],
["En directe","En directo","Live"],
["Connectant…","Conectando…","Connecting…"],
["Reintentant…","Reintentando…","Retrying…"],
["Sense connexió amb FGC. Reintentant…","Sin conexión con FGC. Reintentando…","No connection to FGC. Retrying…"],
["Sense connexió amb FGC","Sin conexión con FGC","No connection to FGC"],
["posicions FGC fa","posiciones FGC hace","FGC positions"],
["amb retard","con retraso","delayed"],
["mitjana","media","average"],
["Instal·lar com a app","Instalar como app","Install as app"],
["Instal·lar aplicació","Instalar aplicación","Install app"],
["Instal·lar app","Instalar app","Install app"],
["Fer una donació","Hacer una donación","Donate"],
["Donar","Donar","Donate"],
["★ Preferides","★ Favoritas","★ Favourites"],
["Preferides","Favoritas","Favourites"],
["Trens","Trenes","Trains"],
["Viatge","Viaje","Trip"],
["Mapa","Mapa","Map"],
["Retards","Retrasos","Delays"],
["Tancar","Cerrar","Close"],
["Tota la xarxa","Toda la red","Whole network"],
["Orientar al nord","Orientar al norte","Point north"],
["Estació més propera","Estación más cercana","Nearest station"],
["Apropar","Acercar","Zoom in"],
["Allunyar","Alejar","Zoom out"],
["Veure tota la xarxa","Ver toda la red","Show whole network"],
["Tema automàtic segons l'hora (toca per canviar)","Tema automático según la hora (toca para cambiar)","Automatic theme by time of day (tap to change)"],
["Sempre clar (toca per canviar)","Siempre claro (toca para cambiar)","Always light (tap to change)"],
["Sempre fosc (toca per canviar)","Siempre oscuro (toca para cambiar)","Always dark (tap to change)"],
["Automàtic: fosc de","Automático: oscuro de","Automatic: dark from"],
["Sempre clar","Siempre claro","Always light"],
["Sempre fosc","Siempre oscuro","Always dark"],
["Tema","Tema","Theme"],
["Idioma","Idioma","Language"],
// ---- cercador i selector d'hora
["Busca la teva estació","Busca tu estación","Search your station"],
["Cap estació amb aquest nom","Ninguna estación con este nombre","No station with that name"],
["Escriu el nom de la teva estació o toca una estació al mapa per veure els propers trens amb l'hora real.","Escribe el nombre de tu estación o toca una estación en el mapa para ver los próximos trenes con la hora real.","Type your station's name or tap a station on the map to see the next trains in real time."],
["🚆 Hora de sortida","🚆 Hora de salida","🚆 Departure time"],
["🏁 Hora d'arribada","🏁 Hora de llegada","🏁 Arrival time"],
["Tipus d'hora","Tipo de hora","Time type"],
["Temps real · toca per triar dia i hora","Tiempo real · toca para elegir día y hora","Real time · tap to pick day and time"],
["Toca per triar dia i hora","Toca para elegir día y hora","Tap to pick day and time"],
["Segons horari · toca per canviar","Según horario · toca para cambiar","Timetable · tap to change"],
["Tria dia i hora","Elige día y hora","Pick day and time"],
["↺ Ara","↺ Ahora","↺ Now"],
["Abans de ·","Antes de ·","Before ·"],
["Fet","Hecho","Done"],
["Demà","Mañana","Tomorrow"],
["Avui","Hoy","Today"],
["demà","mañana","tomorrow"],
["avui","hoy","today"],
["Dia","Día","Day"],
["Hora","Hora","Time"],
// ---- llistes de trens
["Avui ja no queden més trens des d'aquesta estació.","Hoy ya no quedan más trenes desde esta estación.","No more trains from this station today."],
["Avui ja no queden més trens.","Hoy ya no quedan más trenes.","No more trains today."],
["No hi ha trens des d'aquesta estació a partir d'aquesta hora.","No hay trenes desde esta estación a partir de esta hora.","No trains from this station after this time."],
["No hi ha trens a partir d'aquesta hora.","No hay trenes a partir de esta hora.","No trains after this time."],
["No arriba cap tren a aquesta estació en les 3 hores abans d'aquesta hora.","No llega ningún tren a esta estación en las 3 horas antes de esta hora.","No trains arrive at this station in the 3 hours before this time."],
["No hi arriba cap tren abans d'aquesta hora.","No llega ningún tren antes de esta hora.","No trains arrive before this time."],
["Carregant propers trens…","Cargando próximos trenes…","Loading next trains…"],
["Carregant horaris…","Cargando horarios…","Loading timetables…"],
["Carregant avisos…","Cargando avisos…","Loading alerts…"],
["Carregant…","Cargando…","Loading…"],
["Propers trens · temps real","Próximos trenes · tiempo real","Next trains · real time"],
["propers trens en temps real","próximos trenes en tiempo real","next trains in real time"],
["Propers trens","Próximos trenes","Next trains"],
["Veure totes les sortides →","Ver todas las salidas →","See all departures →"],
["Més trens i accessibilitat","Más trenes y accesibilidad","More trains and accessibility"],
["A l'hora · temps real","Puntual · tiempo real","On time · real time"],
["A l'hora","Puntual","On time"],
["a l'hora","puntual","on time"],
["temps real","tiempo real","real time"],
["Segons horari","Según horario","Timetable"],
["segons horari","según horario","timetable"],
["min de retard o més","min de retraso o más","min late or more"],
["min de retard","min de retraso","min late"],
["′ de retard","′ de retraso","′ late"],
["de retard","de retraso","late"],
["min avançat","min adelantado","min early"],
["a l'andana","en el andén","at platform"],
["Trens que hi arriben","Trenes que llegan","Trains arriving"],
["Arriba ·","Llega ·","Arrives ·"],
["ve de","viene de","from"],
["Accessible amb cadira de rodes","Accesible en silla de ruedas","Wheelchair accessible"],
["No accessible amb cadira de rodes","No accesible en silla de ruedas","Not wheelchair accessible"],
["Accessible només en algunes andanes","Accesible solo en algunos andenes","Accessible on some platforms only"],
["FGC no la marca com a accessible","FGC no la marca como accesible","Not marked accessible by FGC"],
["Accessibilitat segons les dades oficials d'FGC.","Accesibilidad según los datos oficiales de FGC.","Accessibility according to official FGC data."],
["Andana","Andén","Platform"],
["Estació","Estación","Station"],
["estacions","estaciones","stations"],
["estació","estación","station"],
// ---- preferides
["Encara no tens estacions preferides","Aún no tienes estaciones favoritas","You don't have favourite stations yet"],
["Passa el cursor per una estació del mapa","Pasa el cursor por una estación del mapa","Hover over a station on the map"],
["Toca una estació al mapa","Toca una estación en el mapa","Tap a station on the map"],
["i prem","y pulsa","and press"],
["També ho pots fer des de la pestanya","También puedes hacerlo desde la pestaña","You can also do it from the tab"],
[", amb l'estrella al costat del nom.",", con la estrella junto al nombre.",", with the star next to the name."],
["Es guarden en aquest dispositiu.","Se guardan en este dispositivo.","They're saved on this device."],
["☆ Afegir a preferides","☆ Añadir a favoritas","☆ Add to favourites"],
["★ A preferides","★ En favoritas","★ In favourites"],
["Afegir a preferides","Añadir a favoritas","Add to favourites"],
["Guardar a preferides","Guardar en favoritas","Save to favourites"],
["Treure de preferides","Quitar de favoritas","Remove from favourites"],
["arribades","llegadas","arrivals"],
["a partir de les","a partir de las","from"],
["abans de les","antes de las","before"],
["a partir de","a partir de","from"],
["abans de","antes de","before"],
// ---- fitxa del tren
["Unitat sèrie","Unidad serie","Unit series"],
["Retard","Retraso","Delay"],
["On és","Dónde está","Where"],
["Arribada prevista (horari)","Llegada prevista (horario)","Scheduled arrival"],
["Arribada a","Llegada a","Arrival at"],
["Arriba a","Llega a","Arrives at"],
["Velocitat","Velocidad","Speed"],
["Ocupació","Ocupación","Occupancy"],
["Registre de moviments","Registro de movimientos","Movement log"],
["Esperant moviments…","Esperando movimientos…","Waiting for movements…"],
["Posició dels trens…","Posición de los trenes…","Train positions…"],
["· des de","· desde","· from"],
["Apareix al mapa ·","Aparece en el mapa ·","Appears on map ·"],
["Posició FGC:","Posición FGC:","FGC position:"],
["(estimat)","(estimado)","(estimated)"],
["Parades i detalls","Paradas y detalles","Stops and details"],
["Veure les parades","Ver las paradas","See stops"],
["Mostrar menys ▴","Mostrar menos ▴","Show less ▴"],
["Més detalls","Más detalles","More details"],
["sense dades","sin datos","no data"],
["Aturat a","Parado en","Stopped at"],
["Entre","Entre","Between"],
["Cap a","Hacia","Towards"],
["cap a","hacia","to"],
["Surt de","Sale de","Leaves"],
["Encara no ha sortit · surt d'","Aún no ha salido · sale de","Not departed yet · leaves"],
["Trajecte","Trayecto","Journey"],
["Sortida","Salida","Departure"],
["Parades","Paradas","Stops"],
["Arribada","Llegada","Arrival"],
// ---- viatge
["Tria d'on surts i on vas. També pots tocar","Elige de dónde sales y adónde vas. También puedes tocar","Choose where you leave from and where you're going. You can also tap"],
["per sortir de l'estació més propera.","para salir de la estación más cercana.","to start from the nearest station."],
["D'on surts?","¿De dónde sales?","From?"],
["On vas?","¿Adónde vas?","To?"],
["Des d'on soc","Desde donde estoy","From my location"],
["Intercanviar origen i destí","Intercambiar origen y destino","Swap origin and destination"],
["Intercanviar","Intercambiar","Swap"],
["L'origen i el destí són la mateixa estació.","El origen y el destino son la misma estación.","Origin and destination are the same station."],
["No hi ha cap tren de","No hay ningún tren de","No train from"],
["que hi arribi en les 3 hores abans d'aquesta hora","que llegue en las 3 horas antes de esta hora","arriving in the 3 hours before this time"],
["en les properes 3 hores","en las próximas 3 horas","in the next 3 hours"],
["a peu fins a l'estació (","a pie hasta la estación (","walk to the station ("],
["min a peu","min a pie","min walk"],
["metro L1/L3 o a peu","metro L1/L3 o a pie","metro L1/L3 or walk"],
["Directe","Directo","Direct"],
["canvi a","cambio en","change at"],
["canvi, surt","cambio, sale","change, leaves"],
["canvis","transbordos","changes"],
["canvi","transbordo","change"],
["Surt d'aquí a","Sale en","Leaves in"],
["d'aquí a","en","in"],
["Surt ara","Sale ahora","Leaving now"],
["Surt a les","Sale a las","Leaves at"],
["Arribes a les","Llegas a las","You arrive at"],
["En camí · baixes a","En camino · bajas en","On the way · get off at"],
["a les","a las","at"],
["fins a","hasta","to"],
["· surt d'","· sale de","· leaves"],
["· arriba","· llega","· arrives"],
["surt","sale","leaves"],
["arriba","llega","arrives"],
["Arribar","Llegar","Arrive"],
["★ És el teu viatge · surt a dalt del mapa","★ Es tu viaje · aparece arriba del mapa","★ This is your trip · shown at the top of the map"],
["★ És el teu tren · puja a","★ Es tu tren · sube en","★ This is your train · board at"],
[") i baixa a",") y baja en",") and get off at"],
["El meu viatge ·","Mi viaje ·","My trip ·"],
["El meu viatge","Mi viaje","My trip"],
["Treure el meu viatge","Quitar mi viaje","Remove my trip"],
["🟢 Puja ·","🟢 Sube ·","🟢 Board ·"],
["🔴 Baixa ·","🔴 Baja ·","🔴 Get off ·"],
["Passa per","Pasa por","Passes"],
["Arribar","Llegar","Arrive"],
// ---- avisos
["🔔 Avisa'm d'aquest tren","🔔 Avísame de este tren","🔔 Alert me for this train"],
["Avisa'm d'aquest tren","Avísame de este tren","Alert me for this train"],
["Quant temps abans vols l'avís?","¿Cuánto tiempo antes quieres el aviso?","How long before do you want the alert?"],
["min abans","min antes","min before"],
["També si porta retard (3 min o més)","También si lleva retraso (3 min o más)","Also if it's late (3 min or more)"],
["Rebràs l'avís mentre tinguis la web oberta (també en segon pla). A l'iPhone, cal tenir-la instal·lada a la pantalla d'inici.","Recibirás el aviso aunque cierres la web. En iPhone, hay que tenerla instalada en la pantalla de inicio.","You'll get the alert even with the website closed. On iPhone, it must be installed on the home screen."],
["Rebràs l'avís mentre tinguis la web oberta (també en segon pla).","Recibirás el aviso aunque cierres la web.","You'll get the alert even with the website closed."],
["Rebràs l'avís encara que tanquis la web. A l'iPhone, cal tenir-la instal·lada a la pantalla d'inici.","Recibirás el aviso aunque cierres la web. En iPhone, hay que tenerla instalada en la pantalla de inicio.","You'll get the alert even with the website closed. On iPhone, it must be installed on the home screen."],
["Activar avís","Activar aviso","Turn on alert"],
["Treure avís","Quitar aviso","Remove alert"],
["Cancel·lar","Cancelar","Cancel"],
["Avís activat","Aviso activado","Alert on"],
["Avís tret","Aviso quitado","Alert removed"],
["Avís desat, però les notificacions estan bloquejades: t'avisarem dins la web","Aviso guardado, pero las notificaciones están bloqueadas: te avisaremos dentro de la web","Alert saved, but notifications are blocked: we'll alert you inside the website"],
["🔔 T'avisarem","🔔 Te avisaremos","🔔 We'll alert you"],
["Aquest navegador no permet notificacions. T'avisarem amb un missatge dins la web.","Este navegador no permite notificaciones. Te avisaremos con un mensaje dentro de la web.","This browser doesn't allow notifications. We'll alert you with a message inside the website."],
["A l'iPhone, per rebre avisos has d'instal·lar la web: botó Compartir → «Afegir a la pantalla d'inici», i obrir-la des d'allà.","En iPhone, para recibir avisos tienes que instalar la web: botón Compartir → «Añadir a pantalla de inicio», y abrirla desde allí.","On iPhone, to get alerts you need to install the website: Share button → “Add to Home Screen”, and open it from there."],
["Envia'm una notificació de prova","Envíame una notificación de prueba","Send me a test notification"],
["Notificació de prova enviada","Notificación de prueba enviada","Test notification sent"],
["No s'ha pogut enviar","No se ha podido enviar","Couldn't send it"],
["Has de permetre les notificacions","Tienes que permitir las notificaciones","You need to allow notifications"],
["Rebràs l'avís encara que tanquis la web.","Recibirás el aviso aunque cierres la web.","You'll get the alert even with the website closed."],
["Avís del tren","Aviso del tren","Train alert"],
["porta +","lleva +","is +"],
["Nova hora a","Nueva hora en","New time at"],
["ara","ahora","now"],
["Ara","Ahora","Now"],
// ---- avisos d'FGC i cinta
["⚠ Avisos importants","⚠ Avisos importantes","⚠ Important alerts"],
["Avisos importants d'FGC","Avisos importantes de FGC","Important FGC alerts"],
["⚠ Avís","⚠ Aviso","⚠ Alert"],
["Retards importants a la línia","Retrasos importantes en la línea","Major delays on line"],
["trens van amb","trenes van con","trains running"],
["D'acord","De acuerdo","OK"],
["Amagar","Ocultar","Hide"],
["Ara mateix no es poden llegir els avisos d'FGC. Es torna a provar cada 2 minuts.","Ahora mismo no se pueden leer los avisos de FGC. Se vuelve a probar cada 2 minutos.","FGC alerts can't be read right now. Retrying every 2 minutes."],
["Ara mateix no hi ha incidències a la xarxa.","Ahora mismo no hay incidencias en la red.","No incidents on the network right now."],
["Ara mateix tots els trens van a l'hora","Ahora mismo todos los trenes van puntuales","All trains are on time right now"],
["Ara mateix no circula cap tren.","Ahora mismo no circula ningún tren.","No trains running right now."],
["3 min tard o més","3 min tarde o más","3 min late or more"],
["tren arribarà","tren llegará","train will arrive"],
["trens arribaran","trenes llegarán","trains will arrive"],
["a tota la xarxa","en toda la red","across the network"],
["a Barcelona-Vallès","en Barcelona-Vallès","on Barcelona-Vallès"],
["a Llobregat-Anoia","en Llobregat-Anoia","on Llobregat-Anoia"],
["serveis","servicios","services"],
["Avisos","Avisos","Alerts"],
// ---- ubicació
["📍 L'estació d'FGC més propera és","📍 La estación de FGC más cercana es","📍 The nearest FGC station is"],
["Has de donar permís d'ubicació al navegador per trobar la teva estació","Tienes que dar permiso de ubicación al navegador para encontrar tu estación","Allow location access in your browser to find your station"],
["Has de donar permís d'ubicació","Tienes que dar permiso de ubicación","Allow location access"],
["No s'ha pogut saber on ets. Torna-ho a provar","No se ha podido saber dónde estás. Vuelve a probar","Couldn't find your location. Try again"],
["No s'ha pogut saber on ets","No se ha podido saber dónde estás","Couldn't find your location"],
["Aquest navegador no pot saber on ets","Este navegador no puede saber dónde estás","This browser can't find your location"],
["Per saber on ets cal la connexió segura (https)","Para saber dónde estás hace falta la conexión segura (https)","Finding your location needs a secure connection (https)"],
["El Mac no troba la ubicació. Comprova que la wifi estigui activada i que el Safari tingui permís a Configuració del Sistema → Privacitat → Localització","El Mac no encuentra la ubicación. Comprueba que el wifi esté activado y que Safari tenga permiso en Ajustes del Sistema → Privacidad → Localización","Your Mac can't find your location. Check Wi-Fi is on and Safari has permission in System Settings → Privacy → Location"],
// ---- instal·lar, donacions, peu
["Afegeix Trens en viu a la pantalla d'inici","Añade Trens en viu a la pantalla de inicio","Add Trens en viu to your home screen"],
["Afegir a la pantalla d'inici","Añadir a la pantalla de inicio","Add to Home Screen"],
["(a la barra de baix o al menú ⋯).","(en la barra de abajo o en el menú ⋯).","(in the bottom bar or the ⋯ menu)."],
["Obre el menú del navegador (⋮).","Abre el menú del navegador (⋮).","Open the browser menu (⋮)."],
["Obre la web a","Abre la web en","Open the website in"],
["Toca el botó","Toca el botón","Tap the button"],
["Compartir","Compartir","Share"],
["Afegir","Añadir","Add"],
["Entesos","Entendido","Got it"],
["☕ T'agrada Trens en viu?","☕ ¿Te gusta Trens en viu?","☕ Do you like Trens en viu?"],
["Si t'és útil, pots convidar-me a un cafè.","Si te es útil, puedes invitarme a un café.","If it's useful to you, you can buy me a coffee."],
["☕ Convida'm a un cafè","☕ Invítame a un café","☕ Buy me a coffee"],
["Creador:","Creador:","Creator:"],
["Web no oficial, feta amb les dades obertes d'FGC. No està vinculada a Ferrocarrils de la Generalitat de Catalunya. Dades:","Web no oficial, hecha con los datos abiertos de FGC. No está vinculada a Ferrocarrils de la Generalitat de Catalunya. Datos:","Unofficial website, built with FGC open data. Not affiliated with Ferrocarrils de la Generalitat de Catalunya. Data:"],
["No s'han pogut carregar les dades d'FGC.","No se han podido cargar los datos de FGC.","Couldn't load FGC data."],
["Comprova la connexió i torna a carregar la pàgina.","Comprueba la conexión y vuelve a cargar la página.","Check your connection and reload the page."],
["Estadístiques: aquest dispositiu TORNA a comptar.","Estadísticas: este dispositivo VUELVE a contar.","Stats: this device is counted AGAIN."],
["Estadístiques: aquest dispositiu ja NO compta.","Estadísticas: este dispositivo ya NO cuenta.","Stats: this device is NOT counted any more."],
["Missatge de prova: aquesta és la cinta d'avisos importants de Trens en viu","Mensaje de prueba: esta es la cinta de avisos importantes de Trens en viu","Test message: this is the Trens en viu important alerts ticker"],
["PROVA","PRUEBA","TEST"],
["Contacte:","Contacto:","Contact:"],
["Privacitat i galetes","Privacidad y cookies","Privacy and cookies"],
["Publicitat","Publicidad","Advertisement"],
["versió","versión","version"],
["Desar","Guardar","Save"],
["Tria","Elige","Choose"],
["O escriu-ho tu:","O escríbelo tú:","Or type it:"],
["trens","trenes","trains"],
["Sortir","Salir","Leave"],
// dies i mesos (dates llargues)
["dilluns","lunes","Monday"],["dimarts","martes","Tuesday"],["dimecres","miércoles","Wednesday"],["dijous","jueves","Thursday"],["divendres","viernes","Friday"],["dissabte","sábado","Saturday"],["diumenge","domingo","Sunday"],
["Dilluns","Lunes","Monday"],["Dimarts","Martes","Tuesday"],["Dimecres","Miércoles","Wednesday"],["Dijous","Jueves","Thursday"],["Divendres","Viernes","Friday"],["Dissabte","Sábado","Saturday"],["Diumenge","Domingo","Sunday"],
];

const LANGS=['ca','es','en'];
let L='ca';
try{ L=localStorage.getItem('tev-lang') || ''; }catch(e){}
if(!LANGS.includes(L)){ const n=(navigator.language||'').toLowerCase(); L = n.startsWith('en') ? 'en' : 'ca'; }
document.documentElement.lang=L;

const lletra='A-Za-zÀ-ÖØ-öø-ÿ·';
let RE=null, MAP=null;
function prepara(){
  MAP=new Map(); const k=L==='es'?1:2;
  D.forEach(r=>{ if(r[k]!=null && !MAP.has(r[0])) MAP.set(r[0], r[k]); });
  const keys=[...MAP.keys()].sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  // límits de paraula: no es tradueix un tros d'una paraula (ni de noms d'estacions)
  RE=new RegExp(`(?<![${lletra}'’])(?:${keys.join('|')})(?![${lletra}])`,'g');
}
function tr(s){ if(L==='ca' || s==null) return s; if(!RE) prepara(); return String(s).replace(RE, m=>MAP.get(m)); }
window.tr=tr; window.LANG=()=>L;
window.locale=()=>L==='es'?'es-ES':L==='en'?'en-GB':'ca-ES';

const fets=new WeakMap();
const SALTA='script,style,#clock,.noi18n,input,textarea';
function nodeText(n){
  const p=n.parentElement; if(!p || p.closest(SALTA)) return;
  const v=n.nodeValue; if(!v || !/[A-Za-zÀ-ÿ]/.test(v) || fets.get(n)===v) return;
  const t=tr(v); fets.set(n,t); if(t!==v) n.nodeValue=t;
}
function atributs(el){
  if(el.closest && el.closest('.noi18n')) return;
  ['placeholder','aria-label','title'].forEach(a=>{ const v=el.getAttribute&&el.getAttribute(a); if(v){ const k='_i18n_'+a; if(el[k]===v) return; const t=tr(v); el[k]=t; if(t!==v) el.setAttribute(a,t); } });
}
function arbre(root){
  if(root.nodeType===3){ nodeText(root); return; }
  if(root.nodeType!==1) return;
  if(root.matches && root.matches(SALTA)) return;
  atributs(root);
  const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n; while((n=w.nextNode())){ if(n.nodeType===3) nodeText(n); else atributs(n); }
}
function inicia(){
  if(L==='ca') return;
  prepara(); arbre(document.body); document.title=tr(document.title);
  new MutationObserver(ms=>ms.forEach(m=>{
    if(m.type==='characterData') nodeText(m.target);
    else if(m.type==='attributes') atributs(m.target);
    else m.addedNodes.forEach(arbre);
  })).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});
  const al=window.alert; window.alert=s=>al.call(window,tr(s));
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inicia); else inicia();

// botó per canviar d'idioma
window.canviaIdioma=function(nou){ try{ localStorage.setItem('tev-lang',nou); }catch(e){} location.reload(); };
window.IDIOMES=LANGS;
})();
