import * as React from 'react'
import { Alert } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import type { ProposalPageAlert_proposal } from '~relay/ProposalPageAlert_proposal.graphql'
import { getContributionObjectTypeTranslationKey } from '@shared/constants/proposalStepObjectType'

type Props = {
  proposal: ProposalPageAlert_proposal
}
export class ProposalPageAlert extends React.Component<Props> {
  render() {
    const { proposal } = this.props

    if (proposal.publicationStatus === 'TRASHED') {
      return (
        <Alert
          bsStyle="warning"
          style={{
            marginBottom: '0',
            textAlign: 'center',
          }}
        >
          <strong>
            <FormattedMessage
              id={`front.contribution.${getContributionObjectTypeTranslationKey(proposal.form?.objectType)}.trashed.label`}
            />
          </strong>
          {proposal.trashedReason && (
            <span>
              {' '}
              <FormattedMessage
                id="proposal.trashed.motive"
                values={{
                  motive: proposal.trashedReason,
                }}
              />
            </span>
          )}
        </Alert>
      )
    }

    return null
  }
}
export default createFragmentContainer(ProposalPageAlert, {
  proposal: graphql`
    fragment ProposalPageAlert_proposal on Proposal {
      publicationStatus
      trashedReason
      form {
        objectType
      }
    }
  `,
})
