// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import OpinionPreview from '../Opinion/OpinionPreview';
import VotePiechart from '../Utils/VotePiechart';
import type { Opinion_opinion } from './__generated__/Opinion_opinion.graphql';

type Props = {
  opinion: Opinion_opinion,
  showUpdatedDate: boolean,
};

export class Opinion extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
  };

  render() {
    const { opinion, showUpdatedDate } = this.props;
    const author = opinion.author;
    return (
      <ListGroupItem
        className={`list-group-item__opinion has-chart${author && author.vip ? ' bg-vip' : ''}`}>
        <div className="left-block">
          {/* $FlowFixMe */}
          <OpinionPreview opinion={opinion} showUpdatedDate={showUpdatedDate} />
        </div>
        {opinion.votes && opinion.votes.totalCount > 0 ? (
          /* $FlowFixMe */
          <VotePiechart
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
        url
      }
    }
  `,
);
