// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

const styleDisabled = () => css`
  background-color: ${colors.disabledGray};
  border-left: 1px solid #fff;
  pointer-events: none;

  .label-container {
    color: ${colors.secondGray} !important;
  }
`;

const styleMajorityNotSelected = (color: string) => css`
  ${styleDisabled()};
  pointer-events: initial;

  &:hover {
    background-color: ${color};

    .label-container {
      color: #fff !important;
    }
  }
`;

const MajorityContainer: StyledComponent<
  {
    color: string,
    disabled: boolean,
    hasMajoritySelected: boolean,
    checked: boolean,
    asPreview: boolean,
  },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'majority-container',
})`
  background-color: ${({ color }) => color};
  pointer-events: ${({ asPreview }) => (asPreview ? 'none' : 'initial')};
  border-left: ${({ hasMajoritySelected, checked }) =>
    hasMajoritySelected && checked && '1px solid #fff'};

  &:hover {
    cursor: pointer;

    .label-container {
      font-weight: bold;
    }
  }

  .label-container {
    margin: 0 !important;
    color: #fff !important;
    font-size: 14px;
    font-weight: ${({ checked }) => (checked ? 'bold' : 600)};
    padding: ${({ asPreview }) => (asPreview ? '4px 24px' : '8px 24px')};
  }

  input {
    display: none;
  }

  ${({ disabled, asPreview, checked }) => disabled && !asPreview && !checked && styleDisabled()};
  ${({ disabled, hasMajoritySelected, checked, color }) =>
    hasMajoritySelected && !checked && !disabled && styleMajorityNotSelected(color)};

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .label-container {
      padding: 10px 24px;
    }
  }
`;

export default MajorityContainer;
