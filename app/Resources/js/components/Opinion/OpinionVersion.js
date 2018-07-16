// @flow
import React from 'react';
import classNames from 'classnames';
import { Row, Col } from 'react-bootstrap';

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
      'block--bordered': true,
      'has-chart': true,
      'bg-vip': version.author && version.author.vip,
    });
    return (
      <li className={classes}>
        <Row>
          <Col xs={12} sm={8} md={9} lg={10}>
            <OpinionPreview opinion={version} rankingThreshold={rankingThreshold} />
          </Col>
          <Col sm={4} md={3} lg={2} className="hidden-xs">
            <VotePiechart
              top={10}
              height={'90px'}
              width={'145px'}
              ok={version.votesCountOk}
              nok={version.votesCountNok}
              mitige={version.votesCountMitige}
            />
          </Col>
        </Row>
      </li>
    );
  }
}

export default OpinionVersion;
