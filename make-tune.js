/* tune.html 만들기
 *
 * 라이브 게임(index.html)은 절대 건드리지 않는다.
 * 이 스크립트가 index.html을 읽어 조절판이 달린 복사본 tune.html을 만든다.
 * 게임을 고칠 때마다 이걸 한 번 돌리면 조절판도 최신 게임을 물고 온다.
 *
 *   node make-tune.js
 */
const fs = require('fs');

const SRC = 'index.html';
const OUT = 'tune.html';

const DEF = {
  tr_speed:118, tr_mobBase:8, tr_mobPer:4, tr_spdBase:26, tr_spdPer:4,
  tr_inv:1.5, tr_mobSize:30, tr_meSize:35, tr_still:36, tr_hitR:12,
  gs_sway:1.03, gs_amp:80, gs_lean:0.78, gs_fall:0.45, gs_shrink:0.962,
  bp_rate:10,
  st_time:22, st_cool:0.30,
  ic_time:15, ic_up:5.25, ic_decay:38,
  cl_pow:2.8, cl_leak:0.55, cl_ang:62,
  sm_time:13, sm_thr:11, sm_cd:55,
  ou_start:3,
  ws_cups:2, ws_speed:460,
  sq_time:30,
  tc_time:15, tc_fall:185,
  fs_time:25, fs_hp:100, fs_bite:2.0
};

const ROWS = [
  ['— TABLE RUSH —','tr'],
  ['tr_speed','웨이터 속도',40,260,2],
  ['tr_meSize','웨이터 크기',16,80,1],
  ['tr_hitR','웨이터 몸 크기(충돌)',6,28,1],
  ['tr_mobSize','손님 크기',14,70,1],
  ['tr_mobBase','1스테이지 손님 수',2,40,1],
  ['tr_mobPer','스테이지마다 늘어나는 수',0,10,1],
  ['tr_still','서 있는 사람 비율(%)',0,90,1],
  ['tr_spdBase','손님 걸음 기준',4,90,1],
  ['tr_spdPer','스테이지마다 빨라지는 정도',0,14,0.5],
  ['tr_inv','부딪힌 뒤 무적(초)',0.3,4,0.1],
  ['— GLASS STACK —','gs'],
  ['gs_sway','흔들리는 속도',0.3,3,0.01],
  ['gs_amp','흔들리는 폭',30,150,1],
  ['gs_lean','기울기 민감도',0.2,2,0.01],
  ['gs_fall','무너지는 한계',0.2,0.9,0.01],
  ['gs_shrink','한 층마다 좁아지는 비율',0.90,0.995,0.001],
  ['— BLIND POUR —','bp'],
  ['bp_rate','따르는 속도(ml/초)',4,20,0.5],
  ['— STIR STOP —','st'],
  ['st_time','제한 시간(초)',8,40,1],
  ['st_cool','차가워지는 속도',0.1,0.8,0.01],
  ['— ICE CARVING —','ic'],
  ['ic_time','제한 시간(초)',6,40,1],
  ['ic_up','한 번 칠 때 깎이는 양',2,12,0.25],
  ['ic_decay','손 멈추면 얼어붙는 속도',10,80,1],
  ['— CHAMPAGNE LAUNCH —','cl'],
  ['cl_pow','한 번 칠 때 힘',1,6,0.1],
  ['cl_leak','힘이 새는 속도',0.15,1.2,0.05],
  ['cl_ang','각도 올라가는 속도',25,120,1],
  ['— SHAKE MASTER —','sm'],
  ['sm_time','제한 시간(초)',5,30,1],
  ['sm_thr','흔들림 인식 세기',4,20,0.5],
  ['sm_cd','연속 인식 간격(ms)',25,200,5],
  ['— ORDER UP! —','ou'],
  ['ou_start','첫 주문 개수',2,8,1],
  ['— WHERE IS MY SHOT? —','ws'],
  ['ws_cups','첫 잔 개수',2,6,1],
  ['ws_speed','섞이는 속도(느릴수록 큼)',200,700,10],
  ['— FRESH SQUEEZE —','sq'],
  ['sq_time','제한 시간(초)',10,60,1],
  ['— TIP CATCH —','tc'],
  ['tc_time','제한 시간(초)',6,40,1],
  ['tc_fall','떨어지는 속도',90,340,5],
  ['— FLY SWAT —','fs'],
  ['fs_time','제한 시간(초)',10,50,1],
  ['fs_hp','과일 체력',40,220,5],
  ['fs_bite','파리가 갉아먹는 속도',0.5,5,0.1]
];

/* 게임 코드에서 고정 숫자를 조절판 값으로 바꿔치기 (tune.html 안에서만) */
const HOOKS = [
  // TABLE RUSH
  ['        const SPD=118;', "        const SPD=TV('tr_speed',118);"],
  ['    const me={ x:200, y:MAXY+4, r:12, ang:0, vx:0, vy:0 };',
   "    const me={ x:200, y:MAXY+4, r:TV('tr_hitR',12), ang:0, vx:0, vy:0 };"],
  ['      glasses--; inv=1.5; shake=11; sBad();',
   "      glasses--; inv=TV('tr_inv',1.5); shake=11; sBad();"],
  ['      const n=Math.min(52, 8+lv*4), base=26+lv*4;',
   "      const n=Math.min(52, Math.round(TV('tr_mobBase',8)+lv*TV('tr_mobPer',4)));\n"
  +"      const base=TV('tr_spdBase',26)+lv*TV('tr_spdPer',4);"],
  ['      const trios=Math.max(1, Math.floor(n*0.10));',
   "      const st=TV('tr_still',36)/100;\n      const trios=Math.max(1, Math.floor(n*st*0.28));"],
  ['      const pairs=Math.max(1, Math.floor(n*0.12));',
   '      const pairs=Math.max(1, Math.floor(n*st*0.33));'],
  ['      const idles=Math.max(1, Math.floor(n*0.14));',
   '      const idles=Math.max(1, Math.floor(n*st*0.39));'],
  ['      for(const m of mob) drawSprite(m.k, m.x, m.y, 30, m.ang);',
   "      for(const m of mob) drawSprite(m.k, m.x, m.y, TV('tr_mobSize',30), m.ang);"],
  ["          drawSprite('waiter', me.x, me.y, 35, me.ang);",
   "          drawSprite('waiter', me.x, me.y, TV('tr_meSize',35), me.ang);"],
  // GLASS STACK
  ["            sp:1.03+level*0.06, amp:Math.min(150,80+level*3.5) };",
   "            sp:TV('gs_sway',1.03)+level*0.06, amp:Math.min(150,TV('gs_amp',80)+level*3.5) };"],
  ['      lean+=dx*0.78;', "      lean+=dx*TV('gs_lean',0.78);"],
  ['      if(Math.abs(lean)>TRAYW*0.45){', "      if(Math.abs(lean)>TRAYW*TV('gs_fall',0.45)){"],
  ['    const w=Math.max(14, 150*Math.pow(0.962, level));',
   "    const w=Math.max(14, 150*Math.pow(TV('gs_shrink',0.962), level));"],
  // BLIND POUR (선언이 아니라 쓰는 자리에서 읽는다)
  ['dribble=(flip>0.92)?FP_RATE:flip*3;', "dribble=(flip>0.92)?TV('bp_rate',FP_RATE):flip*3;"],
  ['ml+=FP_RATE*dt;', "ml+=TV('bp_rate',FP_RATE)*dt;"],
  ['const flow=pouring?FP_RATE:', "const flow=pouring?TV('bp_rate',FP_RATE):"],
  // STIR STOP
  ['    const CX=200, CY=272, GR=272, ARM=1100, TOTAL=22000;',
   "    const CX=200, CY=272, GR=272, ARM=1100, TOTAL=TV('st_time',22)*1000;"],
  ['        const cool=om*dt*0.3*(dragging?1:0.45)', "        const cool=om*dt*TV('st_cool',0.30)*(dragging?1:0.45)"],
  // ICE CARVING
  ['    const ICEX=185, ICEY=392, ZONE=88, TOTAL=15000, ARM=1200, DECAY=38, TAPUP=5.25;',
   "    const ICEX=185, ICEY=392, ZONE=88, TOTAL=TV('ic_time',15)*1000, ARM=1200,\n"
  +"      DECAY=TV('ic_decay',38), TAPUP=TV('ic_up',5.25);"],
  // CHAMPAGNE
  ['      power+=2.8; vel=Math.min(460,vel+62);', "      power+=TV('cl_pow',2.8); vel=Math.min(460,vel+62);"],
  ['        power=Math.max(0,power-power*dt*0.55-dt*0.3);',
   "        power=Math.max(0,power-power*dt*TV('cl_leak',0.55)-dt*0.3);"],
  ['        if(holdA){ angle=Math.min(88,angle+dt*62);', "        if(holdA){ angle=Math.min(88,angle+dt*TV('cl_ang',62));"],
  // SHAKE MASTER
  ['    const TOTAL=13000;', "    const TOTAL=TV('sm_time',13)*1000;"],
  ['      if(mag!=null&&mag>11&&now()-lastShakeT>55) addShake(); }',
   "      if(mag!=null&&mag>TV('sm_thr',11)&&now()-lastShakeT>TV('sm_cd',55)) addShake(); }"],
  // ORDER UP! / WHERE IS MY SHOT? / FRESH SQUEEZE / TIP CATCH / FLY SWAT
  ['    function newRound(){ const n=3+round;', "    function newRound(){ const n=TV('ou_start',3)+round;"],
  ['      const nSw=2+round*2; swaps=[]; swapDur=Math.max(170,460-round*55);',
   "      const nSw=TV('ws_cups',2)+round*2; swaps=[]; swapDur=Math.max(170,TV('ws_speed',460)-round*55);"],
  ['    const ARM=1300, TOTAL=30000;', "    const ARM=1300, TOTAL=TV('sq_time',30)*1000;"],
  ['    const LANES=[44,96,148,200,252,304,356], ARM=1200, TOTAL=15000, MOUTHY=330;',
   "    const LANES=[44,96,148,200,252,304,356], ARM=1200, TOTAL=TV('tc_time',15)*1000, MOUTHY=330;"],
  ['        vy:(185+Math.random()*70)*(rush?1.45:1)+elapsed/TOTAL*50, kd,',
   "        vy:(TV('tc_fall',185)+Math.random()*70)*(rush?1.45:1)+elapsed/TOTAL*50, kd,"],
  ['    const BX=200, BY=352, TOTAL=25000;', "    const BX=200, BY=352, TOTAL=TV('fs_time',25)*1000;"],
  ['fruitHP=100, hpStage=0;', "fruitHP=TV('fs_hp',100), hpStage=0;"],
  ['        fruitHP=Math.max(0,fruitHP-sitters*2.0*dt);',
   "        fruitHP=Math.max(0,fruitHP-sitters*TV('fs_bite',2.0)*dt);"],
  // 이 페이지에서는 랭킹에 올리지 않는다
  ["    rrCtx={game,score,txt}; show('roundResult');",
   "    rrCtx={game,score,txt}; show('roundResult');\n"
  +"    { const sb=$('rrSubmit'); if(sb) sb.style.display='none';\n"
  +"      const st=$('rrStatus'); if(st) st.textContent='조절판 — 랭킹에 올라가지 않습니다'; }"]
];

const PANEL =
'<script>\n'
+'/* 조절판. 이 페이지에만 있다. 라이브 게임(index.html)에는 없다. */\n'
+'(function(){\n'
+'  var DEF='+JSON.stringify(DEF)+';\n'
+'  var saved={}; try{ saved=JSON.parse(localStorage.getItem("pine_tune")||"{}"); }catch(e){}\n'
+'  var T={}; for(var k in DEF) T[k]=(typeof saved[k]==="number")?saved[k]:DEF[k];\n'
+'  T.__def=DEF;\n'
+'  T.__save=function(){ try{ var o={}; for(var k in DEF) if(T[k]!==DEF[k]) o[k]=T[k];\n'
+'    localStorage.setItem("pine_tune", JSON.stringify(o)); }catch(e){} };\n'
+'  window.TUNE=T;\n'
+'  window.TV=function(k,fb){ var v=T[k]; return (typeof v==="number")?v:fb; };\n'
+'  var ROWS='+JSON.stringify(ROWS)+';\n'
+'  function copyText(txt){\n'
+'    try{ if(navigator.clipboard&&window.isSecureContext){ navigator.clipboard.writeText(txt); return; } }catch(e){}\n'
+'    try{ var ta=document.createElement("textarea"); ta.value=txt;\n'
+'      ta.style.cssText="position:fixed;top:0;left:0;opacity:0";\n'
+'      document.body.appendChild(ta); ta.focus(); ta.select();\n'
+'      document.execCommand("copy"); document.body.removeChild(ta); }catch(e){}\n'
+'  }\n'
+'  function copyGroup(pfx, title){\n'
+'    var out=[];\n'
+'    for(var k in DEF) if(k.indexOf(pfx+"_")===0 && T[k]!==DEF[k]) out.push(k+" = "+T[k]);\n'
+'    if(!out.length){ alert(title+"\\n\\n바꾼 값이 없습니다."); return; }\n'
+'    var txt=title+"\\n"+out.join("\\n");\n'
+'    copyText(txt);\n'
+'    alert(txt+"\\n\\n(복사했습니다. 클로드에게 붙여넣으세요)"); }\n'
+'  function build(){\n'
+'    var box=document.createElement("div"); box.id="tunePanel";\n'
+'    box.style.cssText="position:fixed;right:8px;bottom:8px;z-index:99998;width:250px;max-height:74vh;"\n'
+'      +"overflow:auto;background:rgba(16,14,10,0.96);border:2px solid #6b5a3a;border-radius:8px;"\n'
+'      +"padding:10px;font:11px/1.5 system-ui,sans-serif;color:#e8e6dd;box-shadow:0 6px 24px rgba(0,0,0,.6)";\n'
+'    var h=document.createElement("div");\n'
+'    h.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:pointer";\n'
+'    h.innerHTML="<b style=\'color:#e6b450\'>조절판</b><span id=\'tuneFold\' style=\'opacity:.6\'>접기</span>";\n'
+'    box.appendChild(h);\n'
+'    var body=document.createElement("div"); body.id="tuneBody"; box.appendChild(body);\n'
+'    ROWS.forEach(function(r){\n'
+'      if(r.length<=2){ var t=document.createElement("div");\n'
+'        t.style.cssText="margin:12px 0 4px;color:#c9a96e;font-weight:700;"\n'
+'          +"display:flex;justify-content:space-between;align-items:center;gap:6px";\n'
+'        var nm=document.createElement("span"); nm.textContent=r[0]; t.appendChild(nm);\n'
+'        if(r[1]){ var cb=document.createElement("button"); cb.textContent="복사";\n'
+'          cb.style.cssText="padding:3px 9px;background:#2a2418;color:#e6b450;"\n'
+'            +"border:1px solid #6b5a3a;border-radius:4px;font:10px system-ui;cursor:pointer";\n'
+'          cb.onclick=function(){ copyGroup(r[1], r[0].replace(/—/g,"").trim()); };\n'
+'          t.appendChild(cb); }\n'
+'        body.appendChild(t); return; }\n'
+'      var key=r[0];\n'
+'      var row=document.createElement("div"); row.style.cssText="margin:7px 0";\n'
+'      var lab=document.createElement("div");\n'
+'      lab.style.cssText="display:flex;justify-content:space-between;gap:6px";\n'
+'      var num=document.createElement("span");\n'
+'      num.style.cssText="color:#ffd977;font-variant-numeric:tabular-nums"; num.textContent=T[key];\n'
+'      lab.innerHTML="<span>"+r[1]+"</span>"; lab.appendChild(num);\n'
+'      var sl=document.createElement("input");\n'
+'      sl.type="range"; sl.min=r[2]; sl.max=r[3]; sl.step=r[4]; sl.value=T[key];\n'
+'      sl.style.cssText="width:100%;height:22px;margin-top:2px;accent-color:#e6b450";\n'
+'      var apply=function(){ var v=parseFloat(sl.value); T[key]=v; num.textContent=v; T.__save(); };\n'
+'      sl.addEventListener("input",apply); sl.addEventListener("change",apply);\n'
+'      row.appendChild(lab); row.appendChild(sl); body.appendChild(row); });\n'
+'    var btns=document.createElement("div"); btns.style.cssText="display:flex;gap:6px;margin-top:10px";\n'
+'    var mk=function(txt,fn){ var b=document.createElement("button"); b.textContent=txt;\n'
+'      b.style.cssText="flex:1;padding:7px 0;background:#2a2418;color:#e8e6dd;border:1px solid #6b5a3a;"\n'
+'        +"border-radius:5px;font:11px system-ui;cursor:pointer"; b.onclick=fn; return b; };\n'
+'    btns.appendChild(mk("기본값", function(){ for(var k in DEF) T[k]=DEF[k]; T.__save(); location.reload(); }));\n'
+'    btns.appendChild(mk("전부 복사", function(){\n'
+'      var out=[]; for(var k in DEF) if(T[k]!==DEF[k]) out.push(k+" = "+T[k]);\n'
+'      var txt=out.length?out.join("\\n"):"바꾼 값 없음";\n'
+'      try{ navigator.clipboard.writeText(txt); }catch(e){}\n'
+'      alert(txt+"\\n\\n(복사했습니다. 클로드에게 붙여넣으세요)"); }));\n'
+'    body.appendChild(btns);\n'
+'    var note=document.createElement("div");\n'
+'    note.style.cssText="margin-top:8px;opacity:.55;font-size:10px;line-height:1.4";\n'
+'    note.textContent="게임 이름 옆 복사를 누르면 그 게임만 복사됩니다. 여기는 로컬 전용이라 배포되지 않습니다.";\n'
+'    body.appendChild(note);\n'
+'    var open = innerWidth>600;\n'
+'    body.style.display=open?"block":"none";\n'
+'    h.querySelector("#tuneFold").textContent=open?"접기":"펼치기";\n'
+'    h.onclick=function(){ open=!open; body.style.display=open?"block":"none";\n'
+'      document.getElementById("tuneFold").textContent=open?"접기":"펼치기"; };\n'
+'    document.body.appendChild(box);\n'
+'  }\n'
+'  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",build);\n'
+'  else build();\n'
+'})();\n'
+'</script>';

let s = fs.readFileSync(SRC, 'utf8');
const missing = [];
for (const [a, b] of HOOKS) {
  if (s.includes(a)) s = s.split(a).join(b);
  else missing.push(a.trim().slice(0, 46));
}

/* TV가 먼저 있어야 하므로 조절판을 문서 맨 앞에 넣는다 */
const anchor = '<style>';
if (s.includes(anchor)) s = s.replace(anchor, () => PANEL + '\n' + anchor);
else missing.push('패널 자리');

/* 조절 전용 페이지임을 표시 */
s = s.replace(/(<div id="__buildTag"[^>]*>)([^<]*)(<\/div>)/, (m, a, v, c) => a + v + ' · 조절판' + c);

fs.writeFileSync(OUT, s);

const bad = [...s.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m, i) => { try { new Function(m[1]); return null; } catch (e) { return i + ':' + e.message.slice(0, 50); } })
  .filter(Boolean);

console.log(OUT + ' 만듦 (' + Math.round(s.length / 1024) + 'KB)');
console.log('바꿔치기 ' + (HOOKS.length - missing.length) + '/' + HOOKS.length +
  (missing.length ? '  ★못찾음: ' + missing.join(' | ') : ''));
console.log(bad.length ? '★JS오류 ' + bad.join(' | ') : 'JS 문법 OK');
