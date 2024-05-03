import * as React from 'react'

import styled from 'styled-components'

const TagsListWrapper = styled.div`
  padding: 0;
  margin: 0;
  & > * {
    margin-bottom: 4px;
  }
`
const TagsListItem = styled.div`
  & + & {
    margin-top: 1px;
  }
`
type Props = {
  children: any
  className?: string
}
export class TagsList extends React.Component<Props> {
  render() {
    const { children, ...rest } = this.props
    return (
      <TagsListWrapper className="tags-list ellipsis" {...rest}>
        {children.map((child, index) => (
          <TagsListItem key={index}>{child}</TagsListItem>
        ))}
      </TagsListWrapper>
    )
  }
}
export default TagsList
