# ADR 001 - Participant authentication before GraphQL execution

## Status

Architecture revised to use the existing participant cookie, 6 October 2026. Implemented for reply reads, creation, update and deletion.

## Context

Resolving `participant(token: ...)` currently writes a participant ID into shared GraphQL context. Reply access then depends on sibling field execution: validating a second participant can revoke access established for the first. A set of IDs would retain this implicit authorization side effect.

## Decision

A participant token proves an anonymous participant's identity and can authorize reading any questionnaire reply they own, across questionnaires. Existing `CapcoAnonReply` cookies retain their exact-reply grants.

For reply access, the backend reads the existing `CapcoParticipant` cookie directly; no new authentication header is introduced. The cookie contains the base64-encoded participant token. The backend validates it before GraphQL execution and keeps this authenticated participant identity fixed throughout that execution. Reply authorization must not use identity changes made by resolving sibling fields. Invalid anonymous participant cookies return HTTP 401 with GraphQL error code `INVALID_PARTICIPANT_COOKIE`.

This migration is limited to replies. Proposal operations, votes, requirements and participant profile operations retain their existing token contracts for now. Their legacy token validation or context writes must not establish or replace the identity trusted by reply authorization. This decision does not claim to eliminate mutable authorization state throughout GraphQL.

Frontend and backend changes will be coordinated. The migration removes the implicit sibling-field grant rather than preserving it as a compatibility mechanism.

Reply creation, update and deletion use the same `CapcoParticipant` cookie as reply reads. Remove their participant-token arguments in the coordinated migration rather than accepting a second credential source. Creation without credentials can still create a participant; access to its returned reply is limited to that mutation payload and does not authenticate subsequent sibling fields.

Reply authorization uses authenticated user identity exclusively when a user is signed in. It ignores both `CapcoParticipant` and `CapcoAnonReply`, even if the cookies are invalid, rather than rejecting the request for their presence. The existing response subscriber clears these cookies after the request; authorization does not depend on this cleanup.

For a request without an authenticated user, an invalid `CapcoParticipant` cookie rejects the request before GraphQL execution. It must not fall back to anonymous access or reply-cookie grants. Requests without that cookie may still use the existing exact-reply cookie access path when not authenticated as a user.

The server-rendered questionnaire reply page authenticates the request through the same participant authentication service and checks the shared reply-access policy. Missing replies, invalid participant credentials and denied access retain the redirect to the questionnaire page. Existing step visibility checks and participation-workflow redirects still apply.

When no user is signed in and a `CapcoParticipant` cookie is present, reply authorization ignores all anonymous reply-cookie grants, including cookies belonging to a different participant. The participant cookie establishes the sole participant identity for reply access.

A successful anonymous reply mutation grants access to its returned reply and descendants only. This grant does not authorize sibling mutation fields and does not change the authenticated request identity. Existing request credentials continue to apply independently of the payload grant.

## Alternatives considered

- Accumulating participant IDs in context fixes overwriting but retains authorization side effects from resolving fields.
- Supplying credentials separately to protected query fields limits their scope but requires propagating authorization through descendants and changing ordinary reply reads. Request authentication preserves `node(id)` access with a stable identity.

## Consequences

Both participation-workflow modal implementations combine contribution reads and participant queries. Their reply flows use the existing cookie while retaining the existing contracts for unrelated participant fields. `UpdateParticipantMutation` and `ParticipantResolver` may still produce legacy context identity for out-of-scope consumers; reply access must not trust that state.

Participant tokens used as target selectors in authenticated mediator operations, such as `deleteParticipant`, remain unchanged.

Anonymous reply creation returns answer content before the client writes its reply cookie. Its returned reply therefore needs a payload-scoped grant rather than a shared operation grant. Existing raw and base64 participant token encodings must be accounted for during migration.

## Implementation outline

- Resolve authenticated-user identity first. Only without a signed-in user, validate the participant cookie at the existing GraphQL HTTP entry point before query execution, without replacing Symfony's security token. Pass the validated identity into execution separately from legacy resolver-written participant state.
- Route all reply reads and reply mutation ownership checks through that fixed identity. Retain existing authenticated-user permissions and the agreed cookie-only access path.
- Replace the operation-wide mutation reply grant with access limited to the returned reply and its descendants.
- Migrate reply clients and schema arguments together, including JSON and multipart requests. Keep unrelated operation contracts unchanged.
- Verify HTTP caching and existing cross-site request protections for cookie-authenticated reply reads and mutations.
- Verify field-order independence, cross-participant denial, cross-questionnaire ownership, invalid participant cookies on unsigned requests, participant-cookie/reply-cookie precedence, cookie-only compatibility, and mutation payload isolation. Include creation without credentials and authenticated-user access with stale or invalid participation cookies.

Payload grants are bound to the returned reply ID and its GraphQL response path, including aliases; they are never included in collection criteria. GraphQL responses are private and non-cacheable, including credential-free creation responses containing a new participant token. Cookie-authenticated participant requests with a cross-site Origin or fetch-site indicator are rejected before execution.
