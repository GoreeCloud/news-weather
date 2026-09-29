# Contributing to GoreeCloud News & Weather

GoreeCloud News & Weather is original GoreeCloud-owned software.

## Read first

1. `PROJECT-SPECIFICATIONS.md`
2. `IMPLEMENTED-FEATURES.md`
3. `PLANNED-FEATURES.md`
4. `SECURITY.md`
5. `PRIVACY.md`
6. Relevant documents under `docs/`

## Change rules

Changes should:

- Preserve the no-ads and no-engagement-manipulation direction.
- Keep news processing in GoreeCloud Feeds.
- Keep weather providers behind the normalized provider boundary.
- Preserve local-only basic use.
- Keep location permission optional and explicit.
- Avoid unrelated dashboard content.
- Follow Glaze UI and accessibility requirements.
- Distinguish planned, partial, implemented, and verified state.
- Add or update tests with implementation.
- Update onboarding whenever material user-facing behavior, permissions, navigation, defaults, or setup requirements change.
- Reconcile project docs when material architecture, feature, release, or integration state changes.

## Dependencies

Do not adopt a third-party application shell or upstream product architecture as the application. Third-party dependencies require a justified technical purpose, compatible licensing, and security/privacy review.

## Pull requests

Describe what changed, why it is needed, specification linkage, security/privacy impact, platform impact, validation performed, remaining unverified state, and rollback/recovery considerations when material.
