// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import OpinionPreview from '../Opinion/OpinionPreview';
import VotePiechart from '../Utils/VotePiechart';
import type { Opinion_opinion } from '~relay/Opinion_opinion.graphql';
import Media from '../Ui/Medias/Media/Media';

type Props = {|
  +opinion: Opinion_opinion,
  +showUpdatedDate: boolean,
|};

export class Opinion extends React.Component<Props> {
  static defaultProps = {
    showUpdatedDate: false,
  };

  render() {
    const { opinion, showUpdatedDate } = this.props;
    const { author } = opinion;
    return (
      <ListGroupItem
        className={`list-group-item__opinion opinion text-left has-chart${
          author && author.vip ? ' bg-vip' : ''
        }`}>
        <Media>
          {/* $FlowFixMe $refType */}
          <OpinionPreview opinion={opinion} showUpdatedDate={showUpdatedDate} />
        </Media>
        {opinion.votes && opinion.votes.totalCount > 0 ? (
          <div className="hidden-xs">
            {/* $FlowFixMe $refType */}
            <VotePiechart
              ok={opinion.votesOk.totalCount}
              nok={opinion.votesNok.totalCount}
              mitige={opinion.votesMitige.totalCount}
            />
          </div>
        ) : null}
      </ListGroupItem>
    );
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
        displayName
        media {
          url
        }
        url
      }
    }
  `,
});
