import * as React from 'react'
import { useIntl } from 'react-intl'
import { change, Field, formValueSelector } from 'redux-form'
import { useSelector } from 'react-redux'
import type { Step } from '~ds/ModalSteps/ModalSteps.context'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
import IconMandrill from '../IconMandrill.svg'
import IconMailjet from '../IconMailjet.svg'
import Flex from '~ui/Primitives/Layout/Flex'
import Radio from '~ui/Form/Input/Radio/Radio'
import AppBox from '~ui/Primitives/AppBox'
import component from '~/components/Form/Field'
import type { Dispatch, GlobalState } from '~/types'
import Label from '~ui/Form/Label/Label'
const formName = 'form-add-domain'
type Props = Step & {
  readonly dispatch: Dispatch
}

const ModalAddDomain = ({ dispatch }: Props): JSX.Element => {
  const intl = useIntl()
  const service = useSelector((state: GlobalState) => formValueSelector(formName)(state, 'domain-service'))
  return (
    <Flex direction="column" spacing={8}>
      <InfoMessage variant="warning">
        <InfoMessage.Title>
          {intl.formatMessage({
            id: 'global.prerequisite',
          })}
        </InfoMessage.Title>
        <InfoMessage.Content>
          {intl.formatMessage({
            id: 'get-access-to-customer-area-dns-supplier',
          })}
        </InfoMessage.Content>
      </InfoMessage>

      <Flex direction="column">
        <Label>
          {intl.formatMessage({
            id: 'which-kind-domain-service-added',
          })}
        </Label>

        <Flex direction="row" spacing={4}>
          <Flex
            direction="row"
            align="center"
            justify="space-between"
            px={6}
            py={8}
            border="normal"
            borderRadius="normal"
            borderColor={service === 'MANDRILL' ? 'blue.200' : 'gray.200'}
            bg={service === 'MANDRILL' ? 'blue.100' : 'white'}
            flex={1}
          >
            <Radio
              label={<AppBox as={IconMandrill} width="100px" height="30px" />}
              id="domain-service-mandrill"
              value="MANDRILL"
              name="domain-service"
              checked={service === 'MANDRILL'}
              onChange={() => dispatch(change(formName, 'domain-service', 'MANDRILL'))}
            />
          </Flex>

          <Flex
            direction="row"
            align="center"
            justify="space-between"
            px={6}
            py={8}
            border="normal"
            borderRadius="normal"
            borderColor={service === 'MAILJET' ? 'blue.200' : 'gray.200'}
            bg={service === 'MAILJET' ? 'blue.100' : 'white'}
            flex={1}
          >
            <Radio
              label={<AppBox as={IconMailjet} width="100px" height="30px" />}
              id="domain-service-mailjet"
              value="MAILJET"
              name="domain-service"
              checked={service === 'MAILJET'}
              onChange={() => dispatch(change(formName, 'domain-service', 'MAILJET'))}
            />
          </Flex>
        </Flex>
      </Flex>

      <Field
        type="text"
        label={intl.formatMessage({
          id: 'inform-domain-to-authenticate',
        })}
        id="domain"
        name="domain"
        component={component}
        placeholder="global.placeholder.domain"
      />
    </Flex>
  )
}

export default ModalAddDomain
