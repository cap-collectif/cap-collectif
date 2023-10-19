import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS, MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'

const ProposalFormAdminContainer: StyledComponent<any, {}, HTMLFormElement> = styled.form`
  .react-select__menu {
    z-index: 3;
  }
`
export const Badge = styled.div<{
  color: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color};
  width: 18px;
  height: 18px;
  border-radius: 9px;
  margin-right: 8px;
`
export const MoveStepContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  .select-move-step {
    max-width: 200px;

    .react-select__indicator-separator {
      display: none;
    }

    .react-select__placeholder,
    .react-select__indicator {
      color: ${colors.primaryColor};
    }

    .react-select__control {
      border: 1px solid ${colors.primaryColor};
    }
  }
`
export const MoveStatusContainer = styled.div<{
  hasSelectedStep: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.hasSelectedStep ? 'space-between' : 'center')};
  flex-direction: row;
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.pageBgc};
  width: ${props => (props.hasSelectedStep ? '350px' : '100%')};
  padding: ${props => (props.hasSelectedStep ? '10px 15px' : '15px')};
  ${MAIN_BORDER_RADIUS};

  .form-group {
    margin: 0;
    min-width: 57%;
  }

  .react-select__control {
    background: none;
    border: none;
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__value-container {
    padding: 0;
  }

  .react-select__single-value,
  .react-select__placeholder,
  .react-select__indicator {
    color: ${colors.primaryColor};
  }

  p {
    margin: 0;
  }
`
export const ButtonResetMoveStep: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: rgba(220, 53, 69, 0.2);
  width: 30px;
  height: 30px;
  border-radius: 15px;
`
export const DateContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;

  .form-group {
    margin: 0;
  }
`
export const CustomDateContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  margin-left: 15px;

  .input-group-addon {
    border-top-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
    border-bottom-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
  }

  .form-fields {
    max-width: 250px;
  }
`
export default ProposalFormAdminContainer
