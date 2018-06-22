// @flow
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import OpinionPreview from '../OpinionPreview';

type Props = { link: Object };

class OpinionLink extends React.Component<Props> {
  render() {
    const { link } = this.props;
    const classes = classNames({
      opinion: true,
      'block--bordered': true,
      'bg-vip': link.author && link.author.vip,
    });

    return (
      <li className={classes}>
        <Row>
          <Col xs={12}>
            <OpinionPreview rankingThreshold={null} opinion={link} showTypeLabel />
          </Col>
        </Row>
      </li>
    );
  }
}

export default OpinionLink;
