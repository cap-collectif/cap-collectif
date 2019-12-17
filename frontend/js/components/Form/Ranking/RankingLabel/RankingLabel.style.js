// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../../utils/colors';

const RankingLabelContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'ranking__label',
})`
  display: flex;
  flex-direction: column;
  width: 100%;

  .label__dnd {
    margin-bottom: 5px;
  }

  .description {
    font-size: 14px;
    color: ${colors.darkText};
    margin-bottom: 5px;
  }

  img {
    border-radius: 4px;
  }

  .btn-pick-item {
    display: flex;
    background: none;
    border: none;
    color: ${colors.primaryColor};
    margin-top: 8px;
    padding: 0;

    svg,
    path {
      width: 18px;
      margin-right: 10px;
    }
  }
`;

export default RankingLabelContainer;
