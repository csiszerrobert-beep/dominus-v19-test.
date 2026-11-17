/* DOMINUS V19.33.2 TEST: Safari iOS - PDF cu toate anexele foto.
   Pe iOS evitam imprimarea HTML a imaginilor blob, care poate omite pagini.
   Pe Android si desktop pastram comportamentul existent. */
(function(){
  'use strict';
  var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  if(!isiOS)return;
  function count(){return document.querySelectorAll('#dominus-photo-list .dominus-photo-item').length;}
  function exportPdf(){
    if(typeof window.dominusWhatsApp!=='function'){
      alert('Generatorul PDF nu este disponibil. Reîncarcă pagina și încearcă din nou.');return;
    }
    window.dominusWhatsApp();
  }
  // Interceptam doar actiunile de imprimare din formularele cu fotografii.
  // Salvarea, e-mailul si celelalte butoane raman nemodificate.
  document.addEventListener('click',function(event){
    if(!count())return;
    var button=event.target.closest('button');
    if(!button)return;
    var action=button.getAttribute('onclick')||'';
    if(!(/window\.print\s*\(/.test(action)||/dominusV17Print\s*\(/.test(action)))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    exportPdf();
  },true);
})();
