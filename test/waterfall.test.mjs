import {test} from 'node:test';
import assert from 'node:assert/strict';
import {waterfall} from '../skills/prospect-contact-enrichment/scripts/waterfall.mjs';
const provider=(id,capabilities,priority=1,ready=true)=>({id,capabilities,priority,ready});
const finder=provider('finder',['email','phone']),validator=provider('validator',['validate_email']);
const input={domain:'example.com'};
const email={value:'person@example.com',kind:'work'};
test('verified email survives phone failure; unconfigured provider never called',async()=>{
 const seen=[];const r=await waterfall({input,providers:[finder,validator,provider('disabled',['email'],0,false)],call:async(p,op)=>{seen.push(p.id);return op==='email'?{status:'ok',candidates:[email]}:op==='validate_email'?{status:'ok',verdict:'valid'}:{status:'insufficient_phone_tokens'};}});
 assert.ok(r.channels.email.verified);assert.equal(r.outcomes.phone,'blocked');assert.equal(r.status,'partial');assert.ok(!seen.includes('disabled'));
});
for(const verdict of ['catch-all','unknown','invalid'])test(`reject ${verdict}`,async()=>{
 const r=await waterfall({input,providers:[finder,validator],call:async(p,op)=>op==='email'?{status:'ok',candidates:[email]}:op==='validate_email'?{status:'ok',verdict}:{status:'no_match'}});assert.equal(r.channels.email,undefined);
});
test('pending job stays pending and phone research proceeds independently',async()=>{
 const seen=[];const r=await waterfall({input,providers:[finder,validator],call:async(p,op)=>{seen.push(op);return op==='email'?{status:'pending',jobId:'example-job'}:{status:'no_match'};}});assert.equal(r.status,'pending');assert.equal(r.nextAction,'await_provider');assert.ok(seen.includes('phone'));
});
test('missing validator skips email spend; unknown phone is not verified',async()=>{
 const seen=[];const r=await waterfall({input,providers:[finder],call:async(p,op)=>{seen.push(op);return {status:'ok',candidates:[{value:'+12025550123',kind:'direct',verificationStatus:'unknown'}]};}});assert.deepEqual(seen,['phone']);assert.equal(r.outcomes.email,'missing_validator');assert.equal(r.channels.phone,undefined);
});
test('wrong-domain and generic addresses do not reach validator',async()=>{
 const r=await waterfall({input,providers:[finder,validator],call:async(p,op)=>{assert.notEqual(op,'validate_email');return op==='email'?{status:'ok',candidates:[{value:'sales@example.com'},{value:'person@wrong.example'}]}:{status:'no_match'};}});assert.equal(r.channels.email,undefined);
});
test('phone waterfall falls through from Moltsets miss to Findymail',async()=>{
 const seen=[];
 const r=await waterfall({input,channels:['phone'],providers:[provider('findymail',['phone'],40),{...provider('moltsets',['phone'],50),channelPriorities:{phone:10}}],call:async(p,op)=>{seen.push(p.id);assert.equal(op,'phone');return p.id==='moltsets'?{status:'no_match'}:{status:'ok',candidates:[{value:'+12025550123',kind:'direct',verificationStatus:'verified'}]};}});
 assert.deepEqual(seen,['moltsets','findymail']);assert.equal(r.channels.phone.provider,'findymail');
});
test('fresh verified channel is reused without paying again; phone still falls through',async()=>{
 const seen=[];const now=Date.parse('2026-10-24T12:00:00Z');
 const r=await waterfall({input,providers:[finder,validator],now,existingChannels:{email:{...email,verified:true,observedAt:'2026-10-24T11:00:00Z'}},call:async(p,op)=>{seen.push(op);return {status:'no_match'};}});
 assert.deepEqual(seen,['phone']);assert.equal(r.channels.email.value,email.value);
});
test('carrier-verified national US number normalizes using confirmed profile geography',async()=>{
 const r=await waterfall({input:{...input,countryCode:'US'},channels:['phone'],providers:[finder],call:async()=>({status:'ok',candidates:[{value:'2025550123',kind:'direct',verificationStatus:'verified',lastValidatedAt:'2026-10-24'}]})});assert.equal(r.channels.phone.value,'+12025550123');assert.equal(r.channels.phone.lastValidatedAt,'2026-10-24');
});
test('unverified candidate is not called not-found or silently promoted',async()=>{
 const r=await waterfall({input,channels:['phone'],providers:[finder],call:async()=>({status:'ok',candidates:[{value:'+12025550123',kind:'direct',verificationStatus:'unknown'}]})});assert.equal(r.outcomes.phone,'unverified');assert.equal(r.channels.phone,undefined);
});
test('phone-only refresh retains fresh email readiness but not stale email readiness',async()=>{
 const now=Date.parse('2026-10-24T12:00:00Z');
 const existing={email:{value:'person@example.test',verified:true,observedAt:'2026-10-23T12:00:00Z'}};
 const input={domain:'example.test'};
 const fresh=await waterfall({input,channels:['phone'],providers:[],existingChannels:existing,now});
 assert.equal(fresh.nextAction,'prepare_engagement');assert.equal(fresh.outcomes.email,'verified');
 existing.email.observedAt='2026-08-01T12:00:00Z';
 const stale=await waterfall({input,channels:['phone'],providers:[],existingChannels:existing,now});
 assert.equal(stale.channels.email,undefined);assert.notEqual(stale.nextAction,'prepare_engagement');
});
