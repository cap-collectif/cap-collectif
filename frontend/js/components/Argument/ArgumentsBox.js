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
  padding: 15px 15px 15px 15px;
  z-index: 2;
  top: 50px;
  background: #f6f6f6;
  width: 100%;
  button {
    width: 50%;
  }
  position: sticky;
  position: -webkit-sticky;
`;

const ArgumentsCol: StyledComponent<{ hide: boolean }, {}, Col> = styled(Col)`
  @media (max-width: 991px) {
    display: ${props => props.hide && 'none'};
  }
`;

const scrollToListTop = () => {
  const top = document.getElementById('argument-list-top-scroll');
  if (top) {
    top.scrollIntoView();
    window.scrollBy(0, -45);
  }
};

export const ArgumentsBox = ({ opinion }: Props) => {
  const [order, setOrder] = useState<ArgumentType>('FOR');

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
        active={order === 'FOR'}
        role="checkbox"
        aria-checked={order === 'FOR'}
        onClick={() => {
          setOrder('FOR');
          scrollToListTop();
        }}>
        <FormattedMessage id="argument.show.type.for" />
      </Button>
      <Button
        bsStyle="default"
        active={order === 'AGAINST'}
        role="checkbox"
        aria-checked={order === 'AGAINST'}
        onClick={() => {
          setOrder('AGAINST');
          scrollToListTop();
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
      <>
        <div id="argument-list-top-scroll" />
        <Row>
          {renderSwitcher()}
          <ArgumentsCol sm={12} md={6} hide={order === 'AGAINST'}>
            {renderArgumentsForType('FOR')}
          </ArgumentsCol>
          <ArgumentsCol sm={12} md={6} hide={order === 'FOR'}>
            {renderArgumentsForType('AGAINST')}
          </ArgumentsCol>
        </Row>
      </>
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
