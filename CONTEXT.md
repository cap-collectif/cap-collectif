# Account Anonymization

This context defines the language used when a registered user asks for their identity to be erased while their participation content may remain available.

## Language

**Account anonymization**:
The irreversible removal of identifying and personal data from a user account while retaining an anonymous author identity and leaving its associated content unchanged.
_Avoid_: Soft deletion, content anonymization

**Associated content**:
Participation material attributed to a user account, including contributions, votes, comments, reports, events, answers, and attached media, regardless of publication or visibility state. It remains unchanged during account anonymization, including when it contains personal or sensitive information voluntarily supplied by its author.
_Avoid_: Profile data, account data

**Account anonymization with content erasure**:
Account anonymization combined with removal of associated content, either by deleting records or replacing their content when structural integrity requires the records to remain.
_Avoid_: Hard deletion, complete account deletion

## Example dialogue

> **Product:** The user chose account anonymization. Will their proposal remain visible?
>
> **Developer:** Yes. The proposal remains unchanged and is attributed to the anonymized account.
>
> **Product:** What if they choose account anonymization with content erasure?
>
> **Developer:** Their account is anonymized and the proposal content is erased, although a structural placeholder may remain.
