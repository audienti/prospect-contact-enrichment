# Synthetic evaluation: public-source contact enrichment

Use `prospect-contact-enrichment` on this complete packet. Public/supplied-source
mode only. No browsing, provider calls, test messages, CRM writes or phone calls.
Return the portable result. Everything below is fictional; do not claim a live
lookup. Research time: 2026-10-28T12:00:00Z.

Person reference `person-jordan`, Jordan Lane, revenue operations lead at Lake
Analytics (`lake.example`). Person profile:
`https://www.linkedin.com/in/jordan-lane-ops`.

Existing channel: email `jordan@lake.example`, explicitly verified by the caller's
authorized provider on 2026-10-22T12:00:00Z. Retain this supplied record including
`verificationMethod: provider_mailbox_check`, `verificationStatus: valid`,
`provider: fixture-provider`, `verified: true` and that observation time.

Supplied source snapshots, inspected at the research time:

- `https://lake.example/team/jordan`: Jordan Lane, revenue operations lead;
  links to the exact person profile above; publishes `j.lane@lake.example` for
  business contact. The page contains no delivery-verification claim.
- `https://lake.example/contact`: `info@lake.example` and `+1 202 555 0100`,
  explicitly labeled main company switchboard.
- `https://directory.example/jordan-lane`: Jordan Lane, CFO at Peak Mining,
  email `jordan@peak.example`. No link to Lake or the supplied LinkedIn identity.
- A saved DNS report says `lake.example` has MX records. It contains no mailbox
  check for either address.
- LinkedIn profile and activity retrieval are unavailable in this packet.
- No direct business phone, paid provider result or other contact source exists
  in the supplied evidence. No public search calls were made in this evaluation.

The user asks for direct business contact enrichment and a useful next action.
