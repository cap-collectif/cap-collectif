// @flow
import styled, { type StyledComponent } from 'styled-components';
import { TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
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

export const Filter: StyledComponent<{}, {}, typeof TextRow> = styled(TextRow)`
  background-color: ${colors.borderColor};
  width: 80px !important;
  height: 100% !important;
  margin-top: 0 !important;
`;

export const ContentContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background-color: #fff;
`;
