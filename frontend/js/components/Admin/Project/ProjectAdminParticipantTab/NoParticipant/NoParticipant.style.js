// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';
import colors from '~/utils/colors';

export const Container: StyledComponent<{}, {}, typeof PickableList.Row> = styled(PickableList.Row)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${colors.darkGray};
  background: ${colors.white};
  font-size: 16px;
  padding: 60px;
  width: 100%;

  .pickableList-row-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .icon {
    margin-bottom: 15px;
  }

  p {
    max-width: 50%;
    text-align: center;
    &:first-of-type {
      font-weight: bold;
    }
  }
`;
