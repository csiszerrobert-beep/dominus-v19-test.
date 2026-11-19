/* DOMINUS V20 TEST: autentificare; fără migrare automată a datelor V19. */
(function(){
 const cfg=window.DOMINUS_CONFIG||{};
 const configured=cfg.publishableKey && !cfg.publishableKey.startsWith('INLOCUIESTE_');
 const client=configured && window.supabase?.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 window.DominusAuth={client,configured,async profile(){if(!client)return null;const {data:{user},error}=await client.auth.getUser();if(error||!user)return null;const {data,error:pe}=await client.from('profiles').select('id,full_name,email,role,active').eq('id',user.id).single();if(pe||!data||!data.active)return null;return data;},async signOut(){if(client)await client.auth.signOut();location.replace('./login.html');}};
})();
