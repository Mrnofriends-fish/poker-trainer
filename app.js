const $=s=>document.querySelector(s),view=$("#view");
const S=JSON.parse(localStorage.getItem("pt_stats")||"{}");
function rec(k,ok){S[k]=S[k]||{n:0,c:0,streak:0,best:0};S[k].n++;if(ok){S[k].c++;S[k].streak++;S[k].best=Math.max(S[k].best,S[k].streak)}else S[k].streak=0;localStorage.setItem("pt_stats",JSON.stringify(S));}
const SUITS=["s","h","d","c"],SYM={s:"♠",h:"♥",d:"♦",c:"♣"};
const cardHTML=c=>`<div class="pc ${"hd".includes(c[1])?"red":""}">${c[0]==="T"?"10":c[0]}<span>${SYM[c[1]]}</span></div>`;
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)];
function deck(){const d=[];for(const r of RANKS)for(const s of SUITS)d.push(r+s);for(let i=d.length-1;i>0;i--){const j=rnd(i+1);[d[i],d[j]]=[d[j],d[i]]}return d;}
function legend(t){return t==="rfi"?`<div class="legend"><span><i class="r"></i>Raise</span><span><i style="background:#262b38"></i>Fold</span></div>`:`<div class="legend"><span><i class="t"></i>3-bet</span><span><i class="c"></i>Call</span><span><i style="background:#262b38"></i>Fold</span></div>`;}
let curChart="RFI UTG";
const V={
charts(){const names=Object.keys(CHARTS);let g="";for(let i=0;i<13;i++)for(let j=0;j<13;j++){const h=handAt(i,j),a=actionFor(curChart,h);g+=`<div class="${a==="raise"?"r":a==="3bet"?"t":a==="call"?"c":""}" data-h="${h}">${h}</div>`;}
 view.innerHTML=`<div class="chips">${names.map(n=>`<button class="${n===curChart?"on":""}" data-c="${n}">${n}</button>`).join("")}</div>
 <div class="score"><span>${curChart} · 6-max 100bb</span><span>${pct(curChart)}% played</span></div>${legend(CHARTS[curChart].type)}
 <div class="grid">${g}</div><div class="fb card-box" id="sel">Tap a hand for its action.</div>`;
 view.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{curChart=b.dataset.c;V.charts()});
 view.querySelectorAll("[data-h]").forEach(d=>d.onclick=()=>{$("#sel").textContent=`${d.dataset.h}: ${actionFor(curChart,d.dataset.h).toUpperCase()}`});},
quiz(){const chart=pick(Object.keys(CHARTS)),d=deck(),c=[d[0],d[1]].sort((a,b)=>RANKS.indexOf(a[0])-RANKS.indexOf(b[0]));
 const h=c[0][0]===c[1][0]?c[0][0]+c[1][0]:c[0][0]+c[1][0]+(c[0][1]===c[1][1]?"s":"o"),ans=actionFor(chart,h),t=CHARTS[chart].type,st=S.quiz||{n:0,c:0,streak:0};
 const spot=t==="rfi"?`Folded to you in <b>${chart.split(" ")[1]}</b>. Raise first in?`:`<b>${chart}</b>: villain opened 2.5bb. Your action?`;
 const acts=t==="rfi"?[["fold","Fold"],["raise","Raise"]]:chart==="SB vs BTN"?[["fold","Fold"],["3bet","3-Bet"]]:[["fold","Fold"],["call","Call"],["3bet","3-Bet"]];
 view.innerHTML=`<div class="score"><span>Score ${st.c}/${st.n}</span><span>Streak ${st.streak}</span></div>
 <div class="card-box"><div class="lbl">${spot}</div><div class="cards">${c.map(cardHTML).join("")}</div><div class="big">${h}</div>
 <div class="acts">${acts.map(([k,l])=>`<button class="btn ${k==="3bet"?"tb":k}" data-a="${k}">${l}</button>`).join("")}</div><div id="fb"></div></div>`;
 view.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const ok=b.dataset.a===ans;rec("quiz",ok);
  $("#fb").innerHTML=`<div class="fb ${ok?"ok":"bad"}">${ok?"✓ Correct":"✗ Chart says "+ans.toUpperCase()} — ${h} in ${chart}</div><div class="acts"><button class="btn" id="nx">Next hand →</button></div>`;
  view.querySelectorAll("[data-a]").forEach(x=>x.disabled=true);$("#nx").onclick=V.quiz;});},
odds(){const pot=pick([4,6,8,10,12,15,20,25,30,40,50,60,80,100]),bet=Math.max(1,Math.round(pot*pick([.25,.33,.5,.66,.75,1,1.25,1.5]))),street=pick(["flop","turn"]);
 const outs=pick([2,4,5,6,8,9,10,12,15]),cards=street==="flop"?47:46;
 const eq=street==="flop"?1-((cards-outs)/cards)*((cards-1-outs)/(cards-1)):outs/cards; // flop: assumes all-in (see two cards)
 const need=bet/(pot+2*bet),ans=eq>=need?"call":"fold",st=S.odds||{n:0,c:0};
 view.innerHTML=`<div class="score"><span>Score ${st.c}/${st.n}</span><span>Pot odds drill</span></div><div class="card-box">
 <div class="lbl">On the ${street}${street==="flop"?" (villain is all-in, you see turn+river)":" (one card to come)"}</div>
 <table><tr><td>Pot (before bet)</td><td>${pot}bb</td></tr><tr><td>Villain bets</td><td>${bet}bb</td></tr><tr><td>Your outs</td><td>${outs}</td></tr></table>
 <div class="acts"><button class="btn fold" data-a="fold">Fold</button><button class="btn call" data-a="call">Call</button></div><div id="fb"></div></div>
 <p class="muted">Required equity = bet ÷ (pot + 2×bet). Rule of 4 and 2: outs×4 on flop (all-in), outs×2 on turn.</p>`;
 view.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const ok=b.dataset.a===ans;rec("odds",ok);
  $("#fb").innerHTML=`<div class="fb ${ok?"ok":"bad"}">${ok?"✓":"✗"} ${ans.toUpperCase()}: need ${(need*100).toFixed(1)}% (call ${bet} to win ${pot+bet}), equity ≈ ${(eq*100).toFixed(1)}%</div><div class="acts"><button class="btn" id="nx">Next →</button></div>`;
  view.querySelectorAll("[data-a]").forEach(x=>x.disabled=true);$("#nx").onclick=V.odds;});},
outs(){let p;for(let k=0;k<5000&&!p;k++)p=genOuts();const{hole,board,outs,label}=p,st=S.outs||{n:0,c:0};
 const opts=new Set([outs]);while(opts.size<4)opts.add(Math.max(1,outs+pick([-4,-3,-2,-1,1,2,3,4,6])));
 view.innerHTML=`<div class="score"><span>Score ${st.c}/${st.n}</span><span>Outs drill</span></div><div class="card-box">
 <div class="lbl">Your hand</div><div class="cards">${hole.map(cardHTML).join("")}</div><div class="lbl">Flop</div><div class="cards">${board.map(cardHTML).join("")}</div>
 <div class="lbl">How many outs to a straight or flush (or better)?</div><div class="acts">${[...opts].sort((a,b)=>a-b).map(o=>`<button class="btn" data-a="${o}">${o}</button>`).join("")}</div><div id="fb"></div></div>`;
 view.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const ok=+b.dataset.a===outs;rec("outs",ok);
  $("#fb").innerHTML=`<div class="fb ${ok?"ok":"bad"}">${ok?"✓":"✗"} ${outs} outs (${label}). Turn hit ≈ ${(outs/47*100).toFixed(0)}%, by river ≈ ${((1-(47-outs)/47*(46-outs)/46)*100).toFixed(0)}%</div><div class="acts"><button class="btn" id="nx">Next →</button></div>`;
  view.querySelectorAll("[data-a]").forEach(x=>x.disabled=true);$("#nx").onclick=V.outs;});},
stats(){const row=(k,n)=>{const s=S[k]||{n:0,c:0,best:0};return `<tr><td>${n}</td><td>${s.c}/${s.n} (${s.n?Math.round(s.c/s.n*100):0}%) · best streak ${s.best||0}</td></tr>`};
 view.innerHTML=`<div class="card-box"><table>${row("quiz","Range quiz")}${row("odds","Pot odds")}${row("outs","Outs")}</table></div><button class="btn" id="rs">Reset stats</button><p class="muted">Stats are stored only on this device (localStorage).</p>`;
 $("#rs").onclick=()=>{if(confirm("Reset all stats?")){for(const k in S)delete S[k];localStorage.removeItem("pt_stats");V.stats()}};}};
// hand category helpers: does 5-7 card set contain straight or flush?
function strongDraw(cards){const sc={};for(const c of cards)sc[c[1]]=(sc[c[1]]||0)+1;if(Object.values(sc).some(v=>v>=5))return true;
 const v=new Set(cards.map(c=>14-RANKS.indexOf(c[0])));if(v.has(14))v.add(1);for(let lo=1;lo<=10;lo++){let ok=true;for(let i=0;i<5;i++)if(!v.has(lo+i))ok=false;if(ok)return true;}return false;}
function genOuts(){const d=deck(),hole=d.slice(0,2),board=d.slice(2,5),rest=d.slice(5);if(strongDraw([...hole,...board]))return null;
 const hits=rest.filter(c=>strongDraw([...hole,...board,c])&&!strongDraw([...board,c]));const outs=hits.length;if(outs<4)return null;
 const sc={};[...hole,...board].forEach(c=>sc[c[1]]=(sc[c[1]]||0)+1);const fd=Object.values(sc).some(v=>v===4);
 const label=fd&&outs>9?"flush + straight draw":fd?"flush draw":outs>=8?"open-ended straight draw":"gutshot";return{hole,board,outs,label};}
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));V[b.dataset.v]();scrollTo(0,0)});
const start=new URLSearchParams(location.search).get("v");if(start&&V[start])document.querySelector(`[data-v=${start}]`).click();else V.charts();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
