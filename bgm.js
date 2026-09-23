(() => {
  const ENABLE_KEY='petslime-bgm-v1';
  const VOL_KEY='petslime-bgm-volume-v1';
  const MANIFEST='bgm/tracks.json';
  let enabled=localStorage.getItem(ENABLE_KEY)!=='off';
  let volume=Math.max(0,Math.min(40,Number(localStorage.getItem(VOL_KEY)??12)||12));
  let activated=false;
  let duckTimer=0;
  let tracks=[];
  let index=0;
  let finished=false;
  let playButton=null;
  let trackLabel=null;
  const audio=new Audio();
  audio.loop=false;
  audio.preload='metadata';
  audio.volume=volume/100;

  function sourceFor(name){return `bgm/${name}`}
  function updatePlayer(){
    if(playButton) playButton.textContent=audio.paused?'▶':'❚❚';
    if(trackLabel) trackLabel.textContent=tracks.length?`${index+1}/${tracks.length}`:'0/0';
  }
  function loadTrack(nextIndex,autoplay=false){
    if(!tracks.length)return;
    index=Math.max(0,Math.min(tracks.length-1,nextIndex));
    finished=false;
    audio.src=sourceFor(tracks[index]);
    audio.load();
    updatePlayer();
    if(autoplay&&activated&&enabled&&!document.hidden)audio.play().catch(()=>{});
  }
  function play(){
    if(!tracks.length||!activated||document.hidden)return;
    if(finished){loadTrack(0,false)}
    enabled=true;
    localStorage.setItem(ENABLE_KEY,'on');
    audio.play().catch(()=>{});
    updatePlayer();
  }
  function pause(){audio.pause();updatePlayer()}
  function activate(){if(activated)return;activated=true;if(enabled)play()}
  function setVolume(v){volume=Math.max(0,Math.min(40,Number(v)||0));audio.volume=volume/100;localStorage.setItem(VOL_KEY,String(volume))}
  function duck(ms=6500){clearTimeout(duckTimer);const normal=volume/100;audio.volume=Math.min(normal,.06);duckTimer=setTimeout(()=>{audio.volume=volume/100},ms)}
  function previous(){
    if(!tracks.length||index<=0)return;
    const wasPlaying=!audio.paused;
    loadTrack(index-1,wasPlaying);
  }
  function next(){
    if(!tracks.length)return;
    if(index>=tracks.length-1){pause();return}
    const wasPlaying=!audio.paused;
    loadTrack(index+1,wasPlaying);
  }
  function togglePlay(){
    activated=true;
    if(audio.paused)play();
    else{enabled=false;localStorage.setItem(ENABLE_KEY,'off');pause()}
  }

  async function loadManifest(){
    try{
      const response=await fetch(`${MANIFEST}?v=20260923-28`,{cache:'no-store'});
      const list=await response.json();
      tracks=Array.isArray(list)?list.filter(name=>typeof name==='string'&&/\.mp3$/i.test(name)):[];
    }catch{}
    if(!tracks.length)tracks=['petslime-main-song.mp3'];
    loadTrack(0,false);
    if(activated&&enabled)play();
  }

  function bindSettingsToggle(){
    const toggle=document.getElementById('settings-toggle');
    const menu=document.getElementById('settings-menu');
    if(!toggle||!menu||toggle.dataset.robustBound==='1')return;
    toggle.dataset.robustBound='1';
    toggle.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const open=menu.hidden;
      menu.hidden=!open;
      toggle.classList.toggle('open',open);
      toggle.textContent=open?'×':'+';
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Close settings':'Open settings');
      if(open)menu.scrollTop=0;
    },true);
  }

  function moveSettings(){
    const settings=document.querySelector('.floating-settings');
    const top=document.querySelector('.top-panel');
    if(settings&&top&&settings.parentElement!==top)top.appendChild(settings);
  }

  function addControls(){
    const menu=document.getElementById('settings-menu');
    if(!menu||document.getElementById('bgm-player'))return;
    const anchor=document.getElementById('howto');
    const style=document.createElement('style');
    style.textContent='.top-panel{position:relative!important;z-index:100!important;overflow:visible!important}.play-panel{position:relative!important;z-index:1!important}.bottom-panel{position:relative;z-index:0}.floating-settings{right:12px!important;top:12px!important;z-index:110!important}.floating-settings .settings-toggle{z-index:112!important}.floating-settings .settings-menu{top:43px!important;bottom:auto!important;right:0!important;z-index:111!important;width:190px!important;height:auto!important;min-height:0!important;max-height:min(68vh,360px)!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;scrollbar-width:thin;-webkit-overflow-scrolling:touch;padding-right:4px!important}.floating-settings .settings-menu:not([hidden]){display:block!important}.floating-settings .settings-menu::-webkit-scrollbar{width:5px}.floating-settings .settings-menu::-webkit-scrollbar-thumb{background:rgba(74,111,93,.24);border-radius:999px}.audio-range,.bgm-player{margin-top:6px;padding:9px 11px;border:1px solid rgba(255,255,255,.84);border-radius:14px;background:rgba(255,255,255,.86);box-shadow:0 8px 22px rgba(52,94,74,.11);backdrop-filter:blur(14px)}.audio-range label{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#516b5e;font-size:.73rem}.audio-range input{width:100%;accent-color:#55c987}.bgm-player-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;color:#516b5e;font-size:.73rem}.bgm-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.floating-settings .settings-menu .bgm-buttons button{margin:0;padding:8px 4px;text-align:center;font-size:.9rem}.play-panel{background:rgba(255,255,255,.34)!important;border:1px solid rgba(255,255,255,.68)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 14px 34px rgba(52,94,74,.10)!important;backdrop-filter:blur(18px) saturate(1.08);-webkit-backdrop-filter:blur(18px) saturate(1.08)}.stage{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015));border-radius:30px}@media(max-width:420px){.floating-settings{right:8px!important;top:8px!important}.floating-settings .settings-menu{width:min(190px,66vw)!important;max-height:62vh!important}}';
    document.head.appendChild(style);

    const player=document.createElement('div');
    player.id='bgm-player';player.className='bgm-player';
    const head=document.createElement('div');head.className='bgm-player-head';
    const title=document.createElement('span');title.textContent='BGM';
    trackLabel=document.createElement('span');trackLabel.textContent='0/0';
    head.append(title,trackLabel);
    const buttons=document.createElement('div');buttons.className='bgm-buttons';
    const prev=document.createElement('button');prev.type='button';prev.textContent='⏮';prev.setAttribute('aria-label','Previous BGM');
    playButton=document.createElement('button');playButton.type='button';playButton.textContent='▶';playButton.setAttribute('aria-label','Play or pause BGM');
    const nextButton=document.createElement('button');nextButton.type='button';nextButton.textContent='⏭';nextButton.setAttribute('aria-label','Next BGM');
    prev.addEventListener('click',previous);playButton.addEventListener('click',togglePlay);nextButton.addEventListener('click',next);
    buttons.append(prev,playButton,nextButton);player.append(head,buttons);

    const wrap=document.createElement('div');wrap.className='audio-range';
    const label=document.createElement('label');const labelTitle=document.createElement('span');const value=document.createElement('span');
    labelTitle.textContent='BGM volume';value.textContent=`${volume}%`;label.append(labelTitle,value);
    const range=document.createElement('input');range.type='range';range.min='0';range.max='40';range.step='1';range.value=String(volume);range.setAttribute('aria-label','Background music volume');
    range.addEventListener('input',()=>{setVolume(range.value);value.textContent=`${volume}%`});
    wrap.append(label,range);
    menu.insertBefore(player,anchor||null);menu.insertBefore(wrap,anchor||null);
    updatePlayer();
  }

  audio.addEventListener('play',updatePlayer);
  audio.addEventListener('pause',updatePlayer);
  audio.addEventListener('ended',()=>{
    if(index<tracks.length-1){loadTrack(index+1,true)}
    else{finished=true;pause()}
  });
  ['pointerdown','keydown','touchstart'].forEach(type=>document.addEventListener(type,activate,{once:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{document.hidden?pause():(enabled&&!finished&&play())});
  document.querySelector('[data-home="music"]')?.addEventListener('click',()=>{duck(6500);setTimeout(()=>window.petSfx?.('chime'),480)});
  window.petBgm={play,pause,setVolume,duck,previous,next,get tracks(){return [...tracks]},get index(){return index},get source(){return tracks[index]?sourceFor(tracks[index]):''}};
  moveSettings();
  bindSettingsToggle();
  addControls();
  loadManifest();
})();