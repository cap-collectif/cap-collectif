// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import colors, { styleGuideColors } from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

type Props = {
  color: string,
  disabled: boolean,
  hasMajoritySelected: boolean,
  checked: boolean,
  asPreview: boolean,
  disableColors: boolean,
};

const styleDisabled = () => css`
  background-color: ${colors.disabledGray};

  .label-container {
    color: ${colors.secondGray} !important;
  }

  pointer-events: none;
`;

const styleMajorityNotSelected = (color: string) => css`
  ${styleDisabled()};
  pointer-events: initial;

  &:hover {
    background-color: ${color};

    .label-container {
      color: ${color ? '#fff' : styleGuideColors.darkGray} !important;
    }
  }
`;

const MajorityContainer: StyledComponent<Props, {}, HTMLDivElement> = styled.div.attrs({
  className: 'majority-container',
})`
  ${({ color, asPreview, hasMajoritySelected, checked, disabled, disableColors }: Props) => css`
    position: relative;
    background-color: ${disableColors && !checked ? colors.darkerGray : color ?? colors.black};
    pointer-events: ${asPreview ? 'none' : 'initial'};

    &:hover {
      cursor: pointer;

      .label-container {
        text-decoration: underline;
      }
    }

    .label-container {
      margin: 0 !important;
      color: #fff !important;
      font-size: 14px;
      text-decoration: ${checked ? 'underline' : 'none'};
      padding: ${asPreview ? '4px 24px' : '8px 24px'};
    }

    input {
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }

    ${disabled && !asPreview && !checked && styleDisabled()};
    ${hasMajoritySelected && !checked && !disabled && styleMajorityNotSelected(color)};

    ${disableColors &&
    !checked &&
    !disabled &&
    css`
      &:hover {
        background-color: ${color};
      }
    `}

    ${checked &&
    css`
      &::after {
        width: 0 !important;
      }
      & + &::after {
        width: 0 !important;
      }
    `}

    @media (max-width: ${mediaQueryMobile.maxWidth}) {
      .label-container {
        padding: 10px 24px;
        width: 100%;
      }
    }
  `}
`;

export default MajorityContainer;
