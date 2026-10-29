---
name: prospect-contact-enrichment
description: Find and assess person-specific business email and direct business phone channels for existing prospects. Use after prospect fit scoring; preserve provenance and separate contact coverage from fit.
---

# Prospect contact enrichment

Read the experiment, current prospect disposition and existing channels first. Enrich advancing prospects unless the request selects another set. A request to research and save in an Exo workspace includes record writeback; do not ask for approval for each person. This does not authorize sending, calling, account connection or paid services.

## Portable operation

This skill also accepts a prospect brief and evidence packet without Exo or any
CRM. Select public/supplied-source research or an already authorized configured
provider pass from the request and available capabilities. The configured-provider
batch procedure below applies only to that mode. A LinkedIn account or provider
is not a prerequisite for a bounded public-source pass.

Return [the portable handoff](references/portable-result.md) when no host storage
is available. Existing verified channels, identity references and provenance are
inputs, not fields to reconstruct. Preserve unknowns and conflicts. A supplied
fixture is not a live lookup. Exora and other CRMs own their storage mapping; this
skill must not import application code or infer verified delivery from a saved
contact association.

## Useful outcome

Find a work email or direct business phone tied to the correct person and current employer. Generic inboxes, switchboards, inferred email patterns and unverified numbers do not count toward direct-contact coverage. Keep fit score unchanged: a good prospect with no public contact details is still a good prospect.

Use employer pages, the person's public professional pages, published business contact information and relevant speaker or event pages. Search the exact name with current employer. Resolve same-name collisions before attaching anything. Exclude private personal contact information, unrelated directories and accidentally exposed documents. Do not collect personal numbers or home contact details from people-search sites. Do not unlock data, create accounts or connect a provider without authorization.

Stop a public-source pass after inspecting the existing professional sources and two focused contact searches per person when no promising business source remains. Follow a credible lead when it could change the result; do not keep searching just to fill fields. Unavailable or blocked sources mean unknown, not evidence that a channel does not exist.

## Evidence and verification

Record discovery and verification separately:

- `published_business`: person or employer explicitly publishes this channel for business contact; identity and current employment match. Save URL and observation date. Publication is not proof of deliverability.
- `verified`: record the actual verification method, date and result. Never claim mailbox delivery or direct-number ownership from syntax, email format, DNS/MX, or an untested provider label. A catch-all mailbox remains uncertain.
- `unverified`: uncertain association or stale evidence; not an actionable direct contact.
- `not_found`: no suitable channel in inspected sources. It is a completed bounded search, not a permanent statement about the person.

Never fabricate an address from a naming convention or put a guess into the canonical email field. Preserve existing verified channels and their provenance. Conflicting results are retained as candidates; do not silently replace a confirmed channel. Do not send test messages, make verification calls or probe mailboxes during public research.

## Save and finish

For each person save `contactEnrichment` with `method: public-business-sources`, `checkedOn`, `status`, `email`, `phone`, `sourcesChecked`, `searches`, and `nextAction`. Each channel has `status`, nullable `value`, evidence URLs and nullable verification details. `status: completed` means the bounded research finished, not that a contact was found. Missing values stay null. Use `nextAction: use_verified_channel`, `verify_published_channel`, or `needs_contact_source` according to the evidence.

In Exo, use the existing records workflow and stable person ID. Put a confirmed published work address in the canonical email field only when its identity is supported; preserve its separate verification state. Store direct business phone and its evidence in fields until the host has a dedicated channel model. Read existing values before writes and inspect identity conflicts. Do not erase existing channels because this search did not find them.

Complete the selected batch, save results, and report: people checked, published direct work emails, delivery-verified emails, published direct business phones, verified direct phones, and unresolved people. Do not include generic channels in those counts. Record the next action for unresolved people without asking the operator to adjudicate them individually. Suggest a provider or authorized first-party source only as an explicit next capability; absence of credentials does not make the completed public-source pass unfinished.

## Configured provider waterfall

Use `scripts/waterfall.mjs` through the host's authorized provider adapter; Exo's contact-enrichment workflow is one existing adapter. The host discovers installed providers, handles credentials, approval and budget reservations, and stores results on the existing prospect. Use only configured providers. Email requires an explicit valid verification result. Catch-all, unknown, generic, and wrong-company addresses do not qualify. Phone research proceeds independently. A pending lookup remains pending, and provider errors remain blocked rather than becoming a data miss. Resume existing job IDs instead of submitting duplicate searches. Exo cost reservations are estimates unless a provider supplies actual billing.

## Profile and activity evidence

Before conversation preparation, retrieve the prospect’s LinkedIn profile through an available public source or an authorized configured provider. A saved URL alone does not confirm a profile. Match name and current company and store `linkedinProfileVerification` with method, source URL and observation time. Store recent posts, comments or reposts in `recentProfileActivity`, including the item type, concise factual summary, source URL, direct post URL when available, observation time, and publication date or the original relative age. Mark inaccessible profiles and incomplete feeds explicitly. Never infer an exact date from a relative label or invent a post URL. Preserve this evidence for the engagement planner; collecting it does not authorize engagement.

## Complete a qualified batch

For every advancing prospect: inspect saved profile and channels, verify the LinkedIn identity and current company, retrieve recent posts, then retrieve comments only when no relevant recent posts remain. Use `scripts/profile.mjs` to normalize identity and up to three author-matched activities from the last 30 days. Save the profile and activity before contact enrichment. Stop enrichment on an identity mismatch and record the specific missing evidence; do not guess. Keep missing recent activity explicit and continue contact enrichment when identity is confirmed.

Run the full configured phone waterfall after a miss. A diagnostic provider filter is not a completed waterfall. Preserve source, provider verification date, and normalized phone format. National US/Canadian numbers may gain +1 only with confirmed profile country evidence. Retain unverified candidates distinctly from not-found. Reuse verified channels checked within 30 days. Reprocess saved provider responses before paying to repeat a lookup when only parsing or normalization changed.

## Result contract

The waterfall returns version 1 of the enrichment decision contract. Exo validates channels, outcomes and readiness together before writing contact fields. See `references/enrichment-result.schema.json`. Provider errors are attempts, not contact data. Preserve verified channels on failed lookups; do not claim an unverified candidate is verified.
