/* Dominus V19.31 - completare din registre, fara modificarea salvarii PDF */
(function(){'use strict';
const page=location.pathname.split('/').pop();
const fields={
 'verificari.html':{name:'beneficiar',phone:'beneficiar_telefon',address:'beneficiar_adresa',email:'beneficiar_email',model:'model',serial:'serie',brand:'marca'},
 'constatare.html':{name:'constatare_Be_0',phone:'constatare_Be_1',address:'constatare_Be_3',email:'constatare_Be_2',model:'constatare_Be_6',serial:'constatare_Be_7',brand:'constatare_Be_5'},
 'reclamatie.html':{name:'reclamatie_Be_0',phone:'reclamatie_Be_1',address:'reclamatie_Be_3',email:'reclamatie_Be_2',model:'reclamatie_Be_6',serial:'reclamatie_Be_7',brand:'reclamatie_Be_5'},
 'pompe_pif.html':{name:'sec1_p0',phone:'sec1_p2',address:'sec1_p1',model:'sec2_p0',serial:'sec2_p1'},
 'certificat_garantie.html':{name:'cumparator_nume',phone:'cumparator_telefon',address:'cumparator_adresa',model:'produs_tip',serial:'produs_serie'},
 'certificat_garantie_pompe.html':{name:'beneficiar',phone:'telefon_beneficiar',address:'adresa_beneficiar',model:'produs',serial:'serie'}
};
const map=fields[page];if(!map)return;
const norm=s=>String(s||'').trim().toLocaleLowerCase('ro').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function load(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(_){return []}}
function el(k){const name=map[k];return name?[...document.querySelectorAll('input,textarea,select')].find(x=>x.name===name||x.id===name||x.dataset.field===name):null}
function fill(k,v){const e=el(k);if(!e||!v)return;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setup(){const input=el('name');if(!input)return;
const panel=document.createElement('div');panel.className='dominus-suggest';panel.setAttribute('role','listbox');panel.hidden=true;
const style=document.createElement('style');style.textContent='.dominus-suggest{background:#fff;color:#173454;border:1px solid #8ca9c8;border-radius:10px;box-shadow:0 6px 22px #172d4b35;max-height:260px;overflow:auto;margin:4px 0 12px;position:relative;z-index:999}.dominus-suggest[hidden]{display:none}.dominus-suggest button{display:block;width:100%;background:white;color:#173454;text-align:left;border:0;border-bottom:1px solid #e4eaf2;padding:11px;font-size:14px}.dominus-suggest small{display:block;color:#526781;margin-top:3px}.dominus-suggest button:focus{background:#e7f1ff}@media print{.dominus-suggest{display:none!important}}';document.head.appendChild(style);input.insertAdjacentElement('afterend',panel);
let chosen=null;
function button(label,detail,action){const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.textContent=label;const small=document.createElement('small');small.textContent=detail;b.appendChild(small);b.addEventListener('pointerdown',e=>e.preventDefault());b.addEventListener('click',()=>{action();panel.hidden=true});panel.appendChild(b)}
function show(){panel.replaceChildren();const q=norm(input.value);if(q.length<2){panel.hidden=true;return}const clients=load('dominus-clienti-v1').filter(c=>norm(c.name).includes(q)).slice(0,7);for(const c of clients)button(c.name,[c.phone,c.address].filter(Boolean).join(' · '),()=>selectClient(c));panel.hidden=!clients.length}
function selectClient(c){chosen=c;fill('name',c.name);fill('phone',c.phone);fill('address',c.address);fill('email',c.email);showEquipment(c)}
function showEquipment(c){panel.replaceChildren();const items=load('dominus-echipamente-v1').filter(x=>x.clientId===c.id);if(!items.length){panel.hidden=true;return}panel.hidden=false;const hint=document.createElement('div');hint.textContent='Alege echipamentul beneficiarului (opțional):';hint.style.cssText='padding:10px;font-size:13px;font-weight:bold';panel.appendChild(hint);for(const x of items)button([x.brand,x.model].filter(Boolean).join(' ')||'Echipament',x.serial?'Serie: '+x.serial:'Fără serie',()=>{fill('model',x.model);fill('serial',x.serial);fill('brand',x.brand)})}
input.addEventListener('input',()=>{chosen=null;show()});input.addEventListener('focus',show);document.addEventListener('pointerdown',e=>{if(!panel.contains(e.target)&&e.target!==input)panel.hidden=true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
