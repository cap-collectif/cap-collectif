// @flow
import React, { Component } from 'react';
// import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
// import { ButtonToolbar, Button } from 'react-bootstrap';
import type { ProposalAdminNewsForm_proposal } from './__generated__/ProposalAdminNewsForm_proposal.graphql';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminNewsForm_proposal,
};
type State = void;

export class ProposalAdminNewsForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    // const { proposal } = this.props;
    return <div className="box box-primary container" />;
  }
}

export default createFragmentContainer(
  ProposalAdminNewsForm,
  graphql`
    fragment ProposalAdminNewsForm_proposal on Proposal {
      id
    }
  `,
);
