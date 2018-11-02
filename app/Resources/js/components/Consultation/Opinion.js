// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import OpinionPreview from '../Opinion/OpinionPreview';
import VotePiechart from '../Utils/VotePiechart';
import type { Opinion_opinion } from './__generated__/Opinion_opinion.graphql';

type Props = {
  opinion: Opinion_opinion,
};

export class Opinion extends React.Component<Props> {
  render() {
    const { opinion } = this.props;
    const author = opinion.author;
    return (
      <ListGroupItem
        className={`list-group-item__opinion has-chart${author && author.vip ? ' bg-vip' : ''}`}>
        <div className="left-block">
          {/* $FlowFixMe */}
          <OpinionPreview opinion={opinion} />
        </div>
        {opinion.votes && opinion.votes.totalCount > 0 ? (
          /* $FlowFixMe */
          <VotePiechart
            top={10}
            height="90px"
            width="145px"
            ok={opinion.votesOk.totalCount}
            nok={opinion.votesNok.totalCount}
            mitige={opinion.votesMitige.totalCount}
          />
        ) : null}
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(
  Opinion,
  graphql`
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
        displayName
        media {
          url
        }
        show_url
      }
    }
  `,
);
