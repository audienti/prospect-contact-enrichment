import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profileFields} from '../skills/prospect-contact-enrichment/scripts/profile.mjs';
import {waterfall} from '../skills/prospect-contact-enrichment/scripts/waterfall.mjs';

test('unmatched profile contributes no country or headline to canonical fields',()=>{
 const result=profileFields({name:'Intended Person',linkedin:'https://linkedin.com/in/intended'},{name:'Example'}, {firstName:'Other',lastName:'Person',linkedinUrl:'https://linkedin.com/in/other',headline:'Wrong person',location:{countryCode:'US'},currentPosition:[{companyName:'Example'}]},'2026-10-29T12:00:00Z');
 assert.equal(result.fields.linkedinProfileVerification.status,'needs_review');
 assert.equal(result.fields.profileSummary,undefined);
});
test('unknown or rejected identity causes zero provider calls',async()=>{
 for(const identityConfirmed of [undefined,false,'true']) {
  let calls=0;
  await assert.rejects(()=>waterfall({input:{domain:'example.com',identityConfirmed},providers:[{id:'phone',ready:true,priority:1,capabilities:['phone']}],call:async()=>{calls++;return {status:'ok',candidates:[]};}}),/identity/i);
  assert.equal(calls,0);
 }
});
test('provider phone labels remain candidate evidence, never verified ownership',async()=>{
 for(const verificationStatus of ['valid','verified']) {
  const result=await waterfall({input:{domain:'example.com',identityConfirmed:true,countryCode:'US'},channels:['phone'],providers:[{id:'phone',ready:true,priority:1,capabilities:['phone']}],call:async()=>({status:'ok',candidates:[{value:'2025550123',kind:'direct',verificationStatus}]})});
  assert.equal(result.channels.phone,undefined);
  assert.equal(result.outcomes.phone,'unverified');
  assert.equal(result.candidates[0].verified,false);
  assert.equal(result.candidates[0].value,'+12025550123');
 }
});
