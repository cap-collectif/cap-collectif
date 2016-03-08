import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';
import ArgumentList from './ArgumentList';
import ArgumentCreate from './Creation/ArgumentCreate';

const ArgumentsBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getCommentSystem() {
    return this.props.opinion.parent ? this.props.opinion.parent.type.commentSystem : this.props.opinion.type.commentSystem;
  },

  renderArgumentsForType(type) {
    return (
      <div id={'arguments-col--' + type} >
        { this.props.opinion.isContribuable
          ? <div className="opinion opinion--add-argument block block--bordered">
              <ArgumentCreate type={type} opinion={this.props.opinion}/>
            </div>
          : null
        }
        <ArgumentList type={type} {...this.props} opinion={this.props.opinion}/>
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
