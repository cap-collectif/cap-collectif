import React from 'react';
import {IntlMixin} from 'react-intl';
import OpinionPreview from '../OpinionPreview';
import {Row, Col} from 'react-bootstrap';
import classNames from 'classnames';

const OpinionLink = React.createClass({
  propTypes: {
    link: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const link = this.props.link;
    const classes = classNames({
      'opinion': true,
      'block--bordered': true,
      'bg-vip': link.author && link.author.vip,
    });

    return (
      <li className={classes} >
        <Row>
          <Col xs={12}>
            <OpinionPreview opinion={link} showTypeLabel />
          </Col>
        </Row>
      </li>
    );
  },

});

export default OpinionLink;
