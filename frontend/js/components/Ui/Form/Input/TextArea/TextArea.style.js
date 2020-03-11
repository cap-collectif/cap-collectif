// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const TextAreaContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'textarea-container',
})`
  textarea {
    width: 100%;
    height: 100px;
    padding: 6px 12px;
    border-radius: 4px;
    background-color: #fafafa;
    border: 1px solid ${colors.lightGray};
    box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.18);
    resize: vertical;

    &:disabled {
      background-color: #eee;
    }
  }
`;

export default TextAreaContainer;
