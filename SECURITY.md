# Security Policy

## Current state

GoreeCloud News & Weather is in Development initialization. There is no verified end-user release.

## Security requirements

The implementation must:

- Treat remote feeds, article content, publisher HTML, images, and weather-provider payloads as untrusted input.
- Validate and normalize external data at explicit trust boundaries.
- Avoid arbitrary script execution in clean-reading views.
- Keep provider credentials and secrets out of client-visible source when exposure would be unsafe.
- Use least privilege for location, notification, filesystem, network, identity, and platform permissions.
- Keep optional identity/synchronization separate from local-only basic use.
- Avoid direct access to another GoreeCloud product's private database.
- Use versioned, contract-driven integrations.
- Apply Wardveil Security where architecturally applicable and verified.
- Fail safely when a provider or integration is unavailable.
- Avoid unnecessary logging of location, identity, credentials, or reading history.

## Secrets

Never commit reusable secrets such as API keys, tokens, private keys, signing secrets, recovery codes, or production credentials.

## Reporting

Use the approved GoreeCloud security-reporting process. Do not publish exploitable details in a public issue before coordinated review.

## Release qualification

A successful build or passing automated test does not by itself establish security acceptance. Stable qualification requires the full applicable GoreeCloud security and platform-conformance evidence.
