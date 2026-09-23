(() => {
  const sheets = [...document.querySelectorAll('.care-sheet')];
  const careButtons = [...document.querySelectorAll('[data-care]')];
  const toyKinds = ['play-bubble','home-tv','home-game','home-shower','home-bed'];
  const commandKinds = ['cmd-highfive','cmd-peace','cmd-wave','cmd-hide-left','cmd-hide-right','cmd-dig','cmd-dance'];
  const shadowKinds = ['shadow-feed','shadow-bubble','shadow-jump','shadow-highfive','shadow-peace','shadow-wave','shadow-hide-left','shadow-hide-right','shadow-dig','shadow-dance','shadow-tv','shadow-game','shadow-shower','shadow-bed'];
  let activeCare = '';
  let commandTimer = 0;
  let activityTimer = 0;
  let wakeTimer = 0;
  let shadowTimer = 0;
  let bubbleTimers = [];

  function injectLatestStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .jump-mini{position:relative;width:22px;height:22px}
      .jump-mini::before{content:"";position:absolute;left:4px;bottom:2px;width:14px;height:11px;border-radius:55% 55% 42% 42%;background:linear-gradient(#9fe8bb,#58c98a);box-shadow:0 -7px 0 -5px #58c98a}
      .jump-mini::after{content:"";position:absolute;left:6px;top:0;width:10px;height:5px;border-top:2px solid #5b9f7a;border-radius:50%}
      .game-mini{position:relative;width:22px;height:14px}
      .game-mini::before{content:"";position:absolute;left:1px;top:2px;width:20px;height:11px;border-radius:7px 7px 8px 8px;background:#596b83;box-shadow:inset 0 0 0 2px rgba(255,255,255,.14)}
      .game-mini::after{content:"";position:absolute;left:4px;top:6px;width:5px;height:2px;background:#dce7ef;box-shadow:2px -2px 0 -1px #dce7ef,2px 2px 0 -1px #dce7ef,10px -1px 0 -1px #f2c66f,13px 1px 0 -1px #7fc0d9}

      .slime.bubble-blow{animation:bubbleBlowBody 6.2s ease-in-out both}
      .slime.bubble-blow .mouth{top:82px;width:18px;height:18px;border:3px solid #315247;border-radius:50%;background:rgba(255,255,255,.18)}
      @keyframes bubbleBlowBody{0%,100%{transform:translate3d(var(--x),var(--y),0) scale(1)}10%{transform:translate3d(calc(var(--x) - 4px),var(--y),0) scale(1.03,.98)}24%{transform:translate3d(calc(var(--x) + 5px),calc(var(--y) - 2px),0) scale(.98,1.02)}40%{transform:translate3d(calc(var(--x) - 4px),var(--y),0) scale(1.03,.98)}56%{transform:translate3d(calc(var(--x) + 5px),calc(var(--y) - 2px),0) scale(.98,1.02)}72%{transform:translate3d(calc(var(--x) - 3px),var(--y),0) scale(1.03,.98)}88%{transform:translate3d(var(--x),var(--y),0) scale(1.02,.99)}}

      .viewer-bubble{position:absolute;z-index:18;pointer-events:none;border:3px solid #72b7ca;border-radius:50%;background:rgba(220,248,255,.18);box-shadow:inset 3px 3px 0 rgba(255,255,255,.55),0 8px 16px rgba(74,130,148,.11);animation:bubbleTowardViewer 1.55s ease-out forwards}
      @keyframes bubbleTowardViewer{0%{opacity:0;transform:translate(-50%,-50%) scale(.18)}12%{opacity:1;transform:translate(-50%,-50%) scale(.35)}55%{opacity:1;transform:translate(calc(-50% + var(--bx)),calc(-50% - 18px)) scale(1.05)}86%{opacity:.82;transform:translate(calc(-50% + var(--bx2)),calc(-50% - 32px)) scale(1.8)}100%{opacity:0;transform:translate(calc(-50% + var(--bx2)),calc(-50% - 42px)) scale(2.25)}}

      .ground-puff{position:absolute;z-index:9;pointer-events:none;width:18px;height:7px;border-radius:50%;background:rgba(118,99,76,.22);filter:blur(.4px);animation:groundPuff .55s ease-out forwards}
      .ground-puff.soft{background:rgba(110,128,116,.18)}
      @keyframes groundPuff{0%{opacity:0;transform:translate(-50%,-10%) scale(.35)}22%{opacity:.9}100%{opacity:0;transform:translate(calc(-50% + var(--puff-x)), -15px) scale(1.7,.75)}}
      .impact-flash{position:absolute;z-index:20;pointer-events:none;width:22px;height:22px;border-radius:50%;border:3px solid rgba(240,190,74,.9);animation:impactFlash .45s ease-out forwards}
      @keyframes impactFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.25)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.7)}}

      .slime.play-jump-multi{animation:playJumpMulti 4.7s cubic-bezier(.22,.74,.28,1) both}
      @keyframes playJumpMulti{0%,100%{transform:translate3d(var(--x),var(--y),0) scale(1)}5%{transform:translate3d(var(--x),calc(var(--y) + 8px),0) scale(1.13,.82)}15%{transform:translate3d(calc(var(--x) - 48px),calc(var(--y) - 74px),0) scale(.94,1.08) rotate(-5deg)}23%{transform:translate3d(calc(var(--x) - 58px),var(--y),0) scale(1.15,.8)}31%{transform:translate3d(calc(var(--x) - 12px),calc(var(--y) - 94px),0) scale(.92,1.1) rotate(4deg)}40%{transform:translate3d(calc(var(--x) + 4px),var(--y),0) scale(1.17,.79)}49%{transform:translate3d(calc(var(--x) + 62px),calc(var(--y) - 82px),0) scale(.93,1.09) rotate(6deg)}58%{transform:translate3d(calc(var(--x) + 68px),var(--y),0) scale(1.16,.8)}68%{transform:translate3d(calc(var(--x) + 18px),calc(var(--y) - 105px),0) scale(.91,1.12) rotate(-4deg)}79%{transform:translate3d(var(--x),var(--y),0) scale(1.18,.78)}88%{transform:translate3d(calc(var(--x) - 16px),calc(var(--y) - 48px),0) scale(.97,1.05)}95%{transform:translate3d(var(--x),var(--y),0) scale(1.08,.9)}}

      .toy.home-game{left:50%;bottom:72px;width:96px;height:62px;z-index:6;transform-origin:center}
      .toy.home-game::before{content:"";position:absolute;left:-48px;top:13px;width:96px;height:42px;border-radius:24px 24px 20px 20px;background:linear-gradient(145deg,#66788f,#4f6076);box-shadow:0 8px 18px rgba(45,56,72,.18),inset 0 0 0 4px rgba(255,255,255,.10)}
      .toy.home-game::after{content:"";position:absolute;left:-26px;top:28px;width:12px;height:4px;background:#dce7ef;box-shadow:4px -4px 0 -2px #dce7ef,4px 4px 0 -2px #dce7ef,46px -3px 0 -1px #f2c66f,52px 2px 0 -1px #7fc0d9}
      .toy.home-game.show{animation:gameRest 5.8s ease both}
      .toy.home-game.game-flash::after{animation:gameButtonFlash .65s ease-out}
      @keyframes gameRest{0%{opacity:0;transform:translate(80px,10px) scale(.72)}12%,88%{opacity:1;transform:translate(42px,0) scale(1)}100%{opacity:0;transform:translate(42px,0) scale(.92)}}
      @keyframes gameButtonFlash{0%,100%{filter:brightness(1)}35%{filter:brightness(1.9);box-shadow:4px -4px 0 -2px #dce7ef,4px 4px 0 -2px #dce7ef,46px -3px 0 -1px #fff0a2,52px 2px 0 -1px #b8efff,46px -3px 10px 2px rgba(255,222,112,.75),52px 2px 10px 2px rgba(116,215,245,.7)}}
      .slime.game-face .eye{height:8px;top:63px;box-shadow:none}
      .slime.game-face .mouth{top:87px;width:20px;height:10px}

      .toy.home-bed.show{animation:bedStayUntilWake 8.4s ease both!important}
      @keyframes bedStayUntilWake{0%{opacity:0;transform:translateX(-80px) scale(.82)}8%{opacity:1;transform:translateX(0) scale(1)}88%{opacity:1;transform:translateX(0) scale(1)}100%{opacity:0;transform:translateX(28px) scale(.94)}}
      .sleep-fx.long-rest.show{animation:zzz 6.8s ease both!important}
      .slime.bed-sleeping{animation:bedSleepPose 6.8s ease-in-out both}
      .slime.bed-sleeping .eye{height:4px;top:67px;border-radius:999px;box-shadow:none}
      @keyframes bedSleepPose{0%,100%{transform:translate3d(var(--x),var(--y),0) scale(1)}12%{transform:translate3d(var(--x),calc(var(--y) + 8px),0) scale(1.1,.86)}20%,88%{transform:translate3d(var(--x),calc(var(--y) + 12px),0) scale(1.15,.76)}}

      .slime-shadow.shadow-feed{animation:shadowFeed 1.1s ease both}
      @keyframes shadowFeed{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(var(--shadow-scale,1));opacity:var(--shadow-opacity,.9)}45%{transform:translateX(var(--shadow-x,0px)) scaleX(1.08);opacity:.82}}
      .slime-shadow.shadow-bubble{animation:shadowBubble 6.2s ease-in-out both}
      @keyframes shadowBubble{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}24%,56%{transform:translateX(calc(var(--shadow-x,0px) + 5px)) scaleX(.98);opacity:.86}40%,72%{transform:translateX(calc(var(--shadow-x,0px) - 4px)) scaleX(1.02);opacity:.88}}
      .slime-shadow.shadow-jump{animation:shadowJump 4.7s cubic-bezier(.22,.74,.28,1) both}
      @keyframes shadowJump{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}15%{transform:translateX(calc(var(--shadow-x,0px) - 48px)) scaleX(.64);opacity:.4}23%{transform:translateX(calc(var(--shadow-x,0px) - 58px)) scaleX(1.08);opacity:.9}31%{transform:translateX(calc(var(--shadow-x,0px) - 12px)) scaleX(.58);opacity:.32}40%{transform:translateX(calc(var(--shadow-x,0px) + 4px)) scaleX(1.1);opacity:.9}49%{transform:translateX(calc(var(--shadow-x,0px) + 62px)) scaleX(.62);opacity:.36}58%{transform:translateX(calc(var(--shadow-x,0px) + 68px)) scaleX(1.09);opacity:.9}68%{transform:translateX(calc(var(--shadow-x,0px) + 18px)) scaleX(.54);opacity:.28}79%{transform:translateX(var(--shadow-x,0px)) scaleX(1.12);opacity:.9}88%{transform:translateX(calc(var(--shadow-x,0px) - 16px)) scaleX(.78);opacity:.56}}
      .slime-shadow.shadow-highfive{animation:shadowHighFive 1.8s ease both}
      @keyframes shadowHighFive{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}48%,60%{transform:translateX(var(--shadow-x,0px)) scaleX(.48);opacity:.24}82%{transform:translateX(var(--shadow-x,0px)) scaleX(1.08);opacity:.88}}
      .slime-shadow.shadow-peace{animation:shadowPeace 2.1s ease both}
      @keyframes shadowPeace{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1)}25%{transform:translateX(calc(var(--shadow-x,0px) - 8px)) scaleX(.94)}55%{transform:translateX(calc(var(--shadow-x,0px) + 8px)) scaleX(.92)}}
      .slime-shadow.shadow-wave{animation:shadowWave 3s ease-in-out both}
      @keyframes shadowWave{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}38%{transform:translateX(calc(var(--shadow-x,0px) + 4px)) scaleX(.62);opacity:.5}56%{transform:translateX(calc(var(--shadow-x,0px) - 3px)) scaleX(.46);opacity:.34}70%{transform:translateX(calc(var(--shadow-x,0px) + 2px)) scaleX(.5);opacity:.38}}
      .slime-shadow.shadow-hide-left{animation:shadowHideLeft 3s ease both}.slime-shadow.shadow-hide-right{animation:shadowHideRight 3s ease both}
      @keyframes shadowHideLeft{0%,100%{transform:translateX(var(--shadow-x,0px));opacity:.9}25%,72%{transform:translateX(calc(var(--shadow-x,0px) - 185px));opacity:.7}48%{transform:translateX(calc(var(--shadow-x,0px) - 168px));opacity:.75}}
      @keyframes shadowHideRight{0%,100%{transform:translateX(var(--shadow-x,0px));opacity:.9}25%,72%{transform:translateX(calc(var(--shadow-x,0px) + 185px));opacity:.7}48%{transform:translateX(calc(var(--shadow-x,0px) + 168px));opacity:.75}}
      .slime-shadow.shadow-dig{animation:shadowDig 3s ease both}
      @keyframes shadowDig{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}24%{transform:translateX(var(--shadow-x,0px)) scaleX(1.12);opacity:.65}44%,70%{transform:translateX(var(--shadow-x,0px)) scaleX(.3);opacity:0}82%{transform:translateX(var(--shadow-x,0px)) scaleX(1.08);opacity:.58}}
      .slime-shadow.shadow-dance{animation:shadowDance 3.3s ease-in-out both}
      @keyframes shadowDance{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}12%{transform:translateX(calc(var(--shadow-x,0px) - 24px)) scaleX(.78);opacity:.58}26%{transform:translateX(calc(var(--shadow-x,0px) + 24px)) scaleX(.9);opacity:.72}40%{transform:translateX(calc(var(--shadow-x,0px) - 20px)) scaleX(.72);opacity:.5}54%{transform:translateX(calc(var(--shadow-x,0px) + 22px)) scaleX(.88);opacity:.7}68%{transform:translateX(calc(var(--shadow-x,0px) - 15px)) scaleX(.75);opacity:.54}84%{transform:translateX(calc(var(--shadow-x,0px) + 12px)) scaleX(.92);opacity:.76}}
      .slime-shadow.shadow-tv{animation:shadowSettle 5.6s ease both}.slime-shadow.shadow-game{animation:shadowSettle 5.8s ease both}.slime-shadow.shadow-shower{animation:shadowSettle 4.8s ease both}
      @keyframes shadowSettle{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}18%,85%{transform:translateX(var(--shadow-x,0px)) scaleX(1.05);opacity:.82}}
      .slime-shadow.shadow-bed{animation:shadowBed 8.4s ease both}
      @keyframes shadowBed{0%,100%{transform:translateX(var(--shadow-x,0px)) scaleX(1);opacity:.9}12%{opacity:.35}20%,82%{transform:translateX(var(--shadow-x,0px)) scaleX(1.1);opacity:.05}88%{opacity:.28}}

      @media(max-width:420px){.toy.home-game.show{animation-name:gameRestPhone}@keyframes gameRestPhone{0%{opacity:0;transform:translate(62px,10px) scale(.72)}12%,88%{opacity:1;transform:translate(30px,0) scale(.9)}100%{opacity:0;transform:translate(30px,0) scale(.84)}}}
    `;
    document.head.appendChild(style);
  }

  function simplifyMenus(){
    const playGrid=document.querySelector('#care-play .care-grid');
    if(playGrid)playGrid.innerHTML=`<button class="care-option" data-play="bubble" aria-label="Blow bubbles" title="Blow bubbles"><span class="play-mini bubbles-mini"></span><span>Blow bubbles</span></button><button class="care-option" data-play="jump" aria-label="Jump around" title="Jump around"><span class="play-mini jump-mini"></span><span>Jump around</span></button>`;
    const homeGrid=document.querySelector('#care-home .care-grid');
    if(homeGrid)homeGrid.innerHTML=`<button class="care-option" data-home="tv" aria-label="TV" title="TV"><span>📺</span><span>TV</span></button><button class="care-option" data-home="game" aria-label="Gaming" title="Gaming"><span class="game-mini"></span><span>Gaming</span></button><button class="care-option" data-home="shower" aria-label="Shower" title="Shower"><span>🚿</span><span>Shower</span></button><button class="care-option" data-home="bed" aria-label="Bed" title="Bed"><span>😴</span><span>Bed</span></button>`;
  }

  injectLatestStyles();simplifyMenus();

  function closeCare(){sheets.forEach(s=>s.classList.remove('open'));careButtons.forEach(b=>b.classList.remove('active'));activeCare=''}
  function openCare(name){if(activeCare===name){closeCare();return}closeCare();const sheet=document.getElementById(`care-${name}`);const trigger=document.querySelector(`[data-care="${name}"]`);if(!sheet)return;sheet.classList.add('open');trigger?.classList.add('active');activeCare=name;setSettingsOpen(false)}
  careButtons.forEach(button=>button.addEventListener('click',()=>openCare(button.dataset.care)));
  if(els.settingsToggle)els.settingsToggle.addEventListener('click',()=>{if(els.settingsToggle.getAttribute('aria-expanded')==='true')closeCare()});

  function selectOption(button){const sheet=button.closest('.care-sheet');sheet?.querySelectorAll('.care-option').forEach(item=>item.classList.remove('active'));button.classList.add('active')}
  function clearBubbleTimers(){bubbleTimers.forEach(t=>window.clearTimeout(t));bubbleTimers=[]}
  function clearShadowAction(){window.clearTimeout(shadowTimer);els.shadow.classList.remove(...shadowKinds);shadowTimer=0}
  function shadowAction(kind,duration){clearShadowAction();const cls=`shadow-${kind}`;void els.shadow.offsetWidth;els.shadow.classList.add(cls);shadowTimer=window.setTimeout(()=>els.shadow.classList.remove(cls),duration)}
  function clearActivityTimers(){window.clearTimeout(activityTimer);window.clearTimeout(wakeTimer);clearBubbleTimers();activityTimer=0;wakeTimer=0}
  function clearActivityClasses(){els.slime.classList.remove('bubble-blow','play-jump-multi','bed-sleeping','game-face');clearShadowAction()}
  function setToy(kind,duration=3200){els.toy.classList.remove('show',...toyKinds,'game-flash');els.toy.classList.add('emoji-toy',kind);els.toy.textContent='';void els.toy.offsetWidth;replayFx(els.toy,'show',duration)}

  function groundPuff(count=2,soft=false,xOffset=0){const stageRect=els.stage.getBoundingClientRect();const slimeRect=els.slime.getBoundingClientRect();const cx=slimeRect.left-stageRect.left+slimeRect.width/2+xOffset;const cy=slimeRect.bottom-stageRect.top-4;for(let i=0;i<count;i++){const puff=document.createElement('span');puff.className=`ground-puff${soft?' soft':''}`;puff.style.left=`${cx+(i-(count-1)/2)*10}px`;puff.style.top=`${cy}px`;puff.style.setProperty('--puff-x',`${(Math.random()-.5)*24}px`);els.fx.appendChild(puff);window.setTimeout(()=>puff.remove(),650)}}
  function impactFlash(){const stageRect=els.stage.getBoundingClientRect();const slimeRect=els.slime.getBoundingClientRect();const flash=document.createElement('span');flash.className='impact-flash';flash.style.left=`${slimeRect.left-stageRect.left+slimeRect.width/2}px`;flash.style.top=`${slimeRect.top-stageRect.top+slimeRect.height*.35}px`;els.fx.appendChild(flash);window.setTimeout(()=>flash.remove(),500)}

  const foodInfo={'🍓':['strawberry','•','food-crumb'],'🍏':['green apple','●','apple-bit'],'🍪':['cookie','▪','cookie-bit'],'🍇':['grapes','●','grape-bit'],'🍉':['watermelon','◆','melon-bit'],'🥕':['carrot','▲','carrot-bit']};
  function eat(symbol,button){const info=foodInfo[symbol]||['snack','•','food-crumb'];if(state.fullness>=96){react('tap-react',420);commit(`${state.name} is already completely full.`);return}selectOption(button);els.food.textContent=symbol;state.fullness+=18;state.happiness+=3;replayFx(els.food,'show',1100);react('feed-react',1100);shadowAction('feed',1100);window.setTimeout(()=>particles(info[1],5,info[2]),620);commit(`Yum! ${state.name} munches the ${info[0]}.`)}
  document.querySelectorAll('[data-food]').forEach(button=>button.addEventListener('click',()=>eat(button.dataset.food,button)));

  function blowOneBubble(){const stageRect=els.stage.getBoundingClientRect();const slimeRect=els.slime.getBoundingClientRect();const bubble=document.createElement('span');bubble.className='viewer-bubble';const size=20+Math.round(Math.random()*10);bubble.style.width=`${size}px`;bubble.style.height=`${size}px`;bubble.style.left=`${slimeRect.left-stageRect.left+slimeRect.width/2}px`;bubble.style.top=`${slimeRect.top-stageRect.top+slimeRect.height*.66}px`;const drift=(Math.random()-.5)*28;bubble.style.setProperty('--bx',`${drift}px`);bubble.style.setProperty('--bx2',`${drift*1.5}px`);els.fx.appendChild(bubble);window.setTimeout(()=>bubble.remove(),1700)}
  function startBubblePlay(button){if(state.energy<10){replayFx(els.sleepFx,'show',1200);react('rest-react',850);commit(`${state.name} is too sleepy to play right now.`);return}clearActivityTimers();clearActivityClasses();selectOption(button);stopThrow();clearReactionClasses();state.happiness+=12;state.energy-=6;state.fullness-=2;els.slime.classList.add('bubble-blow');shadowAction('bubble',6200);[350,1250,2200,3200,4250,5250].forEach(delay=>bubbleTimers.push(window.setTimeout(blowOneBubble,delay)));commit(`${state.name} blows bubbles toward you, one by one.`);activityTimer=window.setTimeout(()=>{els.slime.classList.remove('bubble-blow');els.slime.classList.add('idle')},6200)}
  function startJumpPlay(button){if(state.energy<10){replayFx(els.sleepFx,'show',1200);react('rest-react',850);commit(`${state.name} is too sleepy to play right now.`);return}clearActivityTimers();clearActivityClasses();selectOption(button);stopThrow();clearReactionClasses();state.happiness+=13;state.energy-=8;state.fullness-=3;void els.slime.offsetWidth;els.slime.classList.add('play-jump-multi');shadowAction('jump',4700);[1080,1880,2780,3710,4470].forEach((delay,i)=>window.setTimeout(()=>groundPuff(i===4?2:1,true),delay));commit(`${state.name} jumps around the playground again and again!`);activityTimer=window.setTimeout(()=>{els.slime.classList.remove('play-jump-multi');els.slime.classList.add('idle')},4700)}
  document.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.play==='bubble')startBubblePlay(button);else if(button.dataset.play==='jump')startJumpPlay(button)}));

  function commandReact(kind,duration,message,effect='none'){clearActivityTimers();clearActivityClasses();window.clearTimeout(commandTimer);stopThrow();clearReactionClasses();els.slime.classList.remove(...commandKinds);void els.slime.offsetWidth;els.slime.classList.add(kind);shadowAction(kind.replace('cmd-',''),duration);if(effect==='impact')window.setTimeout(impactFlash,720);else if(effect==='sparkle')window.setTimeout(()=>particles('✦',1,'command-peace'),420);else if(effect==='dust'){window.setTimeout(()=>groundPuff(3,false),550);window.setTimeout(()=>groundPuff(2,false),1050);window.setTimeout(()=>groundPuff(2,false),2150)}else if(effect==='music'){[420,1320,2320].forEach(delay=>window.setTimeout(()=>particles('♪',1,'play-note'),delay))}commit(message);commandTimer=window.setTimeout(()=>{els.slime.classList.remove(...commandKinds);els.slime.classList.add('idle')},duration)}
  document.querySelectorAll('[data-interact]').forEach(button=>button.addEventListener('click',()=>{selectOption(button);const kind=button.dataset.interact;state.happiness+=3;if(kind==='highfive')commandReact('cmd-highfive',1800,`${state.name} jumps toward you for a high five!`,'impact');else if(kind==='peace')commandReact('cmd-peace',2100,`${state.name} strikes a little peace pose.`,'sparkle');else if(kind==='wave')commandReact('cmd-wave',3000,`${state.name} waves while backing away, then comes back.`);else if(kind==='hide'){const side=Math.random()<.5?'cmd-hide-left':'cmd-hide-right';commandReact(side,3000,`${state.name} hides at the side and peeks back at you.`)}else if(kind==='dig')commandReact('cmd-dig',3000,`${state.name} digs downward and peeks out from the ground.`,'dust');else if(kind==='dance')commandReact('cmd-dance',3300,`${state.name} does a happy little dance!`,'music')}));

  function repeatParticles(symbol,count,cssClass,repeats,gap){let n=0;const tick=()=>{particles(symbol,count,cssClass);n+=1;if(n<repeats)window.setTimeout(tick,gap)};tick()}
  function startTV(button){clearActivityTimers();clearActivityClasses();selectOption(button);state.energy+=8;state.happiness+=5;state.fullness-=1;setToy('home-tv',5600);react('pet-react',1200,'pet-face');shadowAction('tv',5600);commit(`${state.name} settles down beside the TV for a proper rest.`)}
  function startGame(button){clearActivityTimers();clearActivityClasses();selectOption(button);state.happiness+=8;state.energy-=3;state.fullness-=1;setToy('home-game',5800);stopThrow();clearReactionClasses();els.slime.classList.add('game-face');shadowAction('game',5800);window.setTimeout(()=>{els.toy.classList.add('game-flash');window.setTimeout(()=>els.toy.classList.remove('game-flash'),700)},850);commit(`${state.name} grabs the controller for a little gaming session.`);activityTimer=window.setTimeout(()=>{els.slime.classList.remove('game-face');els.slime.classList.add('idle')},5800)}
  function startShower(button){clearActivityTimers();clearActivityClasses();selectOption(button);state.energy+=5;state.happiness+=5;setToy('home-shower',4800);react('pet-react',1050,'pet-face');shadowAction('shower',4800);repeatParticles('|',4,'shower-drop',5,650);commit(`${state.name} stands under the shower and gets properly rinsed.`)}
  function startBed(button){selectOption(button);if(state.energy>=97){react('tap-react',420);commit(`${state.name} is too awake for bed.`);return}clearActivityTimers();clearActivityClasses();stopThrow();clearReactionClasses();state.energy+=22;state.fullness-=3;setToy('home-bed',8400);els.sleepFx.classList.add('long-rest');replayFx(els.sleepFx,'show',6800);els.slime.classList.add('bed-sleeping');shadowAction('bed',8400);commit(`${state.name} settles on top of the bed... zzz.`);wakeTimer=window.setTimeout(()=>{els.slime.classList.remove('bed-sleeping');els.slime.classList.add('idle');els.sleepFx.classList.remove('show','long-rest');render(`${state.name} wakes up feeling refreshed.`)},6800);activityTimer=window.setTimeout(()=>els.toy.classList.remove('show'),8400)}
  document.querySelectorAll('[data-home]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.home==='tv')startTV(button);else if(button.dataset.home==='game')startGame(button);else if(button.dataset.home==='shower')startShower(button);else if(button.dataset.home==='bed')startBed(button)}));
})();