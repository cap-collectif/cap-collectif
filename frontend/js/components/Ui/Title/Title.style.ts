import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import type { TitleProps } from './Title'

const TitleContainer: StyledComponent<any, {}, (arg0: TitleProps) => React.ReactNode> = styled(
  ({ type, children, ...props }) => React.createElement(type, props, children),
).attrs({
  className: 'title',
})``
export default TitleContainer
