import styled from 'styled-components'
import { boxShadow } from '~/utils/colors'

const UserRepliesContainer = styled.div.attrs({
  className: 'userReplies hidden-print',
})`
  .list-group {
    margin-top: 15px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: ${boxShadow};
  }
`
export default UserRepliesContainer
