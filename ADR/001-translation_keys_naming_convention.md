# ADR 001 - Conventions de nommage des clés de traduction

## Contexte
Afin d'assurer une cohérence dans la gestion des clés de traduction à travers l'application, il est nécessaire de définir une convention de nommage claire et structurée. Cela facilitera la maintenance, la lisibilité et l'évolutivité des traductions.

## Décision
Nous adoptons la convention de nommage suivante pour toutes les clés de traduction :

### Structure des clés
1. **Préfixe de périmètre** :
   - `front.` pour les éléments de l'interface utilisateur·ice côté frontend
   - `admin.` pour les éléments de l'interface d'administration (backoffice)
   - `global.` pour les éléments réutilisables dans tout l'application (sans préfixe de périmètre)

2. **Format des clés** :
   ```
   [périmètre].[contexte-ou-page].[element-avec-tirets]
   ```

3. **Règles de formatage** :
   - Utiliser des traits d'union (`-`) pour séparer les mots dans un même segment
   - Utiliser des points (`.`) pour séparer les différents segments de la clé
   - Écrire en minuscules
   - Utiliser l'anglais pour les noms des clés
   - Ne pas utiliser d'underscores

## Do ✅
- `global.save`
- `front.proposal.submit-button`
- `admin.user-groups.upload-button`

## Don't ❌
- `global.save_button`
- `global-save_button`
- `user-groups.upload-button`
- `user-groups-upload-button`
- `user_groups.upload_button`
etc.

## Objectif
- Meilleure organisation des clés de traduction
- Facilité de maintenance et de recherche
- Cohérence dans toute la codebase

## Statut
- Validé le 12/12/2025

## Références
- Discussion interne sur les bonnes pratiques de développement et mise en lumière du besoin d'améliorer la gestion des clés de traduction
