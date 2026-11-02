# Role-based shield navigation

## Context

Administrators need to reserve platform navigation for selected users during
preparation or redesign. The existing shield already asks anonymous visitors to
log in. The requirement preserves the existing GraphQL and media exceptions;
it does not require making publicly accessible data confidential.

## Decision

Extend the existing shield with `shield_authorized_users_only` and `ROLE_SHIELD_AUTHORIZED_USER`.
Require the role only when both the shield and the restriction flags are enabled.
Disabling the shield preserves the restriction setting.

Symfony applies this decision in `ShieldListener`, using the authenticated user's
roles and their hierarchy. Rely on Symfony's standard user-provider refresh; do
not add a separate database lookup for the shield. Next.js uses the serialized
`viewerSession.isShieldAuthorizedUser` boolean, following the existing `isAdmin` and
`isSuperAdmin` session model. The layout still checks both feature flags. Reuse the existing shield UI for login; authenticated users denied
navigation see a refusal and a logout link. Keep GraphQL and media permissions and
the existing shield exceptions. Do not add a separate middleware, login route,
GraphQL filter or caching policy.

## Alternatives considered

- A global HTTP/API gate: stronger confidentiality than required, with additional
  recovery exceptions, middleware and deployment complexity.
- Checks on every page: duplicates the existing centralized shield behavior.
- Fetching viewer roles in the layout GraphQL query: fresher roles, but introduces
  a second source of viewer permissions alongside the existing session fields.

## Consequences

The change remains focused on the existing shield. It does not prevent API clients
from reading data allowed by current permissions. Next.js layouts already mounted
in the browser may require a full reload after a role change. Session access data
refreshes when Symfony rewrites the session, like the existing admin fields; a
Next.js render may use the previous snapshot read before its GraphQL request. Existing caching
and deployment behavior remain unchanged.
