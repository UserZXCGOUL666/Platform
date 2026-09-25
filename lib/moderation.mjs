const latinMap={a:'а',c:'с',e:'е',k:'к',m:'м',o:'о',p:'р',t:'т',x:'х',y:'у'};
export function normalizeModerationText(value=''){
 return String(value).normalize('NFKC').toLowerCase().replace(/[acekmoptxy]/g,ch=>latinMap[ch]||ch).replace(/0/g,'о').replace(/1/g,'и').replace(/3/g,'з').replace(/4/g,'ч').replace(/6/g,'б').replace(/\$/g,'с').replace(/ё/g,'е').replace(/[^a-zа-я0-9\s]/gi,' ').replace(/(.)\1{3,}/g,'$1$1').replace(/\s+/g,' ').trim();
}
const hardRules=[
 {code:'sexual_minors',re:/(детск\w*|несовершеннолет\w*|малолет\w*).{0,24}(порн\w*|эрот\w*|секс\w*)|(порн\w*|эрот\w*|секс\w*).{0,24}(детск\w*|несовершеннолет\w*|малолет\w*)/i},
 {code:'credible_threat',re:/(я\s+тебя\s+)?(убью|зарежу|взорву|пристрелю)\b/i},
 {code:'explicit_sexual',re:/\b(порнограф\w*|изнасилован\w*)\b/i}
];
const profanityRules=[
 /(^|\s)бляд(?:ь|и|ский|ская|ство)?(?=\s|$)/i,
 /(^|\s)пизд(?:а|ец|ы|е|ой|ить|юк|юкать|оват\w*)?(?=\s|$)/i,
 /(^|\s)(?:на|по|за)?ху(?:й|я|ю|ем|ев|и|йня|йло)(?=\s|$)/i,
 /(^|\s)еб(?:ать|ан\w*|уч\w*|ля\w*|ись|усь)(?=\s|$)/i,
 /(^|\s)муд(?:ак|ила|озвон\w*)(?=\s|$)/i,
 /(^|\s)сука(?=\s|$)/i
];
export function moderateText(value=''){
 const normalized=normalizeModerationText(value);
 if(!normalized)return {ok:true,flags:[],normalized};
 const flags=[];
 for(const rule of hardRules)if(rule.re.test(normalized))flags.push(rule.code);
 if(profanityRules.some(re=>re.test(normalized)))flags.push('profanity');
 return {ok:flags.length===0,flags:[...new Set(flags)],normalized,message:flags.includes('sexual_minors')?'Запрещённый сексуальный контент с упоминанием несовершеннолетних.':flags.includes('credible_threat')?'Угрозы насилием запрещены.':flags.includes('explicit_sexual')?'Явно сексуальный контент запрещён.':'Ненормативная лексика запрещена.'};
}
export function assertTextAllowed(fields){
 for(const [label,value] of Object.entries(fields||{})){
  const result=moderateText(value);
  if(!result.ok){const e=new Error(`CONTENT_BLOCKED:${label}:${result.message}`);e.code='CONTENT_BLOCKED';e.flags=result.flags;throw e;}
 }
}
