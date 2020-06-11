// @flow
import styled, { type StyledComponent } from 'styled-components';
import { TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
import PickableList from '~ui/List/PickableList';

export const PickableHeader: any = styled(PickableList.Header)`
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

export const AvatarContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;

  .avatar-placeholder:nth-child(2) {
    margin: 0 50px;
  }
`;

export const Avatar: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'avatar-placeholder',
})`
  position: relative;
  padding-right: 4px;

  .round-shape {
    width: 25px !important;
    height: 25px !important;
  }

  .round-shape:last-of-type {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 10px !important;
    height: 10px !important;
  }
`;

export const ProgressState: StyledComponent<{}, {}, typeof TextRow> = styled(TextRow)`
  background-color: ${colors.borderColor};
  width: 60px !important;
  height: 25px !important;
  border-radius: 20px;
  margin-top: 0 !important;
  margin-right: 30px;
`;

export const ContentContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background-color: #fff;
`;
