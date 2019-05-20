// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';
import UnpublishedArgumentListRenderer from './UnpublishedArgumentListRenderer';
import ArgumentList from './ArgumentList';
import ArgumentCreate from './Creation/ArgumentCreate';
import type { ArgumentsBox_opinion } from '~relay/ArgumentsBox_opinion.graphql';
import type { ArgumentType } from '../../types';

type Props = {
  opinion: ArgumentsBox_opinion,
};

class ArgumentsBox extends React.Component<Props> {
  renderArgumentsForType = (type: ArgumentType) => {
    const argumentable = this.props.opinion;
    return (
      <div id={`arguments-col--${type}`}>
        <div className="opinion opinion--add-argument block block--bordered">
          <ArgumentCreate
            form={`create-argument-${type}`}
            type={type}
            argumentable={argumentable}
          />
        </div>
        <UnpublishedArgumentListRenderer type={type} argumentable={argumentable} />
        <ArgumentList type={type} argumentable={argumentable} />
      </div>
    );
  };

  render() {
    const { opinion } = this.props;
    if (!opinion.section) {
      return null;
    }
    const { commentSystem } = opinion.section;
    if (commentSystem === COMMENT_SYSTEM_BOTH) {
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

    if (commentSystem === COMMENT_SYSTEM_SIMPLE) {
      return this.renderArgumentsForType('SIMPLE');
    }

    return null;
  }
}

export default createFragmentContainer(ArgumentsBox, {
  opinion: graphql`
    fragment ArgumentsBox_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...ArgumentCreate_argumentable @arguments(isAuthenticated: $isAuthenticated)
      ...ArgumentList_argumentable
      ...UnpublishedArgumentListRenderer_argumentable
      ... on Opinion {
        section {
          commentSystem
        }
      }
      ... on Version {
        section {
          commentSystem
        }
      }
    }
  `,
});
