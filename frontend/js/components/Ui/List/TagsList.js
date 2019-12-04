// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';

const TagsListWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 0;
  margin: 0;
`;

const TagsListItem = styled.div`
  & + & {
    margin-top: 1px;
  }
`;

type Props = {
  children: any,
};

export class TagsList extends React.Component<Props> {
  render() {
    const { children, ...rest } = this.props;

    return (
      <TagsListWrapper className="tags-list ellipsis" {...rest}>
        {children.map((child, index) => (
          <TagsListItem key={index}>{child}</TagsListItem>
        ))}
      </TagsListWrapper>
    );
  }
}

export default TagsList;
