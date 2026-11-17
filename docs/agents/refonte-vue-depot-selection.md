# Redesign of the collect / selection step view (temporary)

> Temporary agent notes. Delete this file (and its memory pointer) once the redesign is shipped.

## Where it lives

- Routes (admin-next, App Router): `admin-next/src/app/project/[projectSlug]/test-collect/[stepSlug]/page.tsx`
  and `.../test-selection/[stepSlug]/page.tsx` (the latter reuses the collect page).
- Gated by the `new_new_vote_step` feature flag (toggled in the back office).
- Main components: `admin-next/components/FrontOffice/Steps/VoteStep/`
  - `VoteStep.tsx`: query + hero + layout
  - `VoteStepWebLayout.tsx`: body, drafts, list header (filters/views/map toggle), list, map
  - `VoteStepProposalsList.tsx`: proposals grid/list, empty state (`VoteStepEmptyList.tsx`)
  - `admin-next/components/FrontOffice/ProposalCard/ProposalCard.tsx`: proposal card
- Legacy equivalent (for parity): `frontend/js/components/Proposal/List/`.

## Private collect ("Restreint - Auteurs et administrateurs")

- Back office: step settings > Visibilité > Proposition. Stored as `CollectStep.private` (only `CollectStep` exposes it).
- The API already filters proposals to the viewer's own ones; the front only handles display:
  - anonymous viewer: `VoteStepPrivateLogin.tsx` replaces list and map
    (`proposal.private.show_login` + login button), filters header stays visible.
  - logged-in viewer: barred eye icon (`CapUIIcon.EyeClose`) with tooltip `global.private` on each card.
- Legacy also lets anonymous participants with a `participantToken` see their proposals
  (`VisibilityBox`); not handled in the new view yet.

## Checks

```bash
cd admin-next && yarn relay && yarn ts && yarn jest components/FrontOffice/Steps/VoteStep
```
