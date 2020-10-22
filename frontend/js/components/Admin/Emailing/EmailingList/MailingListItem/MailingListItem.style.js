// @flow
import styled, { type StyledComponent } from 'styled-components';
import PickableList from '~ui/List/PickableList';

export const Container: StyledComponent<
  { selected: boolean },
  {},
  typeof PickableList.Row,
> = styled(PickableList.Row)`
  background-color: ${props => (props.selected ? '#ECF5FF' : '#fff')};

  & > .pickableList-row-content {
    display: flex;
    flex-direction: column;
  }

  h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: bold;
  }

  .project-title {
    color: #afafaf;
    margin-bottom: 5px;
  }

  .icon {
    margin-right: 5px;
  }
`;

export const ButtonMembers: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  border: none;
  background: none;

  p {
    margin: 0;
  }
`;
