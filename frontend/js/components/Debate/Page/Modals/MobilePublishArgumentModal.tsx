import * as React from 'react'
import { useIntl } from 'react-intl'
import { useAnalytics } from 'use-analytics'
import { useCallback } from 'react'
import { Field, isInvalid, isPristine } from 'redux-form'
import { useSelector, connect } from 'react-redux'
import { Heading, Button, Modal } from '@cap-collectif/ui'
import component from '~/components/Form/Field'
import type { GlobalState, Dispatch } from '~/types'
import useLoadingMachine from '~/utils/hooks/useLoadingMachine'
import ResetCss from '~/utils/ResetCss'

type BeforeConnectProps = {
  readonly show: boolean
  readonly title: string
  readonly onClose: () => void
  readonly onSubmit: () => void | Promise<any>
  readonly debateUrl: string
}
type StateProps = {
  readonly pristine: boolean
  readonly invalid: boolean
  readonly dispatch: Dispatch
}
type Props = BeforeConnectProps & StateProps

export const formName = 'debate-argument-form'

export const MobilePublishArgumentModal = ({
  show,
  onClose,
  onSubmit,
  pristine,
  invalid,
  title,
  debateUrl,
}: Props): JSX.Element => {
  const viewerIsConfirmedByEmail: boolean = useSelector(
    (state: GlobalState) => state.user?.user?.isEmailConfirmed || false,
  )
  const { track } = useAnalytics()
  const intl = useIntl()
  const { startLoading, stopLoading, isLoading } = useLoadingMachine()
  const focusInputRef = useCallback(node => {
    if (node !== null) {
      const $input = node.querySelector('[name="body"]')

      if ($input) {
        $input.focus()
      }
    }
  }, [])

  const handleClose = () => {
    if (isLoading) return

    if (onClose) {
      onClose()
    }
  }

  if (!show) return null
  return (
    // @ts-ignore
    <Modal id="publish-argument" onClose={handleClose} show={show} ariaLabel={title}>
      <ResetCss>
        <Modal.Header>
          <Heading as="h4">{title}</Heading>
        </Modal.Header>
      </ResetCss>
      <Modal.Body>
        <form ref={focusInputRef} id={formName}>
          <Field
            name="body"
            component={component}
            autoFocus
            type="textarea"
            id="body"
            minLength="1"
            autoComplete="off"
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={isLoading || invalid || pristine}
          onClick={async () => {
            track('debate_argument_publish', {
              url: debateUrl,
            })

            try {
              startLoading()
              await onSubmit()
              stopLoading()
            } catch (e) {
              stopLoading()
            }
          }}
          variant="primary"
          variantSize="big"
          width="100%"
          isLoading={isLoading}
          justifyContent="center"
        >
          {intl.formatMessage({
            id: viewerIsConfirmedByEmail ? 'global.publish' : 'global.validate',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
})

// @ts-ignore
export default connect<Props, BeforeConnectProps>(mapStateToProps)(
  MobilePublishArgumentModal, // @ts-ignore
) as React.AbstractComponent<BeforeConnectProps>
