import styled from 'styled-components'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const Container = styled.div<{
  isOpen?: boolean
  hasError?: boolean
}>`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  border: ${props => (props.hasError ? `1px solid ${colors.error}` : `1px solid ${colors.lightGray}`)};
  background-color: ${colors.formBgc};
  ${MAIN_BORDER_RADIUS};

  .head {
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: ${props => props.isOpen && `1px solid ${colors.lightGray}`};

    .toggle-container {
      align-items: center;
      flex: 1;

      label {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
      }
    }

    .label-toggler {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      padding-right: 20px;

      & > div {
        display: flex;
        flex-direction: column;
      }
    }

    .icon-illustration {
      height: 100%;
      width: 59px;
      margin-right: 20px;
    }

    label {
      margin-bottom: 0;
    }
  }
`
