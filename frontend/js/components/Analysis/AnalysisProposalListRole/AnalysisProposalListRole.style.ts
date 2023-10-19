import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { AvatarWrapper } from '~ui/List/UserAvatarList'

export const AVATAR_SIZE = 25
const AnalysisProposalListRoleContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  * {
    cursor: pointer;
  }

  .user-avatar {
    margin: 0;
  }

  svg {
    border: none;
  }

  ${
    /* sc-selector */
    AvatarWrapper
  } {
    & img,
    svg {
      border: none;
    }
  }
`
export const RoleWrapper: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  min-width: ${AVATAR_SIZE}px;

  &.role-analysts {
    min-width: 140px;
    margin-left: 30px;
  }

  &.role-supervisor {
    margin: 0 50px;
  }
`
export default AnalysisProposalListRoleContainer
