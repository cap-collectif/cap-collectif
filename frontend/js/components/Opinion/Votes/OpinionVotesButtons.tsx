import React from 'react'
import { ButtonToolbar } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'

import styled from 'styled-components'
import OpinionVotesButton from './OpinionVotesButton'
import type { OpinionVotesButtons_opinion } from '~relay/OpinionVotesButtons_opinion.graphql'

export const ButtonToolbarContainer = styled(ButtonToolbar)`
  margin-left: 10px;
  @media (max-width: 374px) {
    i {
      display: none;
    }
  }
`
type Props = {
  opinion: OpinionVotesButtons_opinion
}

class OpinionVotesButtons extends React.Component<Props> {
  render() {
    const { opinion } = this.props
    return (
      <ButtonToolbarContainer className="opinion__votes__buttons">
        {/* @ts-expect-error */}
        <OpinionVotesButton opinion={opinion} value="YES" />
        {/* @ts-expect-error */}
        <OpinionVotesButton
          style={{
            marginLeft: 5,
          }}
          opinion={opinion}
          value="MITIGE"
        />
        {/* @ts-expect-error */}
        <OpinionVotesButton
          style={{
            marginLeft: 5,
          }}
          opinion={opinion}
          value="NO"
        />
      </ButtonToolbarContainer>
    )
  }
}

export default createFragmentContainer(OpinionVotesButtons, {
  opinion: graphql`
    fragment OpinionVotesButtons_opinion on OpinionOrVersion
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionVotesButton_opinion @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
})
