# ADR 001 - Locale Source of Truth and Canonical URL Policy

## Context

Locale resolution historically relied on multiple inputs:
- route `_locale`
- query parameter `tl`
- cookie `locale`
- session `_locale`
- ad hoc fallbacks in several services

This made behavior hard to predict and created inconsistencies between
front-office rendering, generated links, and SSR calls.

## Decision

We standardize locale handling with the following rules:

1. Runtime locale precedence (front-office):
   - route `_locale` (URL canonical source)
   - `locale` cookie (only if published)
   - session `_locale` (only if published)
   - `Accept-Language` (negotiated against published locales)
   - default locale

2. Canonical URL policy:
   - default locale is unprefixed (for example `/projects`)
   - non-default locales are prefixed (for example `/en/projects`)
   - cookie does not override a locale already present in the URL

3. `tl` query parameter policy:
   - removed from runtime locale resolution and SSR locale transport
   - legacy front-office `?tl=` links are redirected to canonical URLs
   - exception: deprecated Sonata translation editing keeps `tl` as an
     internal parameter until Sonata is removed

## Alternatives considered

1. Cookie as single source of truth
   - rejected because it breaks canonical localized URLs, sharing, and SEO.

2. Keep `tl` as a first-class runtime input
   - rejected because it duplicates URL semantics and keeps precedence ambiguous.

3. Keep current mixed approach
   - rejected because it preserves inconsistent behavior and technical debt.

## Consequences

- Locale behavior is deterministic across Symfony front-office and admin-next SSR.
- Legacy `?tl=` links keep working through redirects to canonical URLs.
- Runtime locale logic is centralized and reusable.
- Default-locale URLs remain stable and unprefixed.
- Sonata keeps a scoped `tl` usage only for translation-edit workflows during the migration period.
