import styled from 'styled-components'
import { MenuItem, Modal } from 'react-bootstrap'
import { mediaQueryMobile } from '~/utils/sizes'
import colors from '~/utils/colors'
import Icon from '~ds/Icon/Icon'

export const ProjectBoxContainer = styled.div<{
  color?: string | null | undefined
}>`
  border-top-color: ${({ color }) => color || '#858e95'};
`
export const ProjectBoxHeader = styled.div<{
  noBorder?: boolean
}>`
  color: ${colors.darkText};
  border-bottom: ${({ noBorder }) => !noBorder && `1px solid ${colors.lightGray};`};
  margin-bottom: ${({ noBorder }) => !noBorder && '20px;'};
  margin-top: ${({ noBorder }) => !noBorder && '15px;'};
  h4 {
    font-size: 18px;
    font-weight: bold;
  }
  h5 {
    font-size: 16px;
    font-weight: bold;
    .form-group {
      margin-bottom: 0;
    }
  }
`
export const StepModalContainer = styled(Modal).attrs({
  className: 'step__modal',
})`
  && .custom-modal-dialog {
    transform: none;
  }
`
export const NoStepsPlaceholder = styled.div`
  height: 50px;
  border: 1px solid ${colors.lightGray};
  border-radius: 4px;
  background: #fafafa;
  text-align: center;
  padding: 15px;
  color: ${colors.darkGray};
`
export const ProjectSmallFieldsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  > div {
    margin-right: 20px;
    min-width: 200px;
  }
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
  }

  .form-group {
    width: 100%;
  }

  .rdt + .input-group-addon {
    /** We want to override the green on successful date field */
    color: unset;
    background: unset;
    border-color: #d2d6de;
  }

  .rdt > input {
    z-index: 0;
  }
`
export const ProjectAccessContainer = styled.div`
  .radio label {
    font-weight: bold;
  }
`
export const ProjectSmallInput = styled.div`
  width: 200px;
`
export const StepMenuItem = styled(MenuItem)`
  a {
    /** Just overriding some bootstrap */
    padding: 5px 20px !important;
    font-weight: 600 !important;
  }
`
export const StepModalTitle = styled(Modal.Title)`
  font-weight: 600;
  font-size: 20px;
`
export const PermalinkWrapper = styled.p`
  word-break: break-all;
  margin: 0;
`
export const UpdateSlugIcon = styled(Icon)`
  cursor: pointer;
`
