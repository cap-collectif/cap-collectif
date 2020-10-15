// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import cn from 'classnames';
import { sharedStyleCheckboxRadio } from '../commonCheckboxRadio';

const RadioContainer: StyledComponent<
  { hasImage: boolean, checked: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'radio-container',
})`
  ${props => sharedStyleCheckboxRadio(props.hasImage, props.checked)}
`;

export const LabelRadioButtonContainer: StyledComponent<
  { isChecked: boolean, color: ?string, colorOnHover: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs(({ isChecked }) => ({
  className: cn({ 'is-checked': isChecked }, 'label-radio-container'),
}))`
  ${({ colorOnHover, color, isChecked }) => css`
    background-color: ${isChecked ? color || '#000' : '#fff'};
    color: ${isChecked ? '#fff' : color || '#000'};
    border: ${color ? `1px solid ${color}` : '1px solid #000'};
    padding: 10px;
    border-radius: 4px;
    ${colorOnHover &&
      css`
        &:hover {
          border: 1px solid ${color ?? '#000'} !important;
          color: ${isChecked ? '#fff' : color || '#000'} !important;
        }
      `}
  `};
`;

export default RadioContainer;
