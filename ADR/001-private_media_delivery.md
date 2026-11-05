# ADR 001 - Authorize media delivery before serving files

## Status

Accepted, 9 October 2026.

## Read enforcement toggle — 26 October 2026

The `private_media_read_enforcement` feature flag controls direct file delivery,
thumbnail generation and internal/preview GraphQL Media field authorization.
It is disabled by default on existing and new instances. While disabled, anyone
who knows a registered private media URL can read it, except for voice messages,
whose HTTP delivery always requires an administrator. Unknown files still return
404 and media HTTP responses retain `private, no-store` headers.

Enable the flag only after write protections and historical conversion have been
deployed and conversion has completed on the instance, with no unresolved audit
errors or eligible media remaining. Keep the instance report as the activation
gate. See the [staged rollout procedure](../docs/private-media-public-copies-spec.md#déploiement).

```bash
# Enforce private media read permissions on this instance.
docker exec -w /var/www capco_application_1 bin/console capco:toggle:enable private_media_read_enforcement
# Restore the read bypass if legitimate media becomes inaccessible.
docker exec -w /var/www capco_application_1 bin/console capco:toggle:disable private_media_read_enforcement
```

Changes take effect on subsequent requests without rebuilding GraphQL definitions.
With enforcement enabled, public files remain accessible; a public association
does not grant access to a private attachment. The flag does not change response
download permissions, media selection, upload classification or write protections.

New public covers and rich-text references reject private media before flush,
including for administrators and authorized readers. Publication transitions validate
unchanged content as well. Answer uploads carry their question identifier; the server
classifies private, hidden and questionnaire uploads before storing them. A session-scoped
24-hour pending grant permits the uploader to preview a private file before submission.
After submission, response permissions apply.

Historical shared files are converted only by `capco:media:split-historical-private`.
One verified private copy receives confidential answer associations and supported private
HTML references; the original becomes public with its identifiers and URLs unchanged.
Conversion is atomic in the database and tracked in provider metadata. No schema migration
or runtime public-reference scan is required. Converted originals stay public after their
last public association is removed. Unknown or unsupported confidential references block
conversion. See the [specification and operator procedure](../docs/private-media-public-copies-spec.md).

Regenerate GraphQL definitions and renew Symfony caches when deploying.

## Context

Questionnaire attachments shared the public media directory with avatars and site
illustrations. Authorizing GraphQL responses and the download route did not protect
an original file or a cached thumbnail when its URL was known. Forms could also
reuse an inaccessible attachment as a public illustration.

## Decision

Keep existing file paths and URLs. Nginx sends every `/media/` request to Symfony,
including existing thumbnails and image-generation requests. The application
requires a registered media record and, when enforcement is enabled, checks answer permissions before serving
or transforming its file. Questionnaire files follow reply permissions, including
the participant and exact-reply cookies. Private proposal and profile answers use
the same permissions for direct GraphQL reads and attachments. Authors retain
access to private answers; hidden questions require an administrator or an
authorized proposal analyst. Analysis answers and files require analysis access,
even when their question is not marked private. Public illustrations remain
readable anonymously.

A confidential answer takes precedence over a public reuse of the same media.
Its `provider_metadata.private_attachment` marker is permanent, so removing a
response cannot publish its former attachment. The migration marks existing
attachments; a Doctrine subscriber marks subsequent attachments and existing files
when a question becomes private or hidden. Analysis attachments are always marked.
It also marks removed associations before flushing,
including collections cleared during the privacy change. Orphaned marked media
remain restricted to administrators.

Media selection in Doctrine form fields and the direct illustration mutation
checks the same permissions before form listeners mutate managed media collections.
A rejected selection cannot be persisted by another mutation in the same request.
Cropping remains administrator-only. With enforcement enabled, GraphQL media fields also check access, including
legacy public associations. Each upload creates its own media record and file;
filename, size and MIME type do not prove identical contents or ownership.

All media HTTP responses use `private, no-store`. Varnish passes these requests
without stripping cookies. Confidential URLs use the application host so that
the browser sends its existing authentication cookies. The remote Varnish also
bypasses cache reads and writes for participation/session cookies and Authorization
headers. It respects backend `private`, `no-store` and `no-cache` directives even
when `X-User-Logged-In` is zero. Its current shared cache only applies to
`projet.lesecologistes.fr`.

## Deployment

- Deploy the PHP code, migrations `Version20261009120000` and `Version20261009180000`, GraphQL cache and both
  Nginx/Varnish configuration changes together. Reload those services. A PHP-only
  deployment leaves the static-file bypass open.
- Every media-serving origin, including an assets host, must use this application
  authorization path. Disable CDN caching for `/media/` and purge existing copies
  on every cache in front of the origin before declaring the exposure resolved.
- Purge previously cached GraphQL responses when deploying the remote Varnish
  change. Reloading a VCL does not remove objects already stored by the old policy.
- After enabling enforcement, verify an anonymous request to a known confidential original, cached thumbnail
  and image-generation URL is denied, then verify owner access and a public image.
- No file relocation or deletion is needed. Files without a registered media
  record now return 404. Existing downloaded or browser-cached copies cannot be
  recalled by this change.

## Verification

Run the [production Nginx routing tests](../infrastructure/services/remote/nginx/README.md)
to verify that media extensions reach PHP, application responses are preserved and
static assets retain their cache policy. These tests use real Nginx/PHP-FPM with a
synthetic handler; the Symfony tests below cover application permissions.

Run `tests/GraphQL/Resolver/ResponsePrivacyTest.php`,
`tests/GraphQL/Resolver/Questionnaire/QuestionnaireCacheHeadersTest.php`,
`tests/Controller/Site/MediaPrivacyTest.php` and
`tests/Controller/Site/MediaResponseDownloadTest.php` through container PHPUnit.
Run `varnishtest infrastructure/services/remote/varnish/privacy.vtc` in a container
with Varnish and its `cookie` and `bodyaccess` VMODs. This isolated test includes
the actual remote VCL and verifies private delivery alongside public cache hits.

## Consequences

Media reads now reach PHP and the database; this trades static-serving throughput
and shared HTTP caching for an authorization check on every request. Liip's disk
cache still avoids regenerating thumbnails. Validate capacity before production
rollout. A future storage redesign can separate public and confidential uploads,
but must preserve permission checks and revoke old public paths.
