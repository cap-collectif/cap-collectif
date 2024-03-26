import * as React from 'react'
import { connect } from 'react-redux'
import type { IntlShape } from 'react-intl'
import { formValueSelector, reduxForm, submit, reset } from 'redux-form'
import type { Dispatch, GlobalState } from '~/types'
import ModalAddDomain from './ModalAddDomain'
import ModalDNSSupplier from './ModalDNSSupplier'
import ModalDNSRegistration from './ModalDNSRegistration'
import ModalSteps from '~ds/ModalSteps/ModalSteps'
import Button from '~ds/Button/Button'
import type { SenderEmailDomainService } from '~relay/CreateSenderEmailDomainMutation.graphql'
import CreateSenderEmailDomainMutation from '~/mutations/CreateSenderEmailDomainMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { toast } from '~ds/Toast'
const formName = 'form-add-domain'
const DKIM_MAILJET =
  'k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6ZpmF5FNfV5KCMimzMVIu4zhML9DNgW9UjHc2udnzfipVCgXPP4OkKab/fxNSEXhceKLNMTLIgZD6RQWcm+5HEWTvaY5SazMjo4D3phQA/uIf22JxuTsEgLMXdSBgYHooHiwFIDBVBF6dKXNIqORtJtccsMCa0dYdgnForzaF3wIDAQAB'
const DKIM_MANDRILL =
  'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrLHiExVd55zd/IQ/J/mRwSRMAocV/hMB3jXwaHH36d9NaVynQFYV8NaWi69c1veUtRzGt7yAioXqLj7Z4TeEUoOLgrKsn8YnckGs9i3B3tVFB+Ch/4mPhXWiNfNdynHWBcPcbJ8kjEQ2U8y78dHZj1YeRXXVvWob2OaKynO8/lQIDAQAB;'
type BeforeProps = {
  intl: IntlShape
}
type Props = BeforeProps & {
  dispatch: Dispatch
  domain: string
  service: SenderEmailDomainService
}
type Values = {
  readonly domain: string
  readonly 'domain-service': SenderEmailDomainService
}

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  const input = {
    service: values['domain-service'].toUpperCase() as any as SenderEmailDomainService,
    value: values.domain,
  }
  return CreateSenderEmailDomainMutation.commit({
    input,
  })
    .then(response => {
      dispatch(reset(formName))

      if (response.createSenderEmailDomain?.errorCode) {
        mutationErrorToast(props.intl)
      } else {
        toast({
          variant: 'success',
          content: props.intl.formatMessage({
            id: 'domain-successfully-added',
          }),
        })
      }
    })
    .catch(() => {
      dispatch(reset(formName))
      mutationErrorToast(props.intl)
    })
}

const ModalsAddDomain = ({ dispatch, domain, service, intl }: Props): JSX.Element => {
  return (
    <ModalSteps
      ariaLabel={intl.formatMessage({
        id: 'authentication-sender-domains',
      })}
      disclosure={
        <Button variant="secondary" variantColor="primary" variantSize="small" alignSelf="flex-start">
          {intl.formatMessage({
            id: 'add-a-domain',
          })}
        </Button>
      }
      onClose={() => {
        dispatch(reset(formName))
      }}
    >
      {({ hide }) => (
        <>
          <ModalSteps.Header>
            <ModalSteps.Header.Label>
              {intl.formatMessage({
                id: 'authentication-sender-domains',
              })}
            </ModalSteps.Header.Label>
          </ModalSteps.Header>
          <ModalSteps.ProgressBar />

          <ModalSteps.Body>
            <ModalAddDomain
              id="add-domain"
              label={intl.formatMessage({
                id: 'add-a-domain',
              })}
              validationLabel={intl.formatMessage({
                id: 'dns-supplier',
              })}
              dispatch={dispatch}
            />
            <ModalDNSSupplier
              id="dns-supplier"
              label={intl.formatMessage({
                id: 'dns-supplier',
              })}
              validationLabel={intl.formatMessage({
                id: 'dns-registration',
              })}
            />
            <ModalDNSRegistration
              id="dns-registration"
              label={intl.formatMessage({
                id: 'update-dns-registration',
              })}
              validationLabel={intl.formatMessage({
                id: 'global.validate',
              })}
              dkim={{
                subDomain: domain
                  ? service === 'MAILJET'
                    ? `mailjet._domainkey.${domain}`
                    : `mandrill._domainkey.${domain}`
                  : '',
                value: service === 'MAILJET' ? DKIM_MAILJET : DKIM_MANDRILL,
              }}
            />
          </ModalSteps.Body>

          <ModalSteps.Footer>
            <ModalSteps.Footer.BackButton />
            <ModalSteps.Footer.ContinueButton disabled={!domain} />
            <ModalSteps.Footer.ValidationButton
              onClick={() => {
                dispatch(submit(formName))
                hide()
              }}
            />
          </ModalSteps.Footer>
        </>
      )}
    </ModalSteps>
  )
}

const ModalsAddDomainForm = reduxForm({
  form: formName,
  onSubmit,
})(ModalsAddDomain) as React.AbstractComponent<{}>

const mapStateToProps = (state: GlobalState) => {
  const formSelector = formValueSelector(formName)
  const domain = formSelector(state, 'domain')
  const service = formSelector(state, 'domain-service')
  return {
    initialValues: {
      'domain-service': 'MANDRILL',
    },
    domain,
    service,
  }
}

const ModalsAddDomainFormConnected = connect(mapStateToProps)(
  ModalsAddDomainForm,
) as React.AbstractComponent<BeforeProps>
export default ModalsAddDomainFormConnected
