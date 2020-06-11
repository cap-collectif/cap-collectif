// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';

export const ContentContributionContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  animation: blink 0.6s linear infinite alternate;

  .text-row {
    margin-top: 0 !important;
    width: 125px !important;
    border-radius: 20px;

    &:first-of-type {
      margin-right: 30px;
    }

    &:last-of-type {
      opacity: 0.15;
    }
  }

  @keyframes blink {
    from {
      opacity: 0.4;
    }
    to {
      opacity: 1;
    }
  }
`;

const Content = () => (
  <ContentContributionContainer>
    <TextRow color={colors.borderColor} />
    <TextRow color="#3b88fd" />
  </ContentContributionContainer>
);

export default Content;
