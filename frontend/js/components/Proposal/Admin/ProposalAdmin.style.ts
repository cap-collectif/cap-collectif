import styled from 'styled-components'
import { MAIN_BORDER_RADIUS, MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import colors, { styleGuideColors } from '~/utils/colors'

export const Container = styled.div`
  background: ${colors.white};
  ${MAIN_BORDER_RADIUS};
  padding: 25px;
  margin-bottom: 25px;

  h3 {
    font-size: 18px;
    color: ${styleGuideColors.blue800};
    font-weight: 600;
    margin: 0;
    margin-right: 10px;
  }

  h3 + span {
    color: rgba(0, 0, 0, 0.6) !important;
    border-radius: ${MAIN_BORDER_RADIUS_SIZE} !important;
  }

  > div:first-child {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }
`
