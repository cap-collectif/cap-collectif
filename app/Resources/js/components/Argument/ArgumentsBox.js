// @flow
import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';
import UnpublishedArgumentListRenderer from './UnpublishedArgumentListRenderer';
import ArgumentList from './ArgumentList';
import ArgumentCreate from './Creation/ArgumentCreate';
import type { ArgumentsBox_opinion } from '~relay/ArgumentsBox_opinion.graphql';
import type { ArgumentType } from '../../types';

type Props = {
  opinion: ArgumentsBox_opinion,
};

const Switcher: StyledComponent<{}, {}, Col> = styled(Col)`
  display: none;
  @media (max-width: 991px) {
    display: flex;
  }
  margin-bottom: 15px;
  width: 100%;
  button {
    width: 50%;
  }
`;

export const ArgumentsBox = ({ opinion }: Props) => {
  const [order, setOrder] = useState<Array<ArgumentType>>(['FOR', 'AGAINST']);

  const renderArgumentsForType = (type: ArgumentType) => {
    const argumentable = opinion;
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

  const renderSwitcher = () => (
    <Switcher sm={12} id="arguments-view-switcher" className="btn-group" role="group">
      <Button
        bsStyle="default"
        active={order[0] === 'FOR'}
        role="checkbox"
        aria-checked={order[0] === 'FOR'}
        onClick={() => {
          setOrder(['FOR', 'AGAINST']);
        }}>
        <FormattedMessage id="argument.show.type.for" />
      </Button>
      <Button
        bsStyle="default"
        active={order[0] === 'AGAINST'}
        role="checkbox"
        aria-checked={order[0] === 'AGAINST'}
        onClick={() => {
          setOrder(['AGAINST', 'FOR']);
        }}>
        <FormattedMessage id="argument.show.type.against" />
      </Button>
    </Switcher>
  );

  if (!opinion.section) {
    return null;
  }
  const { commentSystem } = opinion.section;
  if (commentSystem === COMMENT_SYSTEM_BOTH) {
    return (
      <Row>
        {renderSwitcher()}
        <Col sm={12} md={6}>
          {renderArgumentsForType(order[0])}
        </Col>
        <Col sm={12} md={6}>
          {renderArgumentsForType(order[1])}
        </Col>
      </Row>
    );
  }

  if (commentSystem === COMMENT_SYSTEM_SIMPLE) {
    return renderArgumentsForType('SIMPLE');
  }

  return null;
};

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
