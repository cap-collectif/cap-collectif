import styled from 'styled-components'
import { Box } from '@cap-collectif/ui'
import AppBox from '~ui/Primitives/AppBox'

export const QuestionnaireContainer = styled.form`
  position: relative;

  .questionnaire__description {
    margin-bottom: 32px;
  }

  hr {
    margin-top: 32px;
    margin-bottom: 32px;
  }
`
export const WrapperWithMarge = styled(AppBox)`
  padding: 32px;
`
export const WrapperWithMargeX = styled(AppBox)`
  padding-left: 32px;
  padding-right: 32px;
`
export const ButtonGroupSubmit = styled.div`
  margin-top: 22px;

  & > button {
    padding: 12px 16px;

    &:first-child {
      margin-right: 16px;
    }
  }
`
export const ReplyFormContainer = styled.div`
  background-color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding-bottom: 17px; // margin bottom of field is 15px so we add 17px to have 32px at the bottom of form
  overflow: hidden;

  & > .container-questions > div:first-of-type.box-with-marge {
    padding-top: 32px;
  }
`
export const ParticipantEmailWrapper = styled(Box)`
  padding-left: 32px;
  padding-right: 32px;

  input {
    width: 300px;
  }

  @media (max-width: 768px) {
    input {
      width: 100%;
    }
  }
`
