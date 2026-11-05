# Cap Collectif Vocabulary

This context defines terms whose meaning must remain consistent across the platform.

## Account anonymization

**Account anonymization**:
The irreversible removal of identifying and personal data from a user account while retaining an anonymous author identity and leaving its associated content unchanged.
Anonymized accounts expose the stable `global.user.anonymized` name key, translated at display
time using the Loco catalog (“Profil anonymisé” in French), with the neutral
`public/svg/anonymized-profile.svg` avatar and no public profile link. This also
applies to accounts anonymized before this display convention was introduced:
migration `Version20261020120000` replaces their stored legacy name with
`global.user.anonymized` in users, participants and anonymous debate arguments. New
anonymizations store this key directly; entity getters return the stored name.
The legacy `deleted-user` translation keeps its original meaning; the anonymized
profile label uses its own Loco entry, `global.user.anonymized`. CSV exports use the
same localized name. If the label is missing in the current locale, the French
catalog supplies the fallback.
The internal GraphQL `Contributor.isAnonymized` field exposes the domain status:
either account timestamp for users, or `anonymizedAt` for participants. UI behavior
uses this status rather than inferring it from the profile name or avatar URL.

_Avoid_: Soft deletion, content anonymization

**Associated content**:
Participation material attributed to a user account, including contributions, votes, comments, reports, events, answers, and attached media, regardless of publication or visibility state. It remains unchanged during account anonymization, including when it contains personal or sensitive information voluntarily supplied by its author.
_Avoid_: Profile data, account data

**Account anonymization with content erasure**:
Account anonymization combined with removal of associated content, either by deleting records or replacing their content when structural integrity requires the records to remain.
_Avoid_: Hard deletion, complete account deletion

**Administrative reply list**:
The reply list used by the administration interface. Access follows `ProjectVoter::VIEW` on the associated project, or `QuestionnaireVoter::EXPORT` for a standalone questionnaire: administrators, the owner and members of the owning organization.
_Avoid_: Public reply list

## Questionnaire confidentiality

**Participant token**:
A credential proving an anonymous participant's identity. A validated token can authorize reading any questionnaire reply belonging to that participant, including replies across different questionnaires. Reply authorization uses signed-in user identity exclusively when available and ignores participant and anonymous reply cookies in that case.
_Avoid_: Reply token, questionnaire token

**Questionnaire results**:
Questionnaire answer content is private, regardless of publication status or the legacy reply anonymity flag. Authorized managers can read their questionnaire results. A signed-in author can read their own replies, including drafts and incomplete participations. An anonymous participant must present a validated participant token proving ownership of the reply, or a `CapcoAnonReply` cookie identifying that exact reply. A mutation grants access only to the reply it creates or validates within its own returned payload; the grant does not extend to sibling mutation fields.
_Avoid_: Public questionnaire answers, optional result privacy

**Profile-visible replies**:
User profiles may show participation metadata (author, questionnaire title/link and date) and its count for non-private, published, non-draft, completed replies in enabled steps of projects visible to the viewer. The list and count apply the same filters before pagination. This visibility does not grant access to answer content, media, direct reply/response reads or questionnaire results. Authors and authorized managers retain their existing reply access, including drafts and incomplete replies.

**Public participation volume**:
Visible projects retain aggregate participation counts. Unfiltered project contributor counts retain public volumes, including private questionnaire participation. Contributor filters on a project with public contribution steps count the same authorized contributors as its edges, including count-only requests; questionnaire-only and inaccessible step scopes retain safe aggregate counts independent of identity filters. Anonymous debate volumes are included only in unfiltered project counts. Public counts exclude drafts, unpublished and incomplete replies; questionnaire-result list cursors, participant identities, answer content and per-question statistics are private. Profile-visible replies are the explicit exception for participation metadata and profile pagination. Public questionnaire identity filters must not reveal private participation. Preview, internal and relevant public GraphQL paths enforce the same rule; public endpoints remain available.

**Other answer content**:
Direct response identifiers grant no additional permissions. Private proposal and profile answers require their author's identity or authorized administration/analysis access. Hidden questions remain unavailable to authors without that additional permission. Proposal analysis answers require analysis access regardless of the question's privacy flag. Files retain their privacy markers after their answer is removed. Direct `/media/` delivery and internal/preview GraphQL Media fields enforce media permissions when `private_media_read_enforcement` is enabled, including for a private attachment referenced by a public cover. This operator flag is disabled by default; while disabled, known private media URLs remain readable, except for voice messages, whose HTTP delivery always requires an administrator. Enable it per instance after historical conversion has completed. Response downloads and media selection retain their existing authorization checks. See [private media delivery](ADR/001-private_media_delivery.md) for deployment requirements and [the target media specification](docs/private-media-public-copies-spec.md) for the historical split command and refusal of new public reuse. The historical command preserves public URLs, moves confidential answers to a separate private copy, and leaves the converted original public permanently. New public content must use a separate public upload.

Questionnaire result permissions require no data migration or `private_result` column. Deploy the backend with GraphQL definitions rebuilt and Symfony caches renewed. The word-cloud cache uses a new namespace, and authorization runs before cache reads. Production resolution requires targeted anonymous checks on the reported questionnaires, followed by checks of authorized participation and management flows; do not retain personal response values during verification.

## Voice messages

**Voice message**:
A standalone audio message recorded and submitted by a visitor from the homepage, with or without signing in. It can only be listened to or downloaded by administrators and is not attached to a proposal or another contribution.
_Avoid_: Voice vote, transcription

## Example dialogue

> **Product:** The user chose account anonymization. Will their proposal remain visible?
>
> **Developer:** Yes. The proposal remains unchanged and is attributed to the anonymized account.
>
> **Product:** What if they choose account anonymization with content erasure?
>
> **Developer:** Their account is anonymized and the proposal content is erased, although a structural placeholder may remain.
