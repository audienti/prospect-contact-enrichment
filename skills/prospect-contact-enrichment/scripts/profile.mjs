const norm=v=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const slug=v=>{
 try{
  const raw=String(v??'').trim();
  const url=new URL(/^https?:\/\//i.test(raw)?raw:'https://'+raw);
  const path=url.pathname.replace(/\/$/,'');
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!/(^|\.)linkedin\.com$/i.test(url.hostname)||!/^\/in\/[^/]+$/i.test(path))return '';
  return path.toLowerCase();
 }catch{return '';}
};
export function profileFields(person,company,data,observedAt){
 const positions=Array.isArray(data.currentPosition)?data.currentPosition:[];
 const companyName=norm(company?.name),personName=norm(person.name);
 const current=positions.find(p=>companyName&&norm(p.companyName)===companyName);
 const sameName=!!personName&&norm([data.firstName,data.lastName].filter(Boolean).join(' '))===personName;
 const sameUrl=slug(data.linkedinUrl)===slug(person.linkedin)&&!!slug(person.linkedin);
 const confirmed=sameName&&sameUrl&&!!current;
 const fields={linkedinProfileVerification:{status:confirmed?'confirmed':'needs_review',method:'provider_profile_retrieval',sourceUrl:data.linkedinUrl,observedAt,nameMatched:sameName,profileMatched:sameUrl,companyMatched:!!current},...(confirmed?{profileSummary:{headline:data.headline??null,location:data.location?.linkedinText??null,countryCode:data.location?.countryCode??null,observedAt,sourceUrl:data.linkedinUrl}}:{})};
 return {fields,...(confirmed&&current.position?{title:current.position}:{})};
}
export function activityFields(person,data,observedAt,operation='posts'){
 const rows=(Array.isArray(data)?data:[]).map(p=>operation==='comments'?{...p,author:p.actor,content:typeof p.commentary==='string'?p.commentary:p.commentary?.text,postedAt:{date:p.createdAt}}:p);const cutoff=Date.parse(observedAt)-30*86400000;
 const seen=new Set();
 const items=rows.filter(p=>slug(p.author?.linkedinUrl)===slug(person.linkedin)&&!!slug(person.linkedin))
 .filter(p=>Number.isFinite(Date.parse(p.postedAt?.date))&&Date.parse(p.postedAt.date)>=cutoff&&Date.parse(p.postedAt.date)<=Date.parse(observedAt))
 .sort((a,b)=>Date.parse(b.postedAt.date)-Date.parse(a.postedAt.date))
 .filter(p=>{const url=p.linkedinUrl;if(!url||seen.has(url))return false;seen.add(url);return true;}).slice(0,3)
 .map(p=>({type:operation==='comments'?'comment':p.repost?'repost':'post',summary:String(p.content??p.text??'').split(/\s+/).slice(0,25).join(' '),sourceUrl:p.linkedinUrl,directPostUrl:p.linkedinUrl,publishedAt:p.postedAt.date,observedAt,sourceType:'harvest',authorUrl:p.author?.linkedinUrl}));
 return {recentProfileActivity:{status:items.length?'retrieved':'no_recent_activity',source:'harvest',observedAt,items,coverage:'Up to three identity-matched items from the last 30 days.'}};
}
