// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';

export const PickableContainer: StyledComponent<{}, {}, typeof PickableList> = styled(PickableList)`
  margin: 0 2rem 2rem 2rem;
`;

export const PickableHeader: StyledComponent<{}, {}, typeof PickableList.Header> = styled(
  PickableList.Header,
)`
  justify-content: flex-end;

  & > * {
    margin: 0 30px 0 0;
  }
`;
