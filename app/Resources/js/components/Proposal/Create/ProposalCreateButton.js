// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';
import {createFragmentContainer, graphql} from "react-relay";

type Props = {
  handleClick: Function,
  disabled: boolean,
  proposalForm: {}
};

export class ProposalCreateButton extends React.Component<Props> {
  render() {
    const { disabled, handleClick, proposalForm } = this.props;
    return (
      <LoginOverlay>
        <Button
          id="add-proposal"
          disabled={disabled}
          bsStyle="primary"
          onClick={disabled ? null : handleClick}>
          <i className="cap cap-add-1" />
          <FormattedMessage id={proposalForm.isProposal ? "proposal.add" : " submit-a-question"} />
        </Button>
      </LoginOverlay>
    );
  }
}

export default createFragmentContainer(ProposalCreateButton, {
  proposalForm: graphql`
    fragment ProposalCreateButton_proposalForm on ProposalForm {
      id
      isProposal
    }
  `,
});
