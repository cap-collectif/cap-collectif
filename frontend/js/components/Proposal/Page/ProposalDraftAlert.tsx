import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { useIntl } from 'react-intl'
import { InfoMessage } from '@cap-collectif/ui'
// Waiting for flow type on DS
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import type { ProposalDraftAlert_proposal } from '~relay/ProposalDraftAlert_proposal.graphql'
type Props = AppBoxProps & {
  readonly proposal: ProposalDraftAlert_proposal | null | undefined
  readonly message?: string
}
export const ProposalDraftAlert = ({ proposal, message, ...rest }: Props) => {
  const intl = useIntl()

  if (proposal?.publicationStatus === 'DRAFT') {
    const defaultMessage = proposal.form.objectType === 'OPINION' ? 'opinion.draft.explain' : 'proposal.draft.explain'
    return (
      // TODO: Virer le css une fois le code global nette #12925
      <InfoMessage
        {...rest}
        variant="warning"
        maxWidth={950}
        ml="auto"
        mr="auto"
        width="100%"
        css={{
          p: {
            marginBottom: '0 !important',
          },
        }}
      >
        <InfoMessage.Title withIcon fontWeight={400} fontSize={message ? 14 : 1}>
          {intl.formatMessage({
            id: message || defaultMessage,
          })}
        </InfoMessage.Title>
      </InfoMessage>
    )
  }

  return null
}
export default createFragmentContainer(ProposalDraftAlert, {
  proposal: graphql`
    fragment ProposalDraftAlert_proposal on Proposal {
      publicationStatus
      form {
        objectType
      }
    }
  `,
})
