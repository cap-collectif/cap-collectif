// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import UserAvatar from '../../User/UserAvatar';
import OpinionInfos from '../OpinionInfos';
import OpinionSourceTitle from './OpinionSourceTitle';
import OpinionSourceContent from './OpinionSourceContent';
import OpinionSourceFooter from './OpinionSourceFooter';

const OpinionSource = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },

  render() {
    const { source } = this.props;
    const classes = classNames({
      opinion: true,
      'block--bordered': true,
      'bg-vip': source.author && source.author.vip,
    });
    return (
      <li className={classes} id={`source-${source.id}`}>
        <Row>
          <Col xs={12}>
            <div className="opinion__body box">
              <UserAvatar user={source.author} className="pull-left" />
              <div className="opinion__data">
                <OpinionInfos rankingThreshold={null} opinion={source} />
                <OpinionSourceTitle source={source} />
                <OpinionSourceContent source={source} />
                <OpinionSourceFooter source={source} />
              </div>
            </div>
          </Col>
        </Row>
      </li>
    );
  },
});

export default OpinionSource;
