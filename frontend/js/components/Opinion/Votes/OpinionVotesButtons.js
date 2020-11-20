// @flow
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import OpinionVotesButton from './OpinionVotesButton';
import type { OpinionVotesButtons_opinion } from '~relay/OpinionVotesButtons_opinion.graphql';

export const ButtonToolbarContainer: StyledComponent<{}, {}, typeof ButtonToolbar> = styled(
  ButtonToolbar,
)`
  margin-left: 10px;
  @media (max-width: 374px) {
    i {
      display: none;
    }
  }
`;

type Props = {
  opinion: OpinionVotesButtons_opinion,
};

class OpinionVotesButtons extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    return (
      <ButtonToolbarContainer className="opinion__votes__buttons">
        {/* $FlowFixMe */}
        <OpinionVotesButton opinion={opinion} value="YES" />
        {/* $FlowFixMe */}
        <OpinionVotesButton style={{ marginLeft: 5 }} opinion={opinion} value="MITIGE" />
        {/* $FlowFixMe */}
        <OpinionVotesButton style={{ marginLeft: 5 }} opinion={opinion} value="NO" />
      </ButtonToolbarContainer>
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
