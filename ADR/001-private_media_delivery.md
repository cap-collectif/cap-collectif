# ADR 001 - Authorize media delivery before serving files

## Status

Accepted, 9 October 2026.

## Context

Questionnaire attachments shared the public media directory with avatars and site
illustrations. Authorizing GraphQL responses and the download route did not protect
an original file or a cached thumbnail when its URL was known. Forms could also
reuse an inaccessible attachment as a public illustration.

## Decision

Keep existing file paths and URLs. Nginx sends every `/media/` request to Symfony,
including existing thumbnails and image-generation requests. The application
requires a registered media record and checks answer permissions before serving
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
Cropping remains administrator-only. GraphQL media fields also check access, including
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
- Verify an anonymous request to a known confidential original, cached thumbnail
  and image-generation URL is denied, then verify owner access and a public image.
- No file relocation or deletion is needed. Files without a registered media
  record now return 404. Existing downloaded or browser-cached copies cannot be
  recalled by this change.

## Verification

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
