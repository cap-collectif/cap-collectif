import React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import LoginOverlay from '../../Utils/LoginOverlay'
import type { ProposalCreateButton_proposalForm } from '~relay/ProposalCreateButton_proposalForm.graphql'
import { getProposalLabelByType } from '~/utils/interpellationLabelHelper'

type Props = {
  handleClick: (...args: Array<any>) => any
  disabled: boolean
  proposalForm: ProposalCreateButton_proposalForm
  projectType: string
}
export class ProposalCreateButton extends React.Component<Props> {
  render() {
    const { disabled, handleClick, proposalForm, projectType } = this.props
    const buttonTradKey =
      proposalForm.objectType === 'ESTABLISHMENT'
        ? getProposalLabelByType(projectType, 'add-establishment')
        : proposalForm.objectType === 'PROPOSAL'
        ? getProposalLabelByType(projectType, 'add')
        : 'submit-a-question'
    return (
      <LoginOverlay>
        <button
          type="button"
          id="add-proposal"
          className="btn btn-primary"
          disabled={disabled}
          onClick={disabled ? null : handleClick}
        >
          <i className="cap cap-add-1" />
          <FormattedMessage id={buttonTradKey} />
        </button>
      </LoginOverlay>
    )
  }
}
export default createFragmentContainer(ProposalCreateButton, {
  proposalForm: graphql`
    fragment ProposalCreateButton_proposalForm on ProposalForm {
      objectType
    }
  `,
})
