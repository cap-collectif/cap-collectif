// @flow
import styled, { type StyledComponent } from 'styled-components';
import { TYPE_FORM } from '~/constants/FormConstants';
import isQuestionnaire from '~/utils/isQuestionnaire';

const LabelContainer: StyledComponent<
  { type?: string, hasImage: boolean, typeForm: $Values<typeof TYPE_FORM> },
  {},
  HTMLLabelElement,
> = styled.label.attrs({
  className: 'label-container',
})`
  font-weight: normal;
  margin: 0;
  font-size: ${({ typeForm }) => (isQuestionnaire(typeForm) ? '16px' : '14px')};
  cursor: pointer;

  & > .icon {
    flex-shrink: 0; /* allow space for width & height */
    margin-right: ${({ type, hasImage }) => (type && !hasImage ? '10px' : '0')};
  }
`;

export default LabelContainer;
