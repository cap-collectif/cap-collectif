// @flow
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionVotesButton from './OpinionVotesButton';
import type { OpinionVotesButtons_opinion } from './__generated__/OpinionVotesButtons_opinion.graphql';

type Props = {
  opinion: OpinionVotesButtons_opinion,
  show: boolean,
};

class OpinionVotesButtons extends React.Component<Props> {
  render() {
    const { opinion, show } = this.props;
    if (!show) {
      return null;
    }
    return (
      <ButtonToolbar className="opinion__votes__buttons">
        <OpinionVotesButton opinion={opinion} value="YES" />
        <OpinionVotesButton style={{ marginLeft: 5 }} opinion={opinion} value="MITIGE" />
        <OpinionVotesButton style={{ marginLeft: 5 }} opinion={opinion} value="NO" />
      </ButtonToolbar>
    );
  }
}

export default createFragmentContainer(OpinionVotesButtons, {
  opinion: graphql`
    fragment OpinionVotesButtons_opinion on OpinionOrVersion {
      ... on Opinion {
        contribuable
      }
      ... on Version {
        contribuable
      }
      ...OpinionVotesButton_opinion
    }
  `,
});
