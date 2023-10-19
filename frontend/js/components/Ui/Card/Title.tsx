import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

const e = React.createElement
type ContainerProps = {
  tagName: string
  children: JSX.Element | JSX.Element[] | string
}
const Container: StyledComponent<any, {}, (arg0: ContainerProps) => JSX.Element | null | string> = styled(
  ({ tagName, children, ...props }) => e(tagName, props, children),
).attrs({
  className: 'card__title',
})`
  font-size: 18px;
  line-height: 1.2;
  margin: 0;
`

const Title = ({ tagName, children }: ContainerProps) =>
  tagName ? <Container tagName={tagName}>{children}</Container> : <>{children}</>

Title.defaultProps = {
  tagName: 'h3',
}
export default Title
