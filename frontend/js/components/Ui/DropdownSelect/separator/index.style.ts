import styled from 'styled-components'
import colors from '~/utils/colors'

export const Container = styled.li.attrs({
  className: 'dropdown-select-separator',
})`
  background: ${colors.pageBgc};
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: normal;
`
