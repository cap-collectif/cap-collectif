// @flow
import styled, { type StyledComponent } from 'styled-components';
import DropdownSelect from '~ui/DropdownSelect';
import { Body } from '~ui/DropdownSelect/index.style';
import colors from '~/utils/colors';
import ClearableInput from '~ui/Form/Input/ClearableInput';

export const SearchableDropdownContainer: StyledComponent<{}, {}, typeof DropdownSelect> = styled(
  DropdownSelect,
)`
  & ${/* sc-selector */ Body} {
    font-weight: 500;
  }
`;

export const MessageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px;
  text-align: center;
`;

export const Input: StyledComponent<{}, {}, typeof ClearableInput> = styled(ClearableInput)`
  & input {
    background: ${colors.white};
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;

export const ButtonReset: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  color: ${colors.primaryColor};
  border: none;
  background: none;
  padding: 10px 0 0 4px;

  &:disabled {
    color: ${colors.darkGray};
    opacity: 0.5;
  }
`;
