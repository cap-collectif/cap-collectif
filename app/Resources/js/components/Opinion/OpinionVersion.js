// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import OpinionPreview from './OpinionPreview';
import VotePiechart from '../Utils/VotePiechart';
import type { OpinionVersion_version } from './__generated__/OpinionVersion_version.graphql';

type Props = {
  version: OpinionVersion_version,
  rankingThreshold: ?number,
};

class OpinionVersion extends React.Component<Props> {
  render() {
    const { version, rankingThreshold } = this.props;
    return (
      <ListGroupItem
        className={`list-group-item__opinion has-chart${
          version.author && version.author.vip ? ' bg-vip' : ''
        }`}>
        <div className="left-block">
          {/* $FlowFixMe */}
          <OpinionPreview opinion={version} rankingThreshold={rankingThreshold} />
        </div>
        {version.votes && version.votes.totalCount > 0 ? (
          /* $FlowFixMe */
          <VotePiechart
            top={10}
            height="90px"
            width="145px"
            ok={version.votesOk.totalCount}
            nok={version.votesNok.totalCount}
            mitige={version.votesMitige.totalCount}
          />
        ) : null}
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(OpinionVersion, {
  version: graphql`
    fragment OpinionVersion_version on Version {
      ...OpinionPreview_opinion
      author {
        vip
      }
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
    }
  `,
});
