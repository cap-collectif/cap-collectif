// @flow
import React from 'react';
import classNames from 'classnames';
import {ListGroupItem} from 'react-bootstrap';

import OpinionPreview from './OpinionPreview';
import VotePiechart from '../Utils/VotePiechart';

type Props = {
  version: Object,
  rankingThreshold: null | number,
};

class OpinionVersion extends React.Component<Props> {
  render() {
    const { rankingThreshold } = this.props;
    const version = this.props.version;
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

export default OpinionVersion;
