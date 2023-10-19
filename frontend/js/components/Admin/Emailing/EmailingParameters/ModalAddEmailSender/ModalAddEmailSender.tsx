import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import uniqBy from 'lodash/uniqBy'
import styled from 'styled-components'
import type { IntlShape } from 'react-intl'
import { Field, reduxForm, submit, reset } from 'redux-form'
import Modal from '~ds/Modal/Modal'
import Button from '~ds/Button/Button'
import Heading from '~ui/Primitives/Heading'
import component from '~/components/Form/Field'
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup'
import select from '~/components/Form/Select'
import Flex from '~ui/Primitives/Layout/Flex'
import type { ModalAddEmailSender_senderEmailDomains$key } from '~relay/ModalAddEmailSender_senderEmailDomains.graphql'
import CreateSenderEmailMutation from '~/mutations/CreateSenderEmailMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { toast } from '~ds/Toast'
import type { Dispatch } from '~/types'
const formName = 'form-email-sender'
type BeforeProps = {
  readonly senderEmailDomains: ModalAddEmailSender_senderEmailDomains$key
  readonly intl: IntlShape
  readonly initialValues: {
    'email-domain': string
  }
}
type Props = ReduxFormFormProps & BeforeProps
type Values = {
  readonly email: string
  readonly 'email-domain': string
}
const FieldContainer = styled(Flex)`
  .form-group {
    margin-bottom: 0;
  }

  .form-group:first-child {
    flex: 2;

    input {
      border-radius: 4px 0 0 4px;
    }
  }

  .form-group:last-child {
    flex: 1;

    .react-select__control {
      border-radius: 0 4px 4px 0;
      border-left: none;
      height: 34px;
      min-height: auto;
    }
  }
`
const FRAGMENT = graphql`
  fragment ModalAddEmailSender_senderEmailDomains on SenderEmailDomain @relay(plural: true) {
    value
    spfValidation
    dkimValidation
  }
`

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  return CreateSenderEmailMutation.commit({
    input: {
      locale: values.email,
      domain: values['email-domain'],
    },
  })
    .then(response => {
      dispatch(reset(formName))

      if (response.createSenderEmail?.errorCode) {
        mutationErrorToast(props.intl)
      }

      toast({
        variant: 'success',
        content: props.intl.formatMessage({
          id: 'sender-email-successfully-added',
        }),
      })
    })
    .catch(() => {
      dispatch(reset(formName))
      mutationErrorToast(props.intl)
    })
}

const ModalAddEmailSender = ({ senderEmailDomains: senderEmailDomainsFragment, intl, dispatch }) => {
  const senderEmailDomains = useFragment(FRAGMENT, senderEmailDomainsFragment)
  return (
    <Modal
      ariaLabel={intl.formatMessage({
        id: 'add-sender-email-address',
      })}
      disclosure={
        <Button variant="tertiary" variantColor="primary">
          {intl.formatMessage({
            id: 'global.add',
          })}
        </Button>
      }
      onClose={() => dispatch(reset(formName))}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>
              {intl.formatMessage({
                id: 'notification-email',
              })}
            </Modal.Header.Label>
            <Heading>
              {intl.formatMessage({
                id: 'add-sender-email-address',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <FieldContainer direction="row" align="flex-end">
              <Field
                label={intl.formatMessage({
                  id: 'share.mail',
                })}
                id="email"
                name="email"
                type="text"
                component={component}
                placeholder="global.placeholder.email"
              />
              <Field
                id="email-domain"
                name="email-domain"
                type="select"
                clearable={false}
                component={select}
                options={uniqBy(senderEmailDomains, 'value')
                  .filter(senderEmailDomain => senderEmailDomain.spfValidation && senderEmailDomain.dkimValidation)
                  .map(senderEmailDomain => ({
                    value: senderEmailDomain.value,
                    label: `@${senderEmailDomain.value}`,
                  }))}
                placeholder="global.placeholder.domain"
              />
            </FieldContainer>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variant="tertiary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({
                  id: 'cancel',
                })}
              </Button>
              <Button
                variantSize="big"
                variant="primary"
                variantColor="primary"
                onClick={() => {
                  dispatch(submit(formName))
                  hide()
                }}
              >
                {intl.formatMessage({
                  id: 'global.add',
                })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const ModalAddEmailSenderForm = reduxForm({
  form: formName,
  onSubmit,
})(ModalAddEmailSender) as React.AbstractComponent<BeforeProps>
export default ModalAddEmailSenderForm
