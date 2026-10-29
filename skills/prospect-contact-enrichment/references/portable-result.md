# Portable enrichment handoff

Accept a stable caller reference, person identity, current employer evidence,
existing channels and the requested research mode. No CRM UUID or workspace path
is required. Do not create identity or current-employment claims from a name alone.

Return JSON with:

- `schemaVersion: 1`, `skill: {id: "prospect-contact-enrichment", version: ...}`
  using the installed plugin version, `personRef`, and `method`.
- `status`: `completed`, `partial` or `blocked`. Completion describes the bounded
  work, not contact availability, verification, provider completeness or writeback.
- `identity`: `confirmed|needs_review|unknown`, with method, evidence URLs and
  observation time. Provider activity alone does not confirm current employment.
- `existingChannels`: unchanged input channels and verification evidence.
- `contactEnrichment`: the public-source result defined in the skill (email and
  phone status, nullable value, evidence URLs, verification details, checkedOn,
  sourcesChecked, searches and nextAction). Omit this when no public pass ran.
- `providerResult`: the unchanged versioned waterfall result when that pass ran;
  omit it otherwise. Its schema is `enrichment-result.schema.json`. Do not force
  public-source observations into that provider-only verified-channel structure.
- `profileEvidence` and `recentProfileActivity` when actually inspected, including
  source and coverage. Do not convert blocked activity retrieval into an empty feed.
- `conflicts`, `gaps` and `nextAction`. Retain uncertain candidates separately from
  confirmed channels. No-match research does not remove an existing verified value.

The profile/activity helper consumes its documented provider shape; it is not a
universal parser for arbitrary page contents. Use actual observed business facts
for public-source results. Missing fields remain unknown and do not clear CRM data.

Report separately: published business channels, delivery-verified channels,
unverified candidates, unavailable sources and identity conflicts. DNS/MX, syntax,
generic inboxes, catch-all and name-pattern guesses do not establish verified
personal contacts. A current work address published by its owner can be recorded
as published without claiming it is deliverable.

When saving is authorized, the host maps this handoff into its supported model.
Exo's existing `contactEnrichment`/canonical-field workflow remains supported.
Exora's current recipient contact API records associations, not verification;
it currently accepts email and LinkedIn, not phone. Keep the full candidate and
verification result externally until an appropriate app-owned contract exists.
Never silently flatten those distinctions or claim a successful CRM save if none
occurred. Return the research artifact even when persistence is unavailable.
