# GoreeCloud News & Weather — Glaze V1.7 Adoption Record

## Status

**Target:** Glaze V1.7 / `1.7.0`  
**Consumer status:** adoption-required  
**Production eligibility:** false  
**Repository-local acceptance:** incomplete

## Authoritative upstream state

The current authoritative Glaze lifecycle identifies:

- Product: **Glaze V1.7**
- Machine version: **1.7.0**
- Canonical lifecycle: **Anchor**
- Stable-compatibility status: **Stable**
- Consumer eligible: **yes**
- Required consumer version: **1.7.0**

The bounded Glaze V1.7 runtime intentionally inherits the accepted GLAZE UI V1.6 / `1.6.0` runtime behavior. It does not import the retained V1.7 Development aggregate or Section 48 Development behavior.

Authoritative upstream records reviewed for this adoption target:

- `GoreeCloud/glaze/VERSION`
- `GoreeCloud/glaze/registry/lifecycle.json`
- `GoreeCloud/glaze/contracts/v1.7/stable-scope.json`
- `GoreeCloud/glaze/acceptance/v1.7-stable.md`
- `GoreeCloud/glaze/js/glaze-v1.7.0.mjs`
- `GoreeCloud/glaze/consumers/registry.json`

## News & Weather source target

News & Weather now targets `1.7.0` in:

- `src/config/product.ts`
- `goreecloud.platform.yaml`
- repository branding and platform-integration records.

This target update does **not** by itself establish consumer conformance.

## Required local acceptance

Before News & Weather may claim accepted Glaze V1.7 consumer conformance, repository-local evidence must cover the applicable supported surfaces, including:

- rendered Home, News, Weather, Settings, onboarding, empty, loading, error, cached/stale, and provider-attribution states;
- light, dark, and system appearance;
- large and extra-large text settings together with browser/platform font scaling;
- keyboard focus order and keyboard-only operation;
- screen-reader semantics and status/error announcements;
- reduced-motion behavior;
- high-contrast/forced-color behavior where supported;
- touch and pointer target usability;
- narrow/mobile, desktop, and representative native layouts;
- provider-unavailable and offline-cache resilience;
- privacy and security boundaries around external provider content;
- performance appropriate to the supported Development targets;
- rollback to the prior known-good app revision;
- exact-revision evidence binding.

## Current boundary

The project currently carries a Glaze 1.7.0 **target**, not completed Glaze consumer acceptance.

The application must remain marked nonconformant / adoption-required until the applicable repository-local checks are implemented, executed, reviewed, and bound to an exact News & Weather revision.

Promotion of Glaze itself does not grant News & Weather release, deployment, Production, or Stable status.
