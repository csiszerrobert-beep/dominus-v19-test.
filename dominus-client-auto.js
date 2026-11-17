/* Dominus V19.28 TEST - salvare exclusiv la export si istoric documente. */
(function(){'use strict';
const KEY='dominus-clienti-v1';
const maps={
 'constatare.html':{name:'constatare_Be_0',phone:'constatare_Be_1',email:'constatare_Be_2',address:'constatare_Be_3',sign:'nume_beneficiar',title:'Fișă de constatare'},
 'reclamatie.html':{name:'reclamatie_Be_0',phone:'reclamatie_Be_1',email:'reclamatie_Be_2',address:'reclamatie_Be_3',sign:'nume_beneficiar',title:'Fișă de reclamație'},
 'verificari.html':{name:'beneficiar',phone:'beneficiar_telefon',email:'beneficiar_email',address:'beneficiar_adresa',sign:'semnatar_beneficiar',title:'Fișă de verificare'},
 'pompe_pif.html':{name:'sec1_p0',phone:'sec1_p2',address:'sec1_p1',sign:'semn_nume_client',title:'Punere în funcțiune pompe'},
 'certificat_garantie.html':{name:'cumparator_nume',phone:'cumparator_telefon',address:'cumparator_adresa',draft:'dominus-certificat-garantie-v9',title:'Certificat de garanție'},
 'certificat_garantie_pompe.html':{name:'beneficiar',phone:'telefon_beneficiar',address:'adresa_beneficiar',sign:'cumparator_semn',title:'Certificat de garanție pompe'}
};
const page=location.pathname.split('/').pop(),map=maps[page];if(!map)return;
const norm=s=>String(s||'').trim().replace(/\s+/g,' '),fold=s=>norm(s).toLocaleLowerCase('ro-RO').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const digits=s=>norm(s).replace(/\D/g,'');
// Normalizeaza doar prefixele cunoscute; nu ghicim tara pentru numere locale straine.
function phone(s){
 const raw=norm(s).replace(/[\s().-]/g,'');
 if(!raw)return '';
 if(!/^(?:\+|00)?\d+$/.test(raw))return '';
 let n=raw.startsWith('00')?'+'+raw.slice(2):raw;
 if(n.startsWith('+')){
   const d=n.slice(1);
   if(d.length<7||d.length>15||d[0]==='0')return '';
   return d.startsWith('40')&&d.length===11?'0'+d.slice(2):'+'+d;
 }
 if(n.startsWith('0')&&n.length===10)return n;
 // Numerele nationale straine nu au obligatoriu 10 cifre.
 if(n.length>=7&&n.length<=15 && !(n.startsWith('07')&&n.length!==10))return n;
 return '';
}
function field(id){return [...document.querySelectorAll('input,textarea,select')].find(e=>e.name===id||e.id===id||e.dataset.field===id)||null}
function draft(){if(!map.draft)return {};try{return JSON.parse(localStorage.getItem(map.draft)||'{}')||{}}catch(e){return {}}}
function get(id){if(!id)return '';const el=field(id);return norm(el?el.value:draft()[id])}
function mirrorName(){if(!map.sign)return;const a=field(map.name),b=field(map.sign);if(a&&b&&a!==b&&b.value!==norm(a.value)){b.value=norm(a.value);b.dispatchEvent(new Event('input',{bubbles:false}))}}
let lastSignature='',lastAt=0;
function commit(){
 try{
  mirrorName();
  const d={name:get(map.name),phone:get(map.phone),email:get(map.email),address:get(map.address)};
  if(fold(d.name).length<3)return false;
  const p=phone(d.phone);if(d.phone&&!p){if(!d.address&&!d.email)return false;d.phone='';}
  if(!p&&!d.address&&!d.email)return false;
  const signature=[fold(d.name),p,fold(d.address),fold(d.email),map.title].join('|');
  const now=Date.now();if(signature===lastSignature&&now-lastAt<12000)return true;
  let list=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(list))return false;
  const name=fold(d.name),address=fold(d.address),email=fold(d.email);
  let i=list.findIndex(c=>fold(c.name)===name&&((p&&phone(c.phone)===p)||(address&&fold(c.address)===address)||(email&&fold(c.email)===email)));
  if(i<0)i=list.findIndex(c=>fold(c.name)===name&&(!p||!phone(c.phone)||phone(c.phone)===p)&&(!address||!fold(c.address)||fold(c.address)===address)&&(!email||!fold(c.email)||fold(c.email)===email));
  if(i<0){list.push({id:(crypto.randomUUID?.()||String(now)+'-'+Math.random()),...d,notes:'',documents:[]});i=list.length-1}
  const c=list[i];for(const k of ['phone','email','address'])if(d[k]&&!norm(c[k]))c[k]=d[k];
  if(!Array.isArray(c.documents))c.documents=[];
  c.documents.push({id:(crypto.randomUUID?.()||String(now)+'-'+Math.random()),type:map.title,date:new Date().toISOString(),source:page});
  localStorage.setItem(KEY,JSON.stringify(list));lastSignature=signature;lastAt=now;return true;
 }catch(e){console.warn('Dominus: nu s-a putut actualiza registrul.',e);return false}
}
window.dominusClientCommit=commit;
document.addEventListener('input',e=>{if(e.target===field(map.name))mirrorName()},true);
document.addEventListener('change',e=>{if(e.target===field(map.name))mirrorName()},true);
window.addEventListener('beforeprint',commit);
document.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;const action=(btn.getAttribute('onclick')||'').toLowerCase();if(action.includes('print()')||action.includes('dominusv17print()'))commit()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mirrorName);else mirrorName();
})();
