// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';

export const TagContainer: StyledComponent<{}, {}, HTMLSpanElement> = styled.span.attrs({
  className: 'tag',
})`
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

  & > .icon,
  & > .icon-rounded {
    margin-right: 5px;
  }

  .customImage {
    margin: 0;
    padding: 0 5px 0 0;
    vertical-align: top;

    * {
      margin: 0;
      padding: 0;
    }
  }
`;

const TagLink: StyledComponent<{}, {}, HTMLSpanElement> = styled(TagContainer)`
  &:hover {
    cursor: pointer;
  }
`;

const TagIcon = styled.i`
  padding-right: 5px;
  font-size: ${props => props.size || '14px'};
`;

type Props = {|
  children: any,
  size?: string,
  as?: any,
  icon?: string,
  className?: string,
  CustomImage?: Function,
  onClick?: () => void,
  id?: string,
  href?: string,
  bsStyle?: string,
  rel?: string,
  target?: string,
  title?: string,
|};

export class Tag extends React.Component<Props> {
  render() {
    const { size, children, as, icon, CustomImage, className, ...rest } = this.props;
    const Container = as === 'a' ? TagLink : TagContainer;

    return (
      <Container className={`tag ${className || ''}`} as={as} {...rest}>
        {icon && <TagIcon size={size} className={icon} />}
        {CustomImage && React.cloneElement(CustomImage, { className: 'customImage ' })}
        {children}
      </Container>
    );
  }
}

export default Tag;
