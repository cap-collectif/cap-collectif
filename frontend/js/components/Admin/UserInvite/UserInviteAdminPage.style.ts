import styled from 'styled-components'
import Modal from '~ds/Modal/Modal'
import AppBox from '~ui/Primitives/AppBox'

export const UserInviteAdminPageContainer = styled(AppBox).attrs({
  className: 'user-invite-admin-page container-fluid',
  borderRadius: 'adminSection',
  pb: 6,
})`
  background: white;
  min-height: 84vh;
  .box-header {
    margin: 30px 0 15px 0;
    padding: 0;

    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }
`
export const ModalBody = styled(Modal.Body)`
  border-top: 1px solid #dadee1;
  border-bottom: 1px solid #dadee1;
  overflow-wrap: break-word;
`
