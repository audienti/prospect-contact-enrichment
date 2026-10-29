import {test} from 'node:test';import assert from 'node:assert/strict';
import {profileFields,activityFields} from '../skills/prospect-contact-enrichment/scripts/profile.mjs';
const person={name:'Example Person',linkedin:'linkedin.com/in/example'},company={name:'Example Co'},now='2026-10-24T12:00:00Z';
test('profile requires matching identity and current company',()=>{
 const data={firstName:'Example',lastName:'Person',linkedinUrl:'https://www.linkedin.com/in/example',currentPosition:[{companyName:'Example Co',position:'Sales lead'}]};
 assert.equal(profileFields(person,company,data,now).title,'Sales lead');
 assert.equal(profileFields(person,{name:'Other company'},data,now).fields.linkedinProfileVerification.status,'needs_review');
 assert.equal(profileFields(person,company,{...data,lastName:'Other'},now).title,undefined);
});
test('activity filters stale, unrelated and duplicate items; preserves actionable links',()=>{
 const post={author:{linkedinUrl:'https://www.linkedin.com/in/example'},content:'A useful public post',linkedinUrl:'https://linkedin.com/posts/example',postedAt:{date:'2026-10-23T12:00:00Z'}};
 const data=[post,post,{...post,linkedinUrl:'https://linkedin.com/posts/old',postedAt:{date:'2025-01-01'}},{...post,author:{linkedinUrl:'https://linkedin.com/in/other'}}];
 const r=activityFields(person,data,now);assert.equal(r.recentProfileActivity.items.length,1);assert.equal(r.recentProfileActivity.items[0].directPostUrl,post.linkedinUrl);
});
test('comment fallback normalizes actor, date and commentary',()=>{
 const r=activityFields(person,[{actor:{linkedinUrl:'https://linkedin.com/in/example'},commentary:'Useful comment',createdAt:'2026-10-23T12:00:00Z',linkedinUrl:'https://linkedin.com/feed/update/example?comment=1'}],now,'comments');
 assert.equal(r.recentProfileActivity.items[0].type,'comment');assert.equal(r.recentProfileActivity.items[0].summary,'Useful comment');
});
