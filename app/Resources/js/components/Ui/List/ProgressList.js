// // @flow
import styled from 'styled-components';
import * as React from 'react';

type Props = {
  progressListItem: Array<Object>,
};

const ListElement = styled.li`
  width: 100%;
  list-style-type: none;

  &:not(:first-child) {
    margin-left: 2px;
  }

  div {
    height: 5px;
    width: 100%;
    background-color: ${props => (props.isActive ? '#088A20' : ' #acacac')};
  }
`;

class ProgressList extends React.Component<Props> {
  render() {
    const { progressListItem } = this.props;

    return (
      <ul className="d-flex p-0 m-0">
        {progressListItem.map((item, index) => (
          <ListElement key={index} isActive={item.isActive}>
            <div aria-label={item.title} />
          </ListElement>
        ))}
      </ul>
    );
  }
}

export default ProgressList;
