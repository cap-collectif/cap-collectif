// @flow
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionVotesButton from './OpinionVotesButton';
import type { OpinionVotesButtons_opinion } from './__generated/OpinionVotesButtons_opinion.graphql';

type Props = {
  opinion: OpinionVotesButtons_opinion,
  show: boolean,
  disabled: boolean,
};

class OpinionVotesButtons extends React.Component<Props> {

  render() {
    const { opinion, disabled, show } = this.props;
    if (!show) {
      return null;
    }
    return (
      <ButtonToolbar className="opinion__votes__buttons">
        <OpinionVotesButton disabled={disabled} opinion={opinion} value={1} />
        <OpinionVotesButton
          disabled={disabled}
          style={{ marginLeft: 5 }}
          opinion={opinion}
          value={0}
        />
        <OpinionVotesButton
          disabled={disabled}
          style={{ marginLeft: 5 }}
          opinion={opinion}
          value={-1}
        />
      </ButtonToolbar>
    );
  }
}

export default createFragmentContainer(OpinionVotesButtons, {
  opinion: graphql`
    fragment OpinionVotesButtons_opinion on OpinionOrVersion {
      ...OpinionVotesButton_opinion
    }
  `,
});