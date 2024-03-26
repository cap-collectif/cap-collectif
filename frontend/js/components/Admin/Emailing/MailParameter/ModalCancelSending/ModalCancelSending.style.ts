import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import colors from '~/utils/colors'
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style'

export const Container = styled(ModalContainer)`
  p {
    margin: 0;
  }

  .icon {
    margin-right: 5px;
  }
`
export const ButtonConfirmation = styled.button`
  padding: 8px;
  background-color: ${colors.dangerColor};
  color: #fff;
  border: none;
  margin-left: 10px;
  ${MAIN_BORDER_RADIUS};
`
