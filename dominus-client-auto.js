/* Dominus V19.26 TEST: registru clienti si nume semnatar sincronizate. */
(function(){'use strict';
const KEY='dominus-clienti-v1';
const maps={
 'constatare.html':{name:'constatare_Be_0',phone:'constatare_Be_1',email:'constatare_Be_2',address:'constatare_Be_3',sign:'nume_beneficiar'},
 'reclamatie.html':{name:'reclamatie_Be_0',phone:'reclamatie_Be_1',email:'reclamatie_Be_2',address:'reclamatie_Be_3',sign:'nume_beneficiar'},
 'verificari.html':{name:'beneficiar',phone:'beneficiar_telefon',email:'beneficiar_email',address:'beneficiar_adresa',sign:'semnatar_beneficiar'},
 'pompe_pif.html':{name:'sec1_p0',phone:'sec1_p2',address:'sec1_p1',sign:'semn_nume_client'},
 'certificat_garantie.html':{name:'cumparator_nume',phone:'cumparator_telefon',address:'cumparator_adresa',draft:'dominus-certificat-garantie-v9'},
 'certificat_garantie_pompe.html':{name:'beneficiar',phone:'telefon_beneficiar',address:'adresa_beneficiar',sign:'cumparator_semn',draft:'dominus-certificat-pompe-v1'}
};
const page=location.pathname.split('/').pop(),map=maps[page];if(!map)return;
const norm=s=>String(s||'').trim().replace(/\s+/g,' '),fold=s=>norm(s).toLocaleLowerCase('ro-RO').normalize('NFD').replace(/[\u0300-\u036f]/g,''),tel=s=>norm(s).replace(/[^\d+]/g,'');
function field(id){return [...document.querySelectorAll('input,textarea,select')].find(e=>e.name===id||e.id===id||e.dataset.field===id)||null;}
function draft(){if(!map.draft)return {};try{return JSON.parse(localStorage.getItem(map.draft)||'{}')||{}}catch(e){return {}}}
function get(id){if(!id)return '';const el=field(id);return norm(el?el.value:draft()[id]);}
function mirrorName(){
 if(!map.sign)return;
 const sourceField=field(map.name),target=field(map.sign);
 if(!target||!sourceField||target===sourceField)return;
 const source=norm(sourceField.value);
 if(target.value!==source){
   target.value=source;
   target.dispatchEvent(new Event('input',{bubbles:false}));
   target.dispatchEvent(new Event('change',{bubbles:false}));
 }
}

function commit(){
 try{
  mirrorName();
  // Citim fiecare document separat la momentul exportului, fara blocare globala.
  const d={name:get(map.name),phone:get(map.phone),email:get(map.email),address:get(map.address)};
  const name=fold(d.name),address=fold(d.address),email=fold(d.email);
  if(name.length<3)return false;
  const rawDigits=tel(d.phone).replace(/\D/g,'');
  // Nu inregistram numere de telefon tastate doar partial.
  if(rawDigits && !((rawDigits.length===10&&rawDigits[0]==='0')||(rawDigits.length===11&&rawDigits.startsWith('40'))))return false;
  const phone=rawDigits.startsWith('40')?'0'+rawDigits.slice(2):rawDigits;
  if(!phone&&!address&&!email)return false;
  let list=JSON.parse(localStorage.getItem(KEY)||'[]');
  if(!Array.isArray(list))return false;
  const phoneOf=c=>{const n=tel(c.phone).replace(/\D/g,'');return n.startsWith('40')&&n.length===11?'0'+n.slice(2):n};
  // Aceeasi persoana: nume identic + telefon identic SAU adresa identica.
  // Nume diferite cu acelasi telefon NU sunt comasate (telefon de familie).
  let i=list.findIndex(c=>fold(c.name)===name && (
    (phone&&phoneOf(c)===phone)||
    (address&&fold(c.address)===address)||
    (email&&fold(c.email)===email)
  ));
  // Client existent cu acelasi nume, dar fara telefon/adresa completata.
  if(i<0)i=list.findIndex(c=>fold(c.name)===name &&
    (!phone||!phoneOf(c)||phoneOf(c)===phone) &&
    (!address||!fold(c.address)||fold(c.address)===address) &&
    (!email||!fold(c.email)||fold(c.email)===email));
  if(i>=0){
    const c=list[i];let changed=false;
    for(const k of ['phone','email','address']){
      if(d[k]&&!norm(c[k])){c[k]=d[k];changed=true}
    }
    if(!changed)return true;
  }else{
    list.push({id:(crypto.randomUUID?.()||String(Date.now())+'-'+Math.random()),
      name:d.name,phone:d.phone,email:d.email,address:d.address,notes:''});
  }
  localStorage.setItem(KEY,JSON.stringify(list));
  return true;
 }catch(e){console.warn('Dominus: clientul nu a putut fi salvat.',e);return false}
}
window.dominusClientCommit=commit;
// Sincronizarea numelui de la semnatura ramane imediata.
document.addEventListener('input',e=>{if(e.target===field(map.name))mirrorName()},true);
document.addEventListener('change',e=>{if(e.target===field(map.name))mirrorName()},true);
// Printarea nativa nu ofera confirmarea salvarii: inregistram la initierea ei.
window.addEventListener('beforeprint',commit);
// In unele browsere mobile evenimentul beforeprint nu este emis.
document.addEventListener('click',e=>{
 const btn=e.target.closest('button');if(!btn)return;
 const action=(btn.getAttribute('onclick')||'').toLowerCase();
 if(action.includes('print()') || action.includes('dominusv17print()'))commit();
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mirrorName);
else mirrorName();

})();
