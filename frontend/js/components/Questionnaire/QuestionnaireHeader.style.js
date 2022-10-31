// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/styles/modules/colors';

export const QuestionnaireHeaderContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .wysiwyg-render {
    color: ${colors['neutral-gray']['900']};
    font-size: 18px;
    line-height: 24px;
  }
`;

export const Title: StyledComponent<{}, {}, HTMLHeadingElement> = styled.h2`
  font-size: 24px;
  line-height: 32px;
  color: ${colors['neutral-gray']['900']};
`;
