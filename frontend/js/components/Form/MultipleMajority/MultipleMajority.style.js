// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables';
import { mediaQueryMobile } from '~/utils/sizes';

export const ChoicesContainer: StyledComponent<
  { disabled: boolean, asPreview: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'multiple-majority-container',
})`
  display: flex;
  flex-direction: row;

  &:hover {
    .majority-container {
      &:hover,
      &.majority-checked,
      &.majority-disabled {
        .label-container {
          opacity: 1;
        }
      }

      .label-container {
        opacity: ${props => (props.asPreview ? 1 : 0.7)};
      }
    }
  }

  .majority-container {
    &:first-of-type {
      border-left: ${props => props.disabled && 'none'};
      border-radius: ${MAIN_BORDER_RADIUS_SIZE} 0 0 ${MAIN_BORDER_RADIUS_SIZE};
    }

    &:last-of-type {
      border-radius: 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
    text-align: center;

    .majority-container {
      &:first-of-type {
        border-left: ${props => props.disabled && 'none'};
        border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
      }

      &:last-of-type {
        border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
      }
    }
  }
`;
