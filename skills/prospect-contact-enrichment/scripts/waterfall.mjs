// Policy owner for contact enrichment. Provider discovery/storage belong to the host.
const emailLike=v=>typeof v==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneLike=v=>typeof v==='string'&&/^\+[1-9]\d{7,14}$/.test(v);
const generic=/^(info|hello|sales|support|contact|admin|office|team|careers|jobs|noreply|no-reply)$/i;
export async function waterfall({input,providers,call,channels:requestedChannels=["email","phone"],existingChannels={},now=Date.now()}) {
 const attempts=[],channels={},candidates=[],outcomes={};
 const available=providers.filter(p=>p.ready).sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id));
 const ask=async(p,op,data)=>{let r;try{r=await call(p,op,data);}catch{r={status:'provider_failed'};}attempts.push({provider:p.id,operation:op,status:r.status,jobId:r.jobId??null});return r;};
 // Include still-usable channels even during a single-channel refresh.
 for(const channel of ['email','phone']){
  const existing=existingChannels[channel];
  const age=now-Date.parse(existing?.observedAt);
  if(existing?.verified&&Number.isFinite(age)&&age>=0&&age<30*86400000&&(channel==='phone'?phoneLike(existing.value):emailLike(existing.value)&&existing.value.split('@')[1].toLowerCase()===input.domain?.toLowerCase())){channels[channel]=existing;outcomes[channel]='verified';}
 }
 for(const channel of requestedChannels){
  const existing=existingChannels[channel];
  const fresh=existing?.verified&&Number.isFinite(Date.parse(existing.observedAt))&&now-Date.parse(existing.observedAt)>=0&&now-Date.parse(existing.observedAt)<30*86400000;
  if(fresh&&(channel==='phone'?phoneLike(existing.value):emailLike(existing.value)&&existing.value.split('@')[1].toLowerCase()===input.domain?.toLowerCase())){channels[channel]=existing;outcomes[channel]='verified';continue;}
  if(channel==='email'&&!available.some(p=>p.capabilities.includes('validate_email'))){outcomes.email='missing_validator';continue;}
  if(!available.some(p=>p.capabilities.includes(channel))){outcomes[channel]='no_provider';continue;}
  for(const p of available.filter(p=>p.capabilities.includes(channel)).sort((a,b)=>(a.channelPriorities?.[channel]??a.priority)-(b.channelPriorities?.[channel]??b.priority)||a.id.localeCompare(b.id))){
   const r=await ask(p,channel,{...input,email:channels.email?.value??input.email});
   if(r.status!=='ok')continue;
   for(const candidate of (r.candidates??[]).slice(0,5)){
    const c={...candidate,channel,provider:p.id,verified:false};
    if(channel==='phone'&&['US','CA'].includes(String(input.countryCode??'').toUpperCase())&&/^[2-9]\d{2}[2-9]\d{6}$/.test(c.value)){c.originalValue=c.value;c.value='+1'+c.value;c.normalizationMethod='confirmed_profile_country';}
    candidates.push(c);
    if(channel==='email'){
     if(!emailLike(c.value)||generic.test(c.value.split('@')[0])||!input.domain||c.value.split('@')[1].toLowerCase()!==input.domain.toLowerCase())continue;
     // Every accepted email gets an explicit valid verdict; no fail-open or catch-all fallback.
     for(const validator of available.filter(p=>p.capabilities.includes('validate_email'))){
      const result=await ask(validator,'validate_email',{email:c.value});
      c.validation={provider:validator.id,status:result.status==='ok'?result.verdict:result.status};
      if(result.status==='ok'&&result.verdict==='valid'&&!['role_based','disposable','toxic'].includes(result.subStatus)){channels.email={...c,verified:true,verificationMethod:'email_validation',validator:validator.id,verificationStatus:'valid'};break;}
     }
    }else if(phoneLike(c.value)&&c.kind==='direct'&&['valid','verified'].includes(c.verificationStatus)){
     channels.phone={...c,verified:true,verificationMethod:'provider_reported',verificationStatus:c.verificationStatus};
    }
    if(channels[channel])break;
   }
   if(channels[channel])break;
  }
  const relevant=attempts.filter(a=>a.operation===channel||channel==='email'&&a.operation==='validate_email');
  outcomes[channel]=channels[channel]?'verified':relevant.some(a=>a.status==='pending')?'pending':relevant.some(a=>!['ok','no_match'].includes(a.status))?'blocked':candidates.some(c=>c.channel===channel)?'unverified':'not_found';
 }
 const status=Object.values(outcomes).includes('pending')?'pending':Object.values(outcomes).some(s=>['blocked','missing_validator','no_provider'].includes(s))?'partial':'completed';
 return {schemaVersion:1,status,channels,candidates,attempts,outcomes,nextAction:channels.email||channels.phone?'prepare_engagement':status==='pending'?'await_provider':status==='partial'?'resolve_provider':'needs_contact_source'};
}
