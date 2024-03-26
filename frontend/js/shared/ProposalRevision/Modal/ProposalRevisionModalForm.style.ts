import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import { pxToRem } from '~/utils/styles/mixins'
import { styleGuideColors } from '~/utils/colors'

export const ProposalRevisionList = styled.ul`
  list-style: none;
  padding: 0;
`
export const ProposalRevisionItem = styled.li`
  ${MAIN_BORDER_RADIUS};
  background: ${styleGuideColors.blue100};
  border: 1px solid ${styleGuideColors.blue200};
  position: relative;
  padding: ${pxToRem(8)};
  color: ${styleGuideColors.darkBlue};

  & + & {
    margin-top: ${pxToRem(20)};
  }
`
export const ProposalRevisionItemMetadata = styled.span`
  position: absolute;
  right: 8px;
  top: 8px;
`
