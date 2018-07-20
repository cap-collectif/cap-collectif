// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
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
    const classes = classNames({
      opinion: true,
      'has-chart': true,
      'list-group-item__opinion': true,
      'bg-vip': version.author && version.author.vip,
    });
    return (
      <ListGroupItem className={classes}>
        <div className="left-block">
          {/* $FlowFixMe */}
          <OpinionPreview opinion={version} rankingThreshold={rankingThreshold} />
        </div>
        {/* $FlowFixMe */}
        <VotePiechart
          top={10}
          height={'90px'}
          width={'145px'}
          ok={version.votesOk ? version.votesOk.totalCount : 0}
          nok={version.votesNok ? version.votesNok.totalCount : 0}
          mitige={version.votesMitige ? version.votesMitige.totalCount : 0}
        />
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
