import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import * as React from 'react'

type Props = {
  children: JSX.Element | JSX.Element[] | string | null | undefined
}
export const Container: StyledComponent<any, {}, HTMLUListElement> = styled.ul`
  display: flex;
  padding: 0;
  margin: 0;
`
export class ProgressList extends React.Component<Props> {
  render() {
    const { children } = this.props
    return <Container>{children}</Container>
  }
}
export default ProgressList
