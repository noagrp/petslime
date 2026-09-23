(() => {
  const ENABLE_KEY='petslime-bgm-v1';
  const VOL_KEY='petslime-bgm-volume-v1';
  const SOURCE='bgm/petslime-main-song.mp3';
  let enabled=localStorage.getItem(ENABLE_KEY)!=='off';
  let volume=Math.max(0,Math.min(40,Number(localStorage.getItem(VOL_KEY)??12)||12));
  let activated=false;
  let duckTimer=0;
  const audio=new Audio(SOURCE);
  audio.loop=true;
  audio.preload='metadata';
  audio.volume=volume/100;
  function play(){if(!enabled||!activated||document.hidden)return;audio.play().catch(()=>{})}
  function pause(){audio.pause()}
  function activate(){if(activated)return;activated=true;play()}
  function setVolume(v){volume=Math.max(0,Math.min(40,Number(v)||0));audio.volume=volume/100;localStorage.setItem(VOL_KEY,String(volume))}
  function duck(ms=6500){clearTimeout(duckTimer);const normal=volume/100;audio.volume=Math.min(normal,.06);duckTimer=setTimeout(()=>{audio.volume=volume/100},ms)}
  function addControls(){
    const menu=document.getElementById('settings-menu');
    if(!menu||document.getElementById('background-music'))return;
    const anchor=document.getElementById('howto');
    const style=document.createElement('style');
    style.textContent='.audio-range{margin-top:6px;padding:9px 11px;border:1px solid rgba(255,255,255,.84);border-radius:14px;background:rgba(255,255,255,.86);box-shadow:0 8px 22px rgba(52,94,74,.11);backdrop-filter:blur(14px)}.audio-range label{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#516b5e;font-size:.73rem}.audio-range input{width:100%;accent-color:#55c987}.play-panel{background:rgba(255,255,255,.34)!important;border:1px solid rgba(255,255,255,.68)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 14px 34px rgba(52,94,74,.10)!important;backdrop-filter:blur(18px) saturate(1.08);-webkit-backdrop-filter:blur(18px) saturate(1.08)}.stage{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015));border-radius:30px}.floating-settings .settings-menu{max-height:min(72vh,520px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;-webkit-overflow-scrolling:touch;padding-right:4px}.floating-settings .settings-menu::-webkit-scrollbar{width:5px}.floating-settings .settings-menu::-webkit-scrollbar-thumb{background:rgba(74,111,93,.24);border-radius:999px}';
    document.head.appendChild(style);
    const toggle=document.createElement('button');
    toggle.id='background-music';toggle.type='button';
    const update=()=>{toggle.textContent=`Background music: ${enabled?'On':'Off'}`};
    update();
    toggle.addEventListener('click',()=>{activated=true;enabled=!enabled;localStorage.setItem(ENABLE_KEY,enabled?'on':'off');update();enabled?play():pause()});
    const wrap=document.createElement('div');wrap.className='audio-range';
    const label=document.createElement('label');const title=document.createElement('span');const value=document.createElement('span');
    title.textContent='BGM volume';value.textContent=`${volume}%`;label.append(title,value);
    const range=document.createElement('input');range.type='range';range.min='0';range.max='40';range.step='1';range.value=String(volume);range.setAttribute('aria-label','Background music volume');
    range.addEventListener('input',()=>{setVolume(range.value);value.textContent=`${volume}%`});
    wrap.append(label,range);menu.insertBefore(toggle,anchor||null);menu.insertBefore(wrap,anchor||null);
  }
  ['pointerdown','keydown','touchstart'].forEach(type=>document.addEventListener(type,activate,{once:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{document.hidden?pause():play()});
  document.querySelector('[data-home="music"]')?.addEventListener('click',()=>{duck(6500);setTimeout(()=>window.petSfx?.('chime'),480)});
  window.petBgm={play,pause,setVolume,duck,get source(){return SOURCE}};
  addControls();
})();