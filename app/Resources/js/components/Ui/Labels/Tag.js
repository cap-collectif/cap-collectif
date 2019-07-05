// @flow
import * as React from 'react';
import styled from 'styled-components';

const TagContainer = styled.span`
  font-size: 14px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  border: 0;
  margin: 0;
  padding: 0 0 0 5px;
  color: inherit;

  &:focus,
  &:hover {
    text-decoration: none;
  }
`;

const TagLink = styled(TagContainer)`
  &:hover {
    cursor: pointer;
  }
`;

const TagIcon = styled.i`
  padding-right: 5px;
  font-size: ${props => props.size || '14px'};
`;

type Props = {
  size?: string,
  children: any,
  as?: string,
  icon?: string,
};

export class Tag extends React.Component<Props> {
  render() {
    const { size, children, as, icon, ...rest } = this.props;
    const Container = as === 'a' ? TagLink : TagContainer;

    return (
      <Container className="tag" as={as} {...rest}>
        {icon && <TagIcon size={size} className={icon} />}
        {children}
      </Container>
    );
  }
}

export default Tag;
