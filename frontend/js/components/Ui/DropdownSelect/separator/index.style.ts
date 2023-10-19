import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'

export const Container: StyledComponent<any, {}, HTMLElement> = styled.li.attrs({
  className: 'dropdown-select-separator',
})`
  background: ${colors.pageBgc};
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: normal;
`
