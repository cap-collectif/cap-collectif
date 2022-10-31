// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/styles/modules/colors';

export const QuestionnaireFooterContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-top: 22px;

  .wysiwyg-render {
    color: ${colors['neutral-gray']['900']};
    font-size: 18px;
    line-height: 24px;
  }
`;
