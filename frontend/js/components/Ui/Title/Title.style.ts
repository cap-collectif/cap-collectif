import * as React from 'react'

import styled from 'styled-components'

const TitleContainer = styled(({ type, children, ...props }) => React.createElement(type, props, children)).attrs({
  className: 'title',
})``
export default TitleContainer
