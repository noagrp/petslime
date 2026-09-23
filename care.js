(() => {
  const sheets = [...document.querySelectorAll('.care-sheet')];
  const careButtons = [...document.querySelectorAll('[data-care]')];
  const toyKinds = ['play-bubble','home-tv','home-shower','home-bed'];
  const commandKinds = ['cmd-highfive','cmd-peace','cmd-wave','cmd-hide-left','cmd-hide-right','cmd-dig','cmd-dance'];
  let activeCare = '';
  let commandTimer = 0;
  let activityTimer = 0;
  let wakeTimer = 0;

  function injectLatestStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .jump-mini{position:relative;width:22px;height:22px}
      .jump-mini::before{content:"";position:absolute;left:4px;bottom:2px;width:14px;height:11px;border-radius:55% 55% 42% 42%;background:linear-gradient(#9fe8bb,#58c98a);box-shadow:0 -7px 0 -5px #58c98a}
      .jump-mini::after{content:"";position:absolute;left:6px;top:0;width:10px;height:5px;border-top:2px solid #5b9f7a;border-radius:50%}

      .slime.bubble-blow{animation:bubbleBlowBody 5.2s ease-in-out both}
      .slime.bubble-blow .mouth{top:82px;width:18px;height:18px;border:3px solid #315247;border-radius:50%;background:rgba(255,255,255,.18)}
      @keyframes bubbleBlowBody{
        0%,100%{transform:translate3d(var(--x),var(--y),0) scale(1)}
        12%{transform:translate3d(calc(var(--x) - 5px),var(--y),0) scale(1.03,.98)}
        28%{transform:translate3d(calc(var(--x) + 6px),calc(var(--y) - 2px),0) scale(.98,1.02)}
        46%{transform:translate3d(calc(var(--x) - 4px),var(--y),0) scale(1.03,.98)}
        64%{transform:translate3d(calc(var(--x) + 5px),calc(var(--y) - 2px),0) scale(.98,1.02)}
        82%{transform:translate3d(var(--x),var(--y),0) scale(1.02,.99)}
      }

      .toy.play-bubble{left:50%;bottom:132px;width:42px;height:42px}
      .toy.play-bubble::before,.toy.play-bubble::after{content:"";position:absolute;border:3px solid #72b7ca;border-radius:50%;background:rgba(220,248,255,.2)}
      .toy.play-bubble::before{width:23px;height:23px;left:8px;bottom:2px;box-shadow:22px -20px 0 -5px rgba(220,248,255,.18),22px -20px 0 -2px #72b7ca}
      .toy.play-bubble::after{width:15px;height:15px;left:-3px;bottom:12px}
      .toy.play-bubble.show{animation:bubblesFromMouth 5.2s ease-out both}
      @keyframes bubblesFromMouth{
        0%{opacity:0;transform:translate(2px,8px) scale(.25)}
        8%{opacity:1;transform:translate(8px,-4px) scale(.55)}
        22%{transform:translate(28px,-30px) scale(.75)}
        38%{transform:translate(-18px,-64px) scale(.9)}
        55%{transform:translate(34px,-104px) scale(1.05)}
        72%{transform:translate(-26px,-145px) scale(1.16)}
        88%{opacity:1;transform:translate(22px,-184px) scale(1.28)}
        100%{opacity:0;transform:translate(-10px,-218px) scale(1.42)}
      }

      .slime.play-jump-multi{animation:playJumpMulti 4.7s cubic-bezier(.22,.74,.28,1) both}
      @keyframes playJumpMulti{
        0%,100%{transform:translate3d(var(--x),var(--y),0) scale(1)}
        5%{transform:translate3d(var(--x),calc(var(--y) + 8px),0) scale(1.13,.82)}
        15%{transform:translate3d(calc(var(--x) - 48px),calc(var(--y) - 74px),0) scale(.94,1.08) rotate(-5deg)}
        23%{transform:translate3d(calc(var(--x) - 58px),var(--y),0) scale(1.15,.8)}
        31%{transform:translate3d(calc(var(--x) - 12px),calc(var(--y) - 94px),0) scale(.92,1.1) rotate(4deg)}
        40%{transform:translate3d(calc(var(--x) + 4px),var(--y),0) scale(1.17,.79)}
        49%{transform:translate3d(calc(var(--x) + 62px),calc(var(--y) - 82px),0) scale(.93,1.09) rotate(6deg)}
        58%{transform:translate3d(calc(var(--x) + 68px),var(--y),0) scale(1.16,.8)}
        68%{transform:translate3d(calc(var(--x) + 18px),calc(var(--y) - 105px),0) scale(.91,1.12) rotate(-4deg)}
        79%{transform:translate3d(var(--x),var(--y),0) scale(1.18,.78)}
        88%{transform:translate3d(calc(var(--x) - 16px),calc(var(--y) - 48px),0) scale(.97,1.05)}
        95%{transform:translate3d(var(--x),var(--y),0) scale(1.08,.9)}
      }

      .toy.home-bed.show{animation:bedStayUntilWake 8.4s ease both!important}
      @keyframes bedStayUntilWake{
        0%{opacity:0;transform:translateX(-80px) scale(.82)}
        8%{opacity:1;transform:translateX(0) scale(1)}
        88%{opacity:1;transform:translateX(0) scale(1)}
        100%{opacity:0;transform:translateX(28px) scale(.94)}
      }
      .sleep-fx.long-rest.show{animation:zzz 6.8s ease both!important}
      .slime.bed-sleeping{animation:bedSleepPose 6.8s ease-in-out both}
      .slime.bed-sleeping .eye{height:4px;top:67px;border-radius:999px;box-shadow:none}
      @keyframes bedSleepPose{
        0%{transform:translate3d(var(--x),var(--y),0) scale(1)}
        12%{transform:translate3d(var(--x),calc(var(--y) + 8px),0) scale(1.1,.86)}
        20%,88%{transform:translate3d(var(--x),calc(var(--y) + 12px),0) scale(1.15,.76)}
        100%{transform:translate3d(var(--x),var(--y),0) scale(1)}
      }
    `;
    document.head.appendChild(style);
  }

  function simplifyMenus() {
    const playGrid = document.querySelector('#care-play .care-grid');
    if (playGrid) {
      playGrid.innerHTML = `
        <button class="care-option" data-play="bubble" aria-label="Blow bubbles" title="Blow bubbles"><span class="play-mini bubbles-mini"></span><span>Blow bubbles</span></button>
        <button class="care-option" data-play="jump" aria-label="Jump around" title="Jump around"><span class="play-mini jump-mini"></span><span>Jump around</span></button>
      `;
    }

    const homeGrid = document.querySelector('#care-home .care-grid');
    if (homeGrid) {
      homeGrid.innerHTML = `
        <button class="care-option" data-home="tv" aria-label="TV" title="TV"><span>📺</span><span>TV</span></button>
        <button class="care-option" data-home="shower" aria-label="Shower" title="Shower"><span>🚿</span><span>Shower</span></button>
        <button class="care-option" data-home="bed" aria-label="Bed" title="Bed"><span>😴</span><span>Bed</span></button>
      `;
    }
  }

  injectLatestStyles();
  simplifyMenus();

  function closeCare(){sheets.forEach(s=>s.classList.remove('open'));careButtons.forEach(b=>b.classList.remove('active'));activeCare=''}
  function openCare(name){if(activeCare===name){closeCare();return}closeCare();const sheet=document.getElementById(`care-${name}`);const trigger=document.querySelector(`[data-care="${name}"]`);if(!sheet)return;sheet.classList.add('open');trigger?.classList.add('active');activeCare=name;setSettingsOpen(false)}
  careButtons.forEach(button=>button.addEventListener('click',()=>openCare(button.dataset.care)));
  if(els.settingsToggle){els.settingsToggle.addEventListener('click',()=>{if(els.settingsToggle.getAttribute('aria-expanded')==='true')closeCare()})}

  function selectOption(button){const sheet=button.closest('.care-sheet');sheet?.querySelectorAll('.care-option').forEach(item=>item.classList.remove('active'));button.classList.add('active')}
  function clearActivityTimers(){window.clearTimeout(activityTimer);window.clearTimeout(wakeTimer);activityTimer=0;wakeTimer=0}
  function clearActivityClasses(){els.slime.classList.remove('bubble-blow','play-jump-multi','bed-sleeping')}
  function setToy(kind,duration=3200){els.toy.classList.remove('show',...toyKinds);els.toy.classList.add('emoji-toy',kind);els.toy.textContent='';void els.toy.offsetWidth;replayFx(els.toy,'show',duration)}

  const foodInfo={
    '🍓':['strawberry','•','food-crumb'],'🍏':['green apple','●','apple-bit'],'🍪':['cookie','▪','cookie-bit'],
    '🍇':['grapes','●','grape-bit'],'🍉':['watermelon','◆','melon-bit'],'🥕':['carrot','▲','carrot-bit']
  };
  function eat(symbol,button){const info=foodInfo[symbol]||['snack','•','food-crumb'];if(state.fullness>=96){react('tap-react',420);commit(`${state.name} is already completely full.`);return}selectOption(button);els.food.textContent=symbol;state.fullness+=18;state.happiness+=3;replayFx(els.food,'show',1100);react('feed-react',1100);window.setTimeout(()=>particles(info[1],7,info[2]),620);commit(`Yum! ${state.name} munches the ${info[0]}.`)}
  document.querySelectorAll('[data-food]').forEach(button=>button.addEventListener('click',()=>eat(button.dataset.food,button)));

  function startBubblePlay(button){
    if(state.energy<10){replayFx(els.sleepFx,'show',1200);react('rest-react',850);commit(`${state.name} is too sleepy to play right now.`);return}
    clearActivityTimers();clearActivityClasses();selectOption(button);stopThrow();clearReactionClasses();state.happiness+=12;state.energy-=6;state.fullness-=2;
    els.slime.classList.add('bubble-blow');setToy('play-bubble',5200);
    window.setTimeout(()=>particles('○',4,'bubble-pop'),700);window.setTimeout(()=>particles('○',5,'bubble-pop'),1800);window.setTimeout(()=>particles('○',4,'bubble-pop'),3000);window.setTimeout(()=>particles('○',3,'bubble-pop'),4000);
    commit(`${state.name} takes a breath and blows bubbles into the air.`);
    activityTimer=window.setTimeout(()=>{els.slime.classList.remove('bubble-blow');els.slime.classList.add('idle')},5200);
  }

  function startJumpPlay(button){
    if(state.energy<10){replayFx(els.sleepFx,'show',1200);react('rest-react',850);commit(`${state.name} is too sleepy to play right now.`);return}
    clearActivityTimers();clearActivityClasses();selectOption(button);stopThrow();clearReactionClasses();state.happiness+=13;state.energy-=8;state.fullness-=3;
    void els.slime.offsetWidth;els.slime.classList.add('play-jump-multi');
    window.setTimeout(()=>particles('·',3,'ball-pop'),900);window.setTimeout(()=>particles('·',3,'ball-pop'),1900);window.setTimeout(()=>particles('·',3,'ball-pop'),2900);window.setTimeout(()=>particles('·',3,'ball-pop'),3900);
    commit(`${state.name} jumps around the playground again and again!`);
    activityTimer=window.setTimeout(()=>{els.slime.classList.remove('play-jump-multi');els.slime.classList.add('idle')},4700);
  }
  document.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.play==='bubble')startBubblePlay(button);else if(button.dataset.play==='jump')startJumpPlay(button)}));

  function commandReact(kind,duration,message,particle,count=4,particleClass=''){
    clearActivityTimers();clearActivityClasses();window.clearTimeout(commandTimer);stopThrow();clearReactionClasses();els.slime.classList.remove(...commandKinds);void els.slime.offsetWidth;els.slime.classList.add(kind);
    if(particle)window.setTimeout(()=>particles(particle,count,particleClass),280);commit(message);
    commandTimer=window.setTimeout(()=>{els.slime.classList.remove(...commandKinds);els.slime.classList.add('idle')},duration);
  }
  document.querySelectorAll('[data-interact]').forEach(button=>button.addEventListener('click',()=>{
    selectOption(button);const kind=button.dataset.interact;state.happiness+=3;
    if(kind==='highfive')commandReact('cmd-highfive',1800,`${state.name} jumps toward you for a high five!`,'★',5,'command-spark');
    else if(kind==='peace')commandReact('cmd-peace',2100,`${state.name} strikes a little peace pose.`,'V',3,'command-peace');
    else if(kind==='wave')commandReact('cmd-wave',3000,`${state.name} waves while backing away, then comes back.`,'·',4,'command-wave');
    else if(kind==='hide'){const side=Math.random()<.5?'cmd-hide-left':'cmd-hide-right';commandReact(side,3000,`${state.name} hides at the side and peeks back at you.`,'·',3,'command-hide')}
    else if(kind==='dig')commandReact('cmd-dig',3000,`${state.name} digs downward and peeks out from the ground.`,'•',5,'command-dust');
    else if(kind==='dance')commandReact('cmd-dance',3300,`${state.name} does a happy little dance!`,'♪',5,'play-note');
  }));

  function repeatParticles(symbol,count,cssClass,repeats,gap){let n=0;const tick=()=>{particles(symbol,count,cssClass);n+=1;if(n<repeats)window.setTimeout(tick,gap)};tick()}

  function startTV(button){
    clearActivityTimers();clearActivityClasses();selectOption(button);state.energy+=8;state.happiness+=5;state.fullness-=1;
    setToy('home-tv',5200);react('pet-react',1200,'pet-face');repeatParticles('·',2,'tv-note',4,900);commit(`${state.name} settles down beside the TV for a proper rest.`);
  }

  function startShower(button){
    clearActivityTimers();clearActivityClasses();selectOption(button);state.energy+=5;state.happiness+=5;
    setToy('home-shower',4800);react('pet-react',1050,'pet-face');repeatParticles('|',5,'shower-drop',5,650);commit(`${state.name} stands under the shower and gets properly rinsed.`);
  }

  function startBed(button){
    selectOption(button);if(state.energy>=97){react('tap-react',420);commit(`${state.name} is too awake for bed.`);return}
    clearActivityTimers();clearActivityClasses();stopThrow();clearReactionClasses();state.energy+=22;state.fullness-=3;
    setToy('home-bed',8400);els.sleepFx.classList.add('long-rest');replayFx(els.sleepFx,'show',6800);els.slime.classList.add('bed-sleeping');commit(`${state.name} settles on top of the bed... zzz.`);
    wakeTimer=window.setTimeout(()=>{els.slime.classList.remove('bed-sleeping');els.slime.classList.add('idle');els.sleepFx.classList.remove('show','long-rest');render(`${state.name} wakes up feeling refreshed.`)},6800);
    activityTimer=window.setTimeout(()=>{els.toy.classList.remove('show')},8400);
  }

  document.querySelectorAll('[data-home]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.home==='tv')startTV(button);else if(button.dataset.home==='shower')startShower(button);else if(button.dataset.home==='bed')startBed(button);
  }));
})();