// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

const RankingLabelContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'ranking__label',
})`
  display: flex;
  flex-direction: column;
  width: 100%;

  .label__dnd {
    line-height: 1;
  }

  .description {
    font-size: 14px;
    color: ${colors.darkText};
    margin: 8px 0 0 0;
  }

  img {
    margin-top: 6px;
    border-radius: 4px;
  }

  .btn-pick-item {
    display: flex;
    background: none;
    border: none;
    color: ${colors.primaryColor};
    margin-top: 8px;
    padding: 0;

    svg {
      width: 18px;
      margin-right: 6px;
      transform: rotate(-90deg);
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .btn-pick-item {
      svg {
        transform: none;
      }
    }
  }
`;

export default RankingLabelContainer;
