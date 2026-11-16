/* Dominus V19.23 TEST: registru clienti si nume semnatar sincronizate. */
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

function sync(){try{mirrorName();const d={name:get(map.name),phone:get(map.phone),email:get(map.email),address:get(map.address)};if(d.name.length<3)return;
 let list=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(list))return;
 const name=fold(d.name),phone=tel(d.phone);
 // Nu uni persoane diferite doar fiindca au acelasi telefon.
 let i=list.findIndex(c=>fold(c.name)===name && (!phone||!tel(c.phone)||tel(c.phone)===phone));
 if(i<0 && phone){
   i=list.findIndex(c=>{
     const old=fold(c.name),oldPhone=tel(c.phone);
     return oldPhone===phone && old.length>=3 && name.length>=3 &&
       (name.startsWith(old)||old.startsWith(name)) &&
       (!norm(c.address)||!d.address||fold(c.address)===fold(d.address));
   });
 }
 if(i>=0){
   const c=list[i];let changed=false;
   if(name.length>fold(c.name).length && name.startsWith(fold(c.name))){c.name=d.name;changed=true}
   for(const k of ['phone','email','address'])if(d[k]&&!norm(c[k])){c[k]=d[k];changed=true}
   if(!changed)return;
 } else list.push({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random()),name:d.name,phone:d.phone,email:d.email,address:d.address,notes:''});
 localStorage.setItem(KEY,JSON.stringify(list));
 }catch(e){console.warn('Dominus: nu s-a putut salva clientul.',e)}}
let timer;
function later(){clearTimeout(timer);timer=setTimeout(sync,350)}
// Sincronizeaza numele imediat, inclusiv inainte de printare/PDF.
document.addEventListener('input',e=>{if(e.target===field(map.name))mirrorName();later()},true);
document.addEventListener('change',e=>{if(e.target===field(map.name))mirrorName();later()},true);
document.addEventListener('click',e=>{if(e.target.closest('button')){mirrorName();setTimeout(sync,80)}},true);
window.addEventListener('pagehide',sync);
window.addEventListener('beforeprint',sync);
document.addEventListener('submit',sync,true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,350));else setTimeout(sync,350);
})();
