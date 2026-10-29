# Prospect contact enrichment

A separate Audienti skill for researching person-specific work email and direct business phone channels. Public-source research works without provider credentials. Discovery, identity and deliverability are separate states.

Install the plugin or copy `skills/prospect-contact-enrichment` into the host agent's skills directory. Load it after fit scoring. It does not send messages or require a data provider.

Version 0.1.5 includes portable results, identity checks and optional provider adapters.
Provider execution requires separately configured access and authorization; publication does not enable a provider.

Run the synthetic helper checks with `node --test test/*.test.mjs`.

Claude Code installation:

```sh
claude plugin install prospect-contact-enrichment --marketplace audienti/plugins
```

Codex installation (after adding the Audienti marketplace):

```sh
codex plugin add prospect-contact-enrichment@audienti
```
