/* Dominus V19.25 TEST: registru clienti si nume semnatar sincronizate. */
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
  const d={name:get(map.name),phone:get(map.phone),email:get(map.email),address:get(map.address)};
  if(d.name.length<3)return;
  const name=fold(d.name),phone=tel(d.phone),address=fold(d.address);
  // Romania: acceptam doar numere nationale complete de 10 cifre sau +40 urmat de 9 cifre.
  // Daca exista un telefon partial, nu inregistram deloc beneficiarul.
  const digits=phone.replace(/\D/g,'');
  if(phone && !(digits.length===10 && digits.startsWith('0')) &&
     !(digits.length===11 && digits.startsWith('40')))return;
  const canonicalPhone=digits.startsWith('40')?'0'+digits.slice(2):digits;
  // Nu crea clienti numai dintr-un nume vag, fara date de identificare.
  if(!phone && !address && !d.email)return;
  let list=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(list))return;
  let i=list.findIndex(c=>fold(c.name)===name && (
    (phone && tel(c.phone).replace(/\D/g,'').replace(/^40(?=\d{9}$)/,'0')===canonicalPhone) ||
    (!phone && address && fold(c.address)===address) ||
    (!phone && !address && d.email && fold(c.email)===fold(d.email))
  ));
  // Corecteaza numele introdus incomplet, doar daca telefonul este identic,
  // numele este un prefix si adresele nu se contrazic.
  if(i<0 && phone)i=list.findIndex(c=>{
    const old=fold(c.name),oldPhone=tel(c.phone).replace(/\D/g,'').replace(/^40(?=\d{9}$)/,'0'),oldAddr=fold(c.address);
    return oldPhone===canonicalPhone && old.length>=3 && name.length>=3 &&
      (name.startsWith(old)||old.startsWith(name)) &&
      (!oldAddr||!address||oldAddr===address);
  });
  if(i<0 && address)i=list.findIndex(c=>{
    if(fold(c.name)!==name || fold(c.address)!==address)return false;
    const oldDigits=tel(c.phone).replace(/\D/g,'').replace(/^40(?=\d{9}$)/,'0');
    return !phone || !oldDigits || oldDigits===canonicalPhone ||
      (oldDigits.length<10 && canonicalPhone.startsWith(oldDigits));
  });
  if(i>=0){
    const c=list[i];let changed=false;
    if(name.length>fold(c.name).length && name.startsWith(fold(c.name))){c.name=d.name;changed=true}
    for(const k of ['phone','email','address']){
      if(!d[k])continue;
      if(k==='phone'){
        const oldDigits=tel(c.phone).replace(/\D/g,'').replace(/^40(?=\d{9}$)/,'0');
        if(!oldDigits || (oldDigits.length<10 && canonicalPhone.startsWith(oldDigits))){c.phone=d.phone;changed=true}
      }else if(!norm(c[k])){c[k]=d[k];changed=true}
    }
    if(!changed)return;
  }else{
    // Același telefon cu alt nume poate reprezenta o altă persoană.
    list.push({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random()),
      name:d.name,phone:d.phone,email:d.email,address:d.address,notes:''});
  }
  localStorage.setItem(KEY,JSON.stringify(list));
 }catch(e){console.warn('Dominus: clientul nu a putut fi salvat.',e)}
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
