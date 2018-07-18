// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
<<<<<<< HEAD
import {ListGroupItem} from 'react-bootstrap';

=======
import { Row, Col } from 'react-bootstrap';
>>>>>>> More fragments and mutations
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
          <OpinionPreview opinion={version} rankingThreshold={rankingThreshold} />
        </div>
        <VotePiechart
          top={10}
          height={'90px'}
          width={'145px'}
          ok={version.votesCountOk}
          nok={version.votesCountNok}
          mitige={version.votesCountMitige}
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
      votesCountOk
      votesCountNok
      votesCountMitige
    }
  `,
});
