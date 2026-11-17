/* DOMINUS V19.33.4 TEST – flux PDF iOS, fara ferestre suprapuse. */
(function(){
 'use strict';
 var ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 window.dominusIOS=ios;
 if(!ios)return;
 function download(file){
   var url=URL.createObjectURL(file),a=document.createElement('a');
   a.href=url;a.download=file.name||'Dominus.pdf';a.style.display='none';
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(function(){URL.revokeObjectURL(url)},120000);
 }
 function share(file){
   if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
     navigator.share({files:[file],title:'DOMINUS – document PDF'}).catch(function(e){if(e.name!=='AbortError')alert('Partajarea nu a reusit: '+e.message)});
   }else{alert('Partajarea fisierului nu este disponibila aici. Foloseste Salveaza PDF.');}
 }
 function modal(file){
   var old=document.getElementById('dominus-ios-share-panel');if(old)old.remove();
   var overlay=document.createElement('div');overlay.id='dominus-ios-share-panel';
   overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0009;display:flex;align-items:center;justify-content:center;padding:16px';
   var panel=document.createElement('div');panel.style.cssText='background:white;color:#173253;border-radius:14px;padding:20px;max-width:420px;width:100%;font:16px system-ui';
   var title=document.createElement('h2');title.textContent='PDF pregatit – DOMINUS V19.33.4 TEST';title.style.margin='0 0 10px';panel.appendChild(title);
   var name=document.createElement('p');name.textContent=file.name;name.style.overflowWrap='anywhere';panel.appendChild(name);
   var info=document.createElement('p');info.textContent='Pe iPhone, salveaza intai PDF-ul, apoi apasa Trimite prin WhatsApp. Safari poate cere confirmarea descarcarii.';panel.appendChild(info);
   function btn(label,action){var b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='display:block;width:100%;margin:9px 0;padding:13px;border-radius:9px;background:#205382;color:white;border:0;font-size:16px';b.addEventListener('click',action);panel.appendChild(b);return b;}
   btn('1. Salveaza PDF',function(){download(file)});
   btn('2. Trimite prin WhatsApp',function(){share(file)});
   btn('Inchide',function(){overlay.remove()});
   overlay.appendChild(panel);document.body.appendChild(overlay);
 }
 window.dominusIOSReady=function(file){
   if(window.dominusDirectPdfMode){download(file);return;}
   modal(file);
 };
 // Captura inaintea handlerelor inline; apelam acelasi generator PDF existent.
 document.addEventListener('click',function(e){
   var b=e.target.closest&&e.target.closest('button');if(!b)return;
   var onclick=b.getAttribute('onclick')||'';
   var isPdf=/dominusV17Print\s*\(|window\.print\s*\(/.test(onclick);
   if(!isPdf||typeof window.dominusWhatsApp!=='function')return;
   e.preventDefault();e.stopImmediatePropagation();
   window.dominusDirectPdfMode=true;
   Promise.resolve().then(function(){return window.dominusWhatsApp()}).catch(function(err){alert('Nu s-a putut genera PDF-ul: '+err.message)}).finally(function(){window.dominusDirectPdfMode=false});
 },true);
})();
