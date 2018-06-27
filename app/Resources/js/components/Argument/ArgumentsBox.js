// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';
import ArgumentList from './ArgumentList';
import ArgumentCreate from './Creation/ArgumentCreate';

type Props = {
  opinion: Object,
};

class ArgumentsBox extends React.Component<Props> {
  getCommentSystem = () => {
    const { opinion } = this.props;
    return opinion.parent ? opinion.parent.type.commentSystem : opinion.type.commentSystem;
  };

  renderArgumentsForType = (type: 'FOR' | 'AGAINST' | 'SIMPLE') => {
    return (
      <div id={`arguments-col--${type}`}>
        <div className="opinion opinion--add-argument block block--bordered">
          <ArgumentCreate form={`create-argument-${type}`} type={type} {...this.props} />
        </div>
        <ArgumentList type={type} argumentable={this.props.opinion} />
      </div>
    );
  };

  render() {
    if (this.getCommentSystem() === COMMENT_SYSTEM_BOTH) {
      return (
        <Row>
          <Col sm={12} md={6}>
            {this.renderArgumentsForType('FOR')}
          </Col>
          <Col sm={12} md={6}>
            {this.renderArgumentsForType('AGAINST')}
          </Col>
        </Row>
      );
    }

    if (this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE) {
      return this.renderArgumentsForType('SIMPLE');
    }

    return null;
  }
}

export default ArgumentsBox;
