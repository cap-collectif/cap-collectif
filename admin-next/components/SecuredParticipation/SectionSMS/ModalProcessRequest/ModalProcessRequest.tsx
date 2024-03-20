import type { FC } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { Button, CapUIFontWeight, CapUIModalSize, Heading, Modal, Select, Text, toast } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import type { ModalProcessRequest_smsOrder$key } from '@relay/ModalProcessRequest_smsOrder.graphql'
import { formatBigNumber } from '@utils/format-number'
import { PACKAGE_LIST } from '../ModalCreditRefill/ModalCreditRefill'
import type { SegmentedControlValue } from '@ui/SegmentedControl/item/SegmentedControlItem'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import AddSmsCreditMutation from '@mutations/AddSmsCreditMutation'
import DeleteSmsOrderMutation from '@mutations/DeleteSmsOrderMutation'

const FRAGMENT = graphql`
  fragment ModalProcessRequest_smsOrder on SmsOrder {
    id
    amount
  }
`

const addSmsCredit = (creditCount: SegmentedControlValue, orderId: string, intl: IntlShape) => {
  const input = {
    amount: Number(creditCount),
    smsOrder: orderId,
  }

  return AddSmsCreditMutation.commit({
    input,
  }).then(response => {
    if (response.addSmsCredit?.errorCode) {
      return mutationErrorToast(intl)
    }

    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'credit-recharge-success-message' }, { creditCount }),
    })
  })
}

const deleteSmsOrder = (
  creditCount: SegmentedControlValue,
  orderId: string,
  intl: IntlShape,
  connectionName: string,
) => {
  const input = {
    id: orderId,
  }

  return DeleteSmsOrderMutation.commit({
    input,
    connections: [connectionName],
  }).then(response => {
    if (response.deleteSmsOrder?.errorCode) {
      return mutationErrorToast(intl)
    }

    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'delete-sms-order-success-message' }, { creditCount }),
    })
  })
}

type ModalProcessRequestProps = {
  readonly smsOrder: ModalProcessRequest_smsOrder$key
  readonly connectionName: string
}

const ModalProcessRequest: FC<ModalProcessRequestProps> = ({ smsOrder: smsOrderFragment, connectionName }) => {
  const intl = useIntl()
  const { id, amount } = useFragment(FRAGMENT, smsOrderFragment)
  const defaultValue = PACKAGE_LIST.find(pack => pack.sms === amount) || PACKAGE_LIST[0]

  return (
    <Modal
      size={CapUIModalSize.Sm}
      ariaLabel={intl.formatMessage({ id: 'process-request' })}
      disclosure={
        <Button variant="secondary" variantColor="primary" variantSize="small">
          {intl.formatMessage({ id: 'process-request' })}
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'process-request' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text>
              {intl.formatMessage({ id: 'check-order-form-before-credit' }, { creditCount: formatBigNumber(amount) })}
            </Text>
            <Text mb={4} fontWeight={CapUIFontWeight.Semibold}>
              {intl.formatMessage({ id: 'global-action-irreversible' })}
            </Text>

            <Select
              options={PACKAGE_LIST.map(pack => ({
                label: formatBigNumber(pack.sms),
                value: pack.sms,
              }))}
              defaultValue={{
                label: formatBigNumber(defaultValue.sms),
                value: defaultValue.sms,
              }}
              inputId="package-selected"
            />
          </Modal.Body>
          <Modal.Footer justify="space-between">
            <Button
              variant="secondary"
              variantColor="danger"
              variantSize="big"
              onClick={() => {
                deleteSmsOrder(amount, id, intl, connectionName)
                hide()
              }}
            >
              {intl.formatMessage({ id: 'action_delete' })}
            </Button>
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="big"
              onClick={() => {
                addSmsCredit(amount, id, intl)
                hide()
              }}
            >
              {intl.formatMessage({ id: 'global.credit' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ModalProcessRequest
