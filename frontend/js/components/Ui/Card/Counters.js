// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../utils/colors';

const Counters: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'card__counters small',
})`
  padding: 5px;
  background-color: ${colors.pageBgc};
  border-top: 1px solid ${colors.borderColor};
  text-align: center;
  display: flex;

  .card__counters {
    &__item {
      flex: 1;

      &:not(:first-child) {
        border-left: 1px solid ${colors.borderColor};
      }
    }

    &__value {
      font-size: 18px;
    }
  }
`;

export default Counters;
