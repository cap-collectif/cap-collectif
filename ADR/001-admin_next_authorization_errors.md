# ADR 001 - Gestion des accès refusés dans admin-next (403 / accueil)

## Contexte

Toutes les pages `admin-next/` passent par `withPageAuthRequired` (`admin-next/utils/withPageAuthRequired.ts`),
qui vérifie côté serveur que le viewer a une session exploitable et le rôle requis avant de rendre la page.
Avant cette décision, tout refus d'accès — pas de cookie, session Redis introuvable, session sans `viewer`
JSON, aucun rôle back-office, ou rôle insuffisant pour la page précise — passait par la même fonction
(`redirectOnError`), qui :
- levait une exception en développement (`throw`), affichant un message technique brut ("Failed to parse the
  JSON part of the session...") directement à l'écran ;
- redirigeait en production/QA vers une page `/admin-next/403` qui, faute de session, retombait sur un
  fallback minimaliste (`<h1>403 - Forbidden</h1>`, sans layout ni style).

Or, une bonne partie de ces cas ne sont pas des pannes. Côté PHP, `SessionWithJsonHandler::write()`
n'écrit un JSON `viewer` en session que si un utilisateur est authentifié — une session anonyme (visiteuse
jamais connectée) atterrit donc naturellement dans le même code que "session cassée". Rien ne permet de
distinguer fiablement les deux cas à cet endroit ; une vraie panne (Redis injoignable) échouerait de toute
façon ailleurs, via une exception non catchée, avant d'atteindre ce code.

Une première itération de cette décision distinguait, en plus du cas "rôle insuffisant", deux sous-cas
d'absence d'accès back-office : viewer jamais connecté (→ accueil) vs. viewer connecté mais sans aucun rôle
BO (→ une page `/admin-next/access-denied` dédiée, au layout front-office). À l'usage, cette distinction
s'est révélée sans intérêt côté produit : dans les deux cas le viewer n'a rien à faire dans le back-office,
et le renvoyer vers l'accueil est le comportement le plus simple. La page `/admin-next/access-denied` a donc
été supprimée.

## Décision

`withPageAuthRequired` distingue désormais deux situations de refus d'accès :

- **Aucun accès back-office exploitable**, quelle qu'en soit la raison — pas de cookie, pas de session
  Redis, session sans `viewer` (anonyme ou cassée, indifféremment ; rien ne permet de distinguer fiablement
  ces cas à cet endroit), ou viewer authentifié sans aucun rôle back-office → redirection vers la page
  d'accueil publique (`/`). Le viewer retombe directement sur l'expérience publique normale, sans passer par
  une page d'erreur back-office.
- **Rôle insuffisant pour la page précise demandée, mais viewer avec un accès back-office valide par
  ailleurs** (ex : project admin sur une page réservée aux super admins) → redirection vers `/admin-next/403`
  (`pages/admin-next/403.tsx`), qui rend le layout back-office habituel (sidebar/navbar). Cette page vit sous
  `/admin-next/...` et jamais à la racine, car le reverse-proxy ne route que ces chemins vers l'app Next.js.

Les deux redirections sont systématiques, en développement comme en production — pas de `throw` en dev. Le
message technique original est conservé côté serveur (`console.error`) pour le diagnostic, mais n'est plus
affiché à l'écran.

## Alternatives considérées

- **Continuer à distinguer strictement "panne de session" (throw en dev) de "rôle insuffisant"
  (redirection)** : écarté — la plupart des cas de "panne" observés en pratique sont en réalité des sessions
  anonymes normales, donc cette distinction ne protège pas contre de vraies pannes (indétectables à cet
  endroit) et laissait le bug initial (page cassée en dev pour une simple visite anonyme) non résolu.
- **Une page `/admin-next/access-denied` dédiée (layout front-office) pour le viewer connecté sans rôle BO,
  distincte de l'accueil pour le viewer jamais connecté** : c'était la décision initiale ; écartée ensuite car cela modifiait le comportement en prod, alors que le ticket avait pour but de réparer le problème d'accès aux pages du BO sans le rôle nécessaire.
- **Une seule page `/403` à la racine avec le layout home** : écarté — le reverse-proxy ne route que
  `/admin-next/...` vers Next.js, tout le reste tombe sur Symfony.

## Conséquences

- ✅ Toute page `admin-next` protégée, visitée sans accès back-office exploitable (anonyme, session cassée,
  ou viewer sans aucun rôle BO), renvoie directement vers l'accueil public (`/`) — plus de stack trace
  technique affichée à l'écran, dev comme prod, et une seule page d'erreur back-office à maintenir
  (`/admin-next/403`).
- ⚠️ Ceci dévie du comportement Sonata (`access_control` envoyait anonyme et authentifié-sans-rôle vers le
  même template `error403.html.twig`, qui affiche un message d'erreur plutôt que de rediriger silencieusement
  vers l'accueil).
- ✅ Le message technique original reste loggé côté serveur pour le diagnostic.
- ⚠️ Toute nouvelle page `admin-next/` protégée par un rôle spécifique doit toujours avoir une entrée
  `rolesRequired` correcte dans `SideBarItems.json` pour que la restriction soit réellement appliquée (voir
  `REFONTE_SONATA.md`) — ce comportement préexistait et n'est pas modifié par cette décision.

## Statut

Validé

## Références

- `admin-next/utils/withPageAuthRequired.ts`
- `admin-next/pages/admin-next/403.tsx`
- `src/Capco/UserBundle/Security/SessionWithJsonHandler.php`
- `templates/bundles/TwigBundle/Exception/error403.html.twig`
- `REFONTE_SONATA.md`
