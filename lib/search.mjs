const synonymGroups=[
 ['диван','софа','канапе'],['кресло','стул','сиденье'],['наушники','гарнитура','headphones'],['велосипед','велик','байк','bike'],['ремонт','мастер','починка','сервис'],['дизайн','дизайнер','оформление'],['одежда','вещи','гардероб'],['лампа','светильник','свет'],['интерьер','мебель','дом']
];
const synonymMap=new Map();for(const group of synonymGroups)for(const word of group)synonymMap.set(word,group);
export function normalizeSearch(value=''){return String(value).normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/gi,' ').trim();}
function tokens(value){return normalizeSearch(value).split(/\s+/).filter(Boolean)}
function distance(a,b){if(a===b)return 0;if(!a||!b)return Math.max(a.length,b.length);if(Math.abs(a.length-b.length)>2)return 9;const prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let last=prev[0];prev[0]=i;for(let j=1;j<=b.length;j++){const old=prev[j];prev[j]=Math.min(prev[j]+1,prev[j-1]+1,last+(a[i-1]===b[j-1]?0:1));last=old;}}return prev[b.length];}
function tokenScore(q,t){if(q===t)return 18;if(t.startsWith(q)||q.startsWith(t))return 10;if(q.length>=4&&t.length>=4){const d=distance(q,t);if(d===1)return 7;if(d===2&&Math.max(q.length,t.length)>=7)return 4;}return 0;}
export function searchScore(product,query){
 const nq=normalizeSearch(query);if(!nq)return 0;const qs=tokens(nq);const title=normalizeSearch(product.title),seller=normalizeSearch(product.seller),category=normalizeSearch(product.category),description=normalizeSearch(product.description),city=normalizeSearch(product.city);let score=0;
 if(title===nq)score+=120;else if(title.includes(nq))score+=55;if(category.includes(nq))score+=28;if(seller.includes(nq))score+=22;if(description.includes(nq))score+=12;
 const titleTokens=tokens(title),sellerTokens=tokens(seller),categoryTokens=tokens(category),descTokens=tokens(description);
 for(const q of qs){const expanded=new Set([q,...(synonymMap.get(q)||[])]);let best=0;for(const term of expanded){for(const t of titleTokens)best=Math.max(best,tokenScore(term,t)*3);for(const t of categoryTokens)best=Math.max(best,tokenScore(term,t)*2.1);for(const t of sellerTokens)best=Math.max(best,tokenScore(term,t)*1.7);for(const t of descTokens)best=Math.max(best,tokenScore(term,t)*.75);if(city.includes(term))best=Math.max(best,7);}score+=best;}
 if(score>0){score+=Math.min(Number(product.rating||0)*1.8,10)+Math.log10(Number(product.views||0)+10)*2+(product.verified?2:0);}
 return score;
}
export function searchProducts(products,query){const nq=normalizeSearch(query);if(!nq)return [...products];return products.map(product=>({product,score:searchScore(product,nq)})).filter(x=>x.score>=8).sort((a,b)=>b.score-a.score||Number(b.product.views||0)-Number(a.product.views||0)).map(x=>x.product);}
