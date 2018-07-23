// // @flow
import styled from 'styled-components';
import * as React from "react";

type Props = {
  list: Array<Object>,
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
    background-color: ${props => props.isActive ? '#088A20' : ' #707070'}
  }
`;

class ProgressList extends React.Component<Props> {
  render() {
    const { list } = this.props;

    return (
      <ul className="d-flex p-0 m-0">
        {list.map((e, index) => (
          <ListElement key={index} isActive={e.isActive}>
            <div aria-label={e.title} />
          </ListElement>
        ))}
      </ul>
    );
  }
}

export default ProgressList;
