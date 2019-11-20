// // @flow
import styled, { type StyledComponent } from 'styled-components';
import * as React from 'react';

type Props = {
  item: {
    isActive: boolean,
    title: string,
  },
};

export const Container: StyledComponent<{ isActive: boolean }, {}, HTMLLIElement> = styled.li`
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

class ProgressListItem extends React.Component<Props> {
  render() {
    const { item } = this.props;

    return (
      <Container isActive={item.isActive}>
        <div aria-label={item.title} />
      </Container>
    );
  }
}

export default ProgressListItem;
