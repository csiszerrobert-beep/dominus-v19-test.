/* Dominus V19.30 TEST - salvare exclusiv la export si istoric documente. */
(function(){'use strict';
const KEY='dominus-clienti-v1', EQUIPMENT_KEY='dominus-echipamente-v1';
const maps={
 'constatare.html':{name:'constatare_Be_0',phone:'constatare_Be_1',email:'constatare_Be_2',address:'constatare_Be_3',sign:'nume_beneficiar',title:'Raport de intervenție/constatare',equipment:{brand:'constatare_Be_5',model:'constatare_Be_6',serial:'constatare_Be_7'}},
 'reclamatie.html':{name:'reclamatie_Be_0',phone:'reclamatie_Be_1',email:'reclamatie_Be_2',address:'reclamatie_Be_3',sign:'nume_beneficiar',title:'Formular de reclamație / sesizare',equipment:{brand:'reclamatie_Be_5',model:'reclamatie_Be_6',serial:'reclamatie_Be_7'}},
 'verificari.html':{name:'beneficiar',phone:'beneficiar_telefon',email:'beneficiar_email',address:'beneficiar_adresa',sign:'semnatar_beneficiar',title:'Proces Verbal de verificări pentru cazane peleţi Dominus – În vederea obţinerii garanţiei',equipment:{brand:'marca',model:'model',serial:'serie'}},
 'pompe_pif.html':{name:'sec1_p0',phone:'sec1_p2',address:'sec1_p1',sign:'semn_nume_client',title:'Proces verbal de punere în funcțiune pompe de căldură Dominus',equipment:{model:'sec2_p0',serial:'sec2_p1',kind:'Pompă de căldură',commissioned:'sec9_p4'}},
 'certificat_garantie.html':{name:'cumparator_nume',phone:'cumparator_telefon',address:'cumparator_adresa',draft:'dominus-certificat-garantie-v9',title:'Certificat de garanție – cazane pe peleți',equipment:{model:'produs_tip',serial:'produs_serie'}},
 'certificat_garantie_pompe.html':{name:'beneficiar',phone:'telefon_beneficiar',address:'adresa_beneficiar',sign:'cumparator_semn',title:'Certificat de garanție – Pompe de căldură Dominus',equipment:{model:'produs',serial:'serie',kind:'Pompă de căldură'}}
};
const REVISION_PAGES=new Set(['verificari.html','pompe_pif.html','certificat_garantie.html','certificat_garantie_pompe.html']);
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
  // Registrul echipamentelor: se actualizează doar la exportul documentului.
  // Clientul este identificat mai întâi; niciun echipament nu se salvează în timpul tastării.
  const em=map.equipment||{};
  const eq={brand:get(em.brand),model:get(em.model),serial:get(em.serial),kind:em.kind||'',commissioned:get(em.commissioned)};
  const meaningful=Boolean(eq.model||eq.serial);
  if(meaningful){
    let equipments=[];
    try{const stored=JSON.parse(localStorage.getItem(EQUIPMENT_KEY)||'[]');if(Array.isArray(stored))equipments=stored}catch(_){}
    const owner=c.id;
    const serial=fold(eq.serial),model=fold(eq.model),brand=fold(eq.brand);
    // Seria este identificatorul principal, în cadrul beneficiarului.
    // Fără serie, asociem numai dacă există un singur model identic la client.
    let ix=serial?equipments.findIndex(x=>x.clientId===owner&&fold(x.serial)===serial):-1;
    if(ix<0&&!serial&&model){const matches=equipments.map((x,j)=>({x,j})).filter(v=>v.x.clientId===owner&&!fold(v.x.serial)&&fold(v.x.model)===model&&fold(v.x.brand)===brand);if(matches.length===1)ix=matches[0].j}
    if(ix<0){equipments.push({id:(crypto.randomUUID?.()||String(now)+'-eq-'+Math.random()),clientId:owner,...eq,createdAt:new Date().toISOString(),documents:[]});ix=equipments.length-1}
    const device=equipments[ix];
    for(const k of ['brand','model','serial','kind','commissioned'])if(!device[k]&&eq[k])device[k]=eq[k];
    if(!Array.isArray(device.documents))device.documents=[];
    if(REVISION_PAGES.has(page)){
      const today=new Date(); const dateLocal=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
      if(!device.lastRevisionDate||dateLocal>device.lastRevisionDate)device.lastRevisionDate=dateLocal;
    }
    device.documents.push({id:(crypto.randomUUID?.()||String(now)+'-doc-'+Math.random()),type:map.title,date:new Date().toISOString(),source:page});
    try{localStorage.setItem(EQUIPMENT_KEY,JSON.stringify(equipments))}catch(e){console.warn('Dominus: registrul echipamentelor nu a putut fi salvat.',e)}
  }
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
