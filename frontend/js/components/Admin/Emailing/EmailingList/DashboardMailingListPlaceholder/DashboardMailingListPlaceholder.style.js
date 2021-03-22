// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';
import { blink } from '~/utils/styles/keyframes';

export const Header: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin: 1rem 2rem;
`;

export const PickableHeader: StyledComponent<{}, {}, typeof PickableList.Header> = styled(
  PickableList.Header,
)`
  justify-content: flex-end;
`;

export const ContentContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background-color: #fff;
`;

export const Item: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 15px;
  animation: ${blink} 0.6s linear infinite alternate;
`;
