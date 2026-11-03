# Restricted platform navigation

Administrators and super-administrators can enable `shield_authorization_controls` under
**Features → Other**. It makes the restriction switch available in the shield
settings and the authorized-user role available in account profiles. The feature
is off by default.

The restriction applies when `shield_authorization_controls`, `shield_mode` and
`shield_authorized_users_only` are all enabled. Turning off the feature suspends
the restriction and preserves both the switch setting and assigned roles.
While the feature is off, the internal mutations `createUser`, `updateUser` and
`updateUserAccount` reject changes to the shield role. Other profile fields remain editable.

Administrators can grant or revoke `ROLE_SHIELD_AUTHORIZED_USER` in the user account
role selector, including the account tab in the Next.js user administration page.
The user list displays the translated role label. `ROLE_ADMIN` inherits it and `ROLE_SUPER_ADMIN` inherits it through
`ROLE_ADMIN`. The label is `roles.shield_authorized_user`.

## Navigation behavior

Anonymous visitors keep the existing shield login and registration experience.
When role restriction is enabled, authenticated users without the role see the
shield with an access-denied message and a logout link. Authorized users continue
to the platform, subject to the existing content permissions. With role restriction
disabled, any authenticated user passes the shield as before.

Password recovery remains available with the shield enabled. Its pages hide the
main navigation menu while the shield is active. Resetting a password preserves
the user's roles, so it does not grant access to an unauthorized account.

Symfony checks the authenticated user's roles and their hierarchy in a private
method of `ShieldListener`, relying on the standard Symfony user-provider refresh
instead of querying the database again.
Next.js uses `viewerSession.isShieldAuthorizedUser` in its existing `MainLayout` shield
check, together with the three feature flags. This role-based boolean is serialized
from the user alongside `isAdmin` and `isSuperAdmin`.
The shared shield component renders either the existing login UI or the refusal.
Symfony refreshes roles on the next authenticated request. Next.js reads the stored
session snapshot before its GraphQL request, so role changes follow the same refresh
behavior as `isAdmin` and `isSuperAdmin`. An already rendered layout retains its
viewer data until refreshed.

## Scope

This is a navigation restriction, not a data-confidentiality boundary. GraphQL and
the existing shield exceptions remain accessible with their existing permissions.
Existing media exceptions are retained. Attachment download routes without a
shield exception are blocked for users denied navigation. No GraphQL operation
filter, additional access endpoint, Next.js access middleware or Varnish change is
introduced. Public data may still be read directly through the API.

## Validation

The API Jest tests `FeatureToggle/shieldAuthorizedUsersOnly.js` and
`User/platformAccessRole.js` under `features/graphql-api/internal/Mutation` check
flag persistence and role assignment permissions. `PlatformAccessTest` exercises
shield navigation, role revocation, logout and unchanged API access over HTTP.

## French interface translations

Translations are maintained in Loco and downloaded with `yarn trad`.
The role keys deliberately follow the existing `roles.*` naming style.

| Key | French text |
| --- | --- |
| `roles.shield_authorized_user` | Utilisateur autorisé |
| `roles.shield_authorized_user_help` | Permet d’accéder à la plateforme lorsque le bouclier est limité aux utilisateurs autorisés |
| `admin.features.restrict-platform-access` | Limiter l’accès aux utilisateurs autorisés |
| `admin.features.restrict-platform-access-help` | Seuls les utilisateurs ayant le rôle “Utilisateur autorisé” peuvent accéder à la plateforme. Les administrateurs sont automatiquement autorisés. |
