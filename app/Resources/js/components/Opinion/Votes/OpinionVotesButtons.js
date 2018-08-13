// @flow
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionVotesButton from './OpinionVotesButton';
import type { OpinionVotesButtons_opinion } from './__generated__/OpinionVotesButtons_opinion.graphql';

type Props = {
  opinion: OpinionVotesButtons_opinion,
};

class OpinionVotesButtons extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    return (
      <ButtonToolbar className="opinion__votes__buttons">
        {/* $FlowFixMe */}
        <OpinionVotesButton opinion={opinion} value="YES" />
        {/* $FlowFixMe */}
        <OpinionVotesButton style={{ marginLeft: 5 }} opinion={opinion} value="MITIGE" />
        {/* $FlowFixMe */}
        <OpinionVotesButton style={{ marginLeft: 5 }} opinion={opinion} value="NO" />
      </ButtonToolbar>
    );
  }
}

export default createFragmentContainer(OpinionVotesButtons, {
  opinion: graphql`
    fragment OpinionVotesButtons_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionVotesButton_opinion @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
