// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';
import colors from '~/utils/colors';

export const Container: StyledComponent<
  { selected?: boolean },
  {},
  typeof PickableList.Row,
> = styled(PickableList.Row)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  background-color: ${props => (props.selected ? '#ECF5FF' : '#fff')};

  .pickableList-row-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-avatar {
    margin-right: 0;
  }
`;

export const UsernameContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    font-size: 16px;
    color: ${colors.lightBlue};
  }

  .icon {
    margin-left: 8px;
  }
`;

export const NameContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 6px;

  .separator {
    margin: 0 5px;
  }
`;

export const ParticipantInfo: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  .inline-list {
    color: ${colors.darkGray};
    margin: 6px 0 0 0;

    button {
      border: none;
      padding: 0;
      margin: 0;
      background: none;
    }

    span {
      vertical-align: middle;
    }
  }

  .icon {
    margin-right: 4px;
  }
`;
