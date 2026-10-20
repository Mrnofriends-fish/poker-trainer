// Ranges: RFI + BB vs BTN call from poker.yoga simplified 6-max 100bb charts (2.5bb open, SB raise-or-fold).
// 3-bet ranges and other facing-open spots: common simplified linear/polar 100bb charts (approximation).
const RANKS="AKQJT98765432";
function expand(str){const out=new Set();const ri=c=>RANKS.indexOf(c);
 for(const tok of str.trim().split(/\s+/)){if(!tok)continue;
  let m;
  if(m=tok.match(/^([2-9TJQKA])\1(\+)?(?:-([2-9TJQKA])\3)?$/)){const a=ri(m[1]);let lo=a,hi=a;if(m[2])hi=0;if(m[3]){lo=Math.max(a,ri(m[3]));hi=Math.min(a,ri(m[3]));}for(let i=hi;i<=lo;i++)out.add(RANKS[i]+RANKS[i]);continue;}
  if(m=tok.match(/^([2-9TJQKA])([2-9TJQKA])([so])(\+)?(?:-([2-9TJQKA])([2-9TJQKA])[so])?$/)){const h=ri(m[1]),k=ri(m[2]);let from=k,to=k;if(m[4])to=h+1;if(m[5])to=Math.min(k,ri(m[6])),from=Math.max(k,ri(m[6]));for(let i=to;i<=from;i++)out.add(m[1]+RANKS[i]+m[3]);continue;}
  console.warn("bad token",tok);}
 return out;}
const RFI={
 UTG:"66+ A2s+ KTs+ QTs+ JTs T9s 98s 87s 76s ATo+ KQo",
 HJ:"22+ A2s+ K9s+ Q9s+ J9s+ T9s 98s 87s 76s 65s ATo+ KJo+ QJo",
 CO:"22+ A2s+ K6s+ Q8s+ J8s+ T8s+ 97s+ 86s+ 75s+ 65s 54s A8o+ K9o+ Q9o+ JTo",
 BTN:"22+ A2s+ K2s+ Q6s+ J7s+ T7s+ 96s+ 86s+ 75s+ 65s 54s A2o+ K9o+ Q9o+ J8o+ T8o+ 98o",
 SB:"22+ A2s+ K2s+ Q6s+ J7s+ T7s+ 96s+ 86s+ 75s+ 64s+ 54s A2o+ K8o+ Q8o+ J8o+ T9o"};
// Facing-open spots: {threebet, call}; remainder folds
const VS={
 "BB vs BTN":{tb:"TT+ AJs+ KQs AQo+ A5s A4s K9s 76s 65s",
   all:"22+ A2s+ K2s+ Q4s+ J6s+ T6s+ 96s+ 85s+ 75s+ 64s+ 54s A2o+ K7o+ Q9o+ J9o+ T9o"},
 "BB vs CO":{tb:"TT+ AQs+ AKo A5s A4s KJs 76s",
   all:"22+ A2s+ K5s+ Q7s+ J7s+ T7s+ 97s+ 86s+ 75s+ 65s 54s A7o+ K9o+ Q9o+ J9o+ T9o"},
 "SB vs BTN":{tb:"99+ A8s+ A5s A4s KTs+ QTs+ JTs ATo+ KJo+",all:""},
 "BTN vs CO":{tb:"TT+ AJs+ KQs AQo+ A5s A4s K9s Q9s",
   all:"22+ A6s+ A5s A4s K9s+ Q9s+ J9s+ T8s+ 97s+ 87s 76s 65s AJo+ KQo"},
 "CO vs HJ":{tb:"JJ+ AQs+ AKo A5s KQs",all:"77+ ATs+ A5s KTs+ QTs+ JTs T9s AQo+"}};
const CHARTS={};
for(const p in RFI)CHARTS["RFI "+p]={type:"rfi",raise:expand(RFI[p])};
for(const s in VS){const tb=expand(VS[s].tb),all=expand(VS[s].all||VS[s].tb);const call=new Set([...all].filter(h=>!tb.has(h)));CHARTS[s]={type:"vs",tb,call};}
function handAt(i,j){return i===j?RANKS[i]+RANKS[i]:i<j?RANKS[i]+RANKS[j]+"s":RANKS[j]+RANKS[i]+"o";}
function actionFor(chart,h){const c=CHARTS[chart];if(c.type==="rfi")return c.raise.has(h)?"raise":"fold";return c.tb.has(h)?"3bet":c.call.has(h)?"call":"fold";}
function pct(chart){let n=0;const c=CHARTS[chart];for(let i=0;i<13;i++)for(let j=0;j<13;j++){const h=handAt(i,j),a=actionFor(chart,h);if(a!=="fold")n+=i===j?6:i<j?4:12;}return (n/1326*100).toFixed(1);}
