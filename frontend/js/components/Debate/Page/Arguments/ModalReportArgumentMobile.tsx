import { $Values } from 'utility-types'
import * as React from 'react'
import { submit } from 'redux-form'
import { useDispatch } from 'react-redux'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import { useIntl } from 'react-intl'
import { Button, Modal, Heading, Text, CapUIModalSize } from '@cap-collectif/ui'
import type { ModalReportArgumentMobile_argument } from '~relay/ModalReportArgumentMobile_argument.graphql'
import type { Values } from '~/components/Report/ReportForm'
import ReportForm, { formName, getType } from '~/components/Report/ReportForm'
import type { Dispatch } from '~/types'
import { FontWeight } from '~ui/Primitives/constants'
import ReportDebateArgumentMutation from '~/mutations/ReportDebateArgumentMutation'
type Props = {
  readonly argument: ModalReportArgumentMobile_argument
  readonly show: boolean
  readonly onClose: () => void
}
const STATE = {
  FORM: 'FORM',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
}

const reportArgument = (
  argument: ModalReportArgumentMobile_argument,
  reportFormValues: Values,
  setModalState: (state: $Values<typeof STATE>) => void,
  setErrorCount: (count: number) => void,
  errorCount: number,
) => {
  return ReportDebateArgumentMutation.commit({
    input: {
      reportableId: argument.id,
      body: reportFormValues.body,
      type: getType(reportFormValues.status),
    },
    debateId: argument.debate.id,
    forOrAgainst: argument.type,
    isMobile: true,
  })
    .then(response => {
      if (response.report?.errorCode) {
        setModalState(STATE.ERROR)
        setErrorCount(errorCount + 1)
      } else {
        setErrorCount(0)
        setModalState(STATE.SUCCESS)
      }
    })
    .catch(() => {
      setModalState(STATE.ERROR)
      setErrorCount(errorCount + 1)
    })
}

export const ModalReportArgumentMobile = ({ argument, show, onClose }: Props): JSX.Element => {
  const dispatch = useDispatch<Dispatch>()
  const intl = useIntl()
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>(STATE.FORM)
  const [errorCount, setErrorCount] = React.useState<number>(0)
  const [valuesSaved, setValuesSaved] = React.useState<Values | null | undefined>(null)

  const resetState = () => {
    setModalState(STATE.FORM)
    setErrorCount(0)
    setValuesSaved(null)
  }

  const getModalContent = (state: $Values<typeof STATE>, hideModalChoice: () => void) => {
    switch (state) {
      case 'FORM':
        return (
          <>
            <Modal.Header>
              <Heading as="h4">
                {intl.formatMessage({
                  id: 'global.modal.report.title',
                })}
              </Heading>
            </Modal.Header>

            <Modal.Body pb={6}>
              <ReportForm
                onSubmit={(values: Values) => {
                  setValuesSaved(values)
                  reportArgument(argument, values, setModalState, setErrorCount, errorCount)
                }}
              />
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="primary"
                variantColor="danger"
                variantSize="big"
                width="100%"
                justifyContent="center"
                onClick={() => dispatch(submit(formName))}
              >
                {intl.formatMessage({
                  id: 'global.report.submit',
                })}
              </Button>
            </Modal.Footer>
          </>
        )

      case 'SUCCESS':
        return (
          <>
            <Modal.Header />
            <Modal.Body pb={6} pt={0} align="center">
              <Text mb={1} fontWeight={FontWeight.Semibold}>
                <Text as="span" aria-hidden role="img" mr={1}>
                  ✅
                </Text>
                <Text as="span">
                  {intl.formatMessage({
                    id: 'global.thank.you',
                  })}
                </Text>
              </Text>
              <Text textAlign="center" width="50%">
                {intl.formatMessage({
                  id: 'success-report-argument',
                })}
              </Text>
            </Modal.Body>
          </>
        )

      case 'ERROR':
        return (
          <>
            <Modal.Header />
            <Modal.Body pb={6} pt={0} align="center">
              <Text mb={3} aria-hidden role="img">
                😓
              </Text>
              <Text fontWeight={FontWeight.Semibold}>
                {intl.formatMessage({
                  id: 'error.title.damn',
                })}
              </Text>
              <Text textAlign="center">
                {intl.formatMessage({
                  id: errorCount <= 1 ? 'error-has-occurred' : 'error.persist.try.again',
                })}
              </Text>
            </Modal.Body>

            <Modal.Footer justify="center">
              {errorCount <= 1 ? (
                <Button
                  variant="primary"
                  variantColor="danger"
                  variantSize="big"
                  width="100%"
                  justifyContent="center"
                  onClick={() => {
                    if (valuesSaved) reportArgument(argument, valuesSaved, setModalState, setErrorCount, errorCount)
                  }}
                >
                  {intl.formatMessage({
                    id: 'global.report.submit',
                  })}
                </Button>
              ) : (
                <Button variant="tertiary" variantColor="primary" onClick={hideModalChoice}>
                  {intl.formatMessage({
                    id: 'back.to.arguments',
                  })}
                </Button>
              )}
            </Modal.Footer>
          </>
        )

      default:
        state as never
        throw Error(`state ${state} is not a valid state`)
    }
  }

  return (
    <Modal
      show={show}
      hideCloseButton
      variantSize={CapUIModalSize.Xl}
      alwaysOpenInPortal
      onClose={() => {
        resetState()
        onClose()
      }}
      ariaLabel={intl.formatMessage({
        id: 'global.report.submit',
      })}
    >
      {({ hide: hideModalChoice }) => getModalContent(modalState, hideModalChoice)}
    </Modal>
  )
}
export default createFragmentContainer(ModalReportArgumentMobile, {
  argument: graphql`
    fragment ModalReportArgumentMobile_argument on AbstractDebateArgument {
      id
      type
      debate {
        id
      }
    }
  `,
}) as RelayFragmentContainer<typeof ModalReportArgumentMobile>
