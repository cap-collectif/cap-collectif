// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import {createFragmentContainer, graphql} from "react-relay";
import LoginOverlay from '../../Utils/LoginOverlay';
import type {ProposalCreateButton_proposalForm} from "./__generated__/ProposalCreateButton_proposalForm.graphql";

type Props = {
  handleClick: Function,
  disabled: boolean,
  proposalForm: ProposalCreateButton_proposalForm
};

export class ProposalCreateButton extends React.Component<Props> {
  render() {
    const { disabled, handleClick, proposalForm } = this.props;
    const buttonTradKey = proposalForm.isProposalForm ? "proposal.add" : " submit-a-question";
    return (
      <LoginOverlay>
        <Button
          id="add-proposal"
          disabled={disabled}
          bsStyle="primary"
          onClick={disabled ? null : handleClick}>
          <i className="cap cap-add-1" />
          <FormattedMessage id={buttonTradKey} />
        </Button>
      </LoginOverlay>
    );
  }
}

export default createFragmentContainer(ProposalCreateButton, {
  proposalForm: graphql`
    fragment ProposalCreateButton_proposalForm on ProposalForm {
      id
      isProposalForm
    }
  `,
});
