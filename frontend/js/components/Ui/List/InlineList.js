// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';

type Props = {
  margin: boolean,
  children: ?React.Node,
  className?: string,
  separator?: string,
};

const Container: StyledComponent<{}, {}, HTMLUListElement> = styled.ul.attrs({
  className: 'inline-list',
})`
  padding: 0;
  margin: ${props => (props.margin === true ? '0 0 10px' : '0')};

  li {
    display: inline-block;
    margin-right: ${props => (props.separator ? '0' : '5px')};

    &:after {
      content: ${props => (props.separator ? `'${props.separator}'` : '')};
      padding: 0 5px;
    }

    &:last-child {
      margin-right: 0;

      &::after {
        content: '';
        padding: 0;
      }
    }
  }
`;

export const InlineList = ({ children, margin, className, separator }: Props) => (
  <Container className={className} margin={margin} separator={separator}>
    {children}
  </Container>
);

InlineList.defaultProps = {
  margin: true,
};

export default InlineList;
