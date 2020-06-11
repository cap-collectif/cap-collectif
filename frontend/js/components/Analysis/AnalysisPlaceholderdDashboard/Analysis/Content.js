// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { RoundShape } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
import { Avatar, AvatarContainer, ProgressState } from '../AnalysisPlaceholderDashboard.style';

export const ContentAnalysisContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  animation: blink 0.6s linear infinite alternate;

  @keyframes blink {
    from {
      opacity: 0.4;
    }
    to {
      opacity: 1;
    }
  }
`;

type Props = {
  isAdmin?: boolean,
};

const Content = ({ isAdmin }: Props) => (
  <ContentAnalysisContainer>
    {isAdmin && <ProgressState color={colors.borderColor} />}
    <AvatarContainer>
      <Avatar>
        <RoundShape color={colors.borderColor} />
        <RoundShape color={colors.secondGray} />
      </Avatar>
      <Avatar>
        <RoundShape color={colors.borderColor} />
        <RoundShape color={colors.secondGray} />
      </Avatar>
      <Avatar>
        <RoundShape color={colors.borderColor} />
        <RoundShape color={colors.secondGray} />
      </Avatar>
    </AvatarContainer>
  </ContentAnalysisContainer>
);

export default Content;
