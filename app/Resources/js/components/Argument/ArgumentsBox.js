import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import {
  COMMENT_SYSTEM_SIMPLE,
  COMMENT_SYSTEM_BOTH,
} from '../../constants/ArgumentConstants';
import ArgumentList from './ArgumentList';
import ArgumentCreate from './Creation/ArgumentCreate';

const ArgumentsBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getCommentSystem() {
    const { opinion } = this.props;
    return opinion.parent
      ? opinion.parent.type.commentSystem
      : opinion.type.commentSystem;
  },

  renderArgumentsForType(type) {
    return (
      <div id={`arguments-col--${type}`}>
        <div className="opinion opinion--add-argument block block--bordered">
          <ArgumentCreate
            form={`create-argument-${type}`}
            type={type}
            {...this.props}
          />
        </div>
        <ArgumentList type={type} {...this.props} />
      </div>
    );
  },

  render() {
    if (this.getCommentSystem() === COMMENT_SYSTEM_BOTH) {
      return (
        <Row>
          <Col sm={12} md={6}>
            {this.renderArgumentsForType('yes')}
          </Col>
          <Col sm={12} md={6}>
            {this.renderArgumentsForType('no')}
          </Col>
        </Row>
      );
    }

    if (this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE) {
      return this.renderArgumentsForType('simple');
    }

    return null;
  },
});

export default ArgumentsBox;
