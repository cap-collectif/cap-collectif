import styled from 'styled-components'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'

export const FieldContainer = styled.div`
  display: flex;

  .btn-group {
    margin-right: 20px;
  }

  .form-group {
    margin: 0;
  }

  .input-group-addon {
    border-radius: 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0;
  }
`
export const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 15px;
  font-weight: 600;

  p {
    margin: 0;
  }
`
