/* DOMINUS V19.33.5 FINAL: nume/prenume cu initiale mari. */
(function(){'use strict';
function nameCase(value){
 const s=String(value||'').trim().replace(/\s+/g,' ');
 // Pastreaza denumirile firmelor si abrevierile lor asa cum sunt introduse.
 if(/\b(?:s\.?r\.?l\.?|s\.?a\.?|pfa|ii|if|sc)\b/i.test(s))return s;
 return s.toLocaleLowerCase('ro-RO').replace(/(^|[\s\-’'])\p{L}/gu,m=>m.toLocaleUpperCase('ro-RO'));
}
window.dominusNameCase=nameCase;
})();
