import * as React from 'react'
import styled, { css } from 'styled-components'
import { ListGroupItem } from 'react-bootstrap'
import { graphql, createFragmentContainer } from 'react-relay'
import VotePiechart from '../Utils/VotePiechart'
import OpinionPreview from '../Opinion/OpinionPreview'
import type { Opinion_opinion } from '~relay/Opinion_opinion.graphql'
import { mediaQueryMobile } from '~/utils/sizes'
type Props = {
  readonly opinion: Opinion_opinion
  readonly showUpdatedDate: boolean
}
export const OpinionContainer = styled.div<{
  isFlex?: boolean
}>`
  width: 100%;
  ${({ isFlex }) =>
    isFlex &&
    css`
      display: flex;
    `}

  .mobile {
    display: none;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .mobile {
      display: block;
    }

    .web {
      display: none;
    }
  }
`
export class Opinion extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
  }

  render() {
    const { opinion, showUpdatedDate } = this.props
    const { author } = opinion
    const total = opinion.votesOk.totalCount + opinion.votesMitige.totalCount + opinion.votesNok.totalCount
    return (
      <ListGroupItem
        className={`list-group-item__opinion opinion text-left has-chart${author && author.vip ? ' bg-vip' : ''}`}
      >
        <OpinionContainer isFlex={opinion.votes && opinion.votes.totalCount > 0}>
          {/** @ts-ignore */},
          <OpinionPreview opinion={opinion} showUpdatedDate={showUpdatedDate} />
          {opinion.votes && opinion.votes.totalCount > 0 ? (
            <VotePiechart
              ok={opinion.votesOk.totalCount}
              nok={opinion.votesNok.totalCount}
              mitige={opinion.votesMitige.totalCount}
              total={total}
            />
          ) : null}
        </OpinionContainer>
      </ListGroupItem>
    )
  }
}
export default createFragmentContainer(Opinion, {
  opinion: graphql`
    fragment Opinion_opinion on Opinion {
      ...OpinionPreview_opinion
      votes(first: 0) {
        totalCount
      }
      votesOk: votes(first: 0, value: YES) {
        totalCount
      }
      votesNok: votes(first: 0, value: NO) {
        totalCount
      }
      votesMitige: votes(first: 0, value: MITIGE) {
        totalCount
      }
      author {
        vip
      }
    }
  `,
})
