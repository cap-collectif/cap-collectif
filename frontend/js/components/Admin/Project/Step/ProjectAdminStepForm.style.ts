import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { ListGroupItem } from 'react-bootstrap'
import colors, { styleGuideColors } from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const DateContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  width: auto;
  flex-direction: row;

  @media screen and (max-width: 500px) {
    flex-direction: column;
  }

  > div {
    margin-right: 2%;
  }

  .form-fields.input-group {
    max-width: 238px;
  }
`
export const FormContainer: StyledComponent<any, {}, HTMLFormElement> = styled.form`
  .react-select__menu {
    z-index: 3;
  }

  input[name='label'] {
    max-width: 50%;
  }
`
export const CustomCodeArea: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  textarea {
    max-height: 90px;
  }
`
export const RequirementDragItem: StyledComponent<any, {}, typeof ListGroupItem> = styled(ListGroupItem)`
  display: flex;
  align-items: center;
  background: ${colors.formBgc};

  i.cap-android-menu {
    color: #aaa;
    font-size: 20px;
    margin-right: 10px;
  }

  .form-group {
    margin-bottom: 0;
  }

  li {
    margin-right: 15px;
  }

  .fcHelp {
    color: ${styleGuideColors.gray500} !important;
  }
`
export const RequirementSubItem = styled.div<{
  isHidden?: boolean
  isLast?: boolean
}>`
  display: ${props => (props.isHidden ? 'none' : 'flex')};
  align-items: center;
  background-color: #fff;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  padding: 12px 8px;

  .form-group {
    margin-bottom: 0;
  }

  label {
    margin-bottom: 0 !important;
  }

  ${props =>
    props.isLast &&
    `
    border-bottom: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
  `}
`
export const CheckboxPlaceholder: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  flex: none;
  width: 23px;
  height: 23px;
  border-radius: 4px;
  background: ${colors.iconGrayColor};
  opacity: 0.5;
  margin-right: 15px;
  padding: 2px 5px;
  color: ${colors.formBgc};
`
export const VoteFieldContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  margin-left: 41px;
  > span {
    line-height: 24px;
  }
  .vote-fields {
    margin-top: 20px;
    > div {
      flex: 1;
    }
    div + span.label-toggler {
      font-weight: bold;
    }
    input[type='number'] {
      max-width: 70px;
    }
    .toggle-container {
      .excerpt {
        width: 85%;
        display: block;
        font-weight: 400;
      }
    }

    .vote-min {
      max-width: 70px;
    }

    #step-votesMin-error {
      white-space: nowrap;
    }

    .help-block {
      font-weight: 400;
      strong {
        color: ${colors.black};
        font-weight: 600;
      }
    }

    .labelContainer {
      justify-content: space-between;
      flex: 1;
      text-align: left;
    }
  }
`
export const PrivacyContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  > span {
    font-weight: bold;
  }

  button {
    margin-top: 15px;
  }
`
export const PrivacyInfo: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;

  span {
    margin-left: 5px;
    white-space: nowrap;
  }

  span:first-child {
    margin-left: 0;
    font-weight: bold;
  }
`
export const ViewsContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  .help-block {
    margin: 16px 0;
  }

  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: ${colors.formBgc};
    border: 1px solid ${colors.lightGray};
    padding: 15px 35px;
    margin-right: 20px;
    ${MAIN_BORDER_RADIUS};
  }

  label {
    margin: 0 !important;
  }

  .icon {
    margin: 0;
  }
`
export const LabelField: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 5px;
  border-bottom: 1px solid ${colors.lightGray};

  h5 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }

  a {
    color: ${colors.blue};
  }

  span {
    vertical-align: middle;
  }
`
export const LabelView: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  span {
    margin: 10px 0;
  }

  svg {
    height: 65px;
    width: auto;
    border: 1px solid ${colors.lightGray};
    ${MAIN_BORDER_RADIUS};
  }
`
