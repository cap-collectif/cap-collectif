import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export const SPACE_BETWEEN_AVATAR = 8
const UserAnalystListContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .user-analyst-list-hidden {
    margin-left: ${SPACE_BETWEEN_AVATAR}px;
  }
`
export default UserAnalystListContainer
