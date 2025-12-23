import React from 'react'
import { Button, ButtonQuickAction, CapUIIcon, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { FormattedHTMLMessage, useIntl } from 'react-intl'

type Props = {
  hasResponses: boolean
  onDelete: () => void
}

export const DeleteQuestionButton: React.FC<Props> = ({ hasResponses, onDelete }) => {
  const intl = useIntl()

  if (!hasResponses) {
    return (
      <ButtonQuickAction
        tooltipZIndex={2}
        onClick={onDelete}
        variantColor="danger"
        icon={CapUIIcon.Trash}
        label={intl.formatMessage({
          id: 'global.delete',
        })}
        type="button"
      />
    )
  }

  return (
    <Modal
      size={CapUIModalSize.Sm}
      ariaLabel="contained-modal-title-lg"
      alwaysOpenInPortal
      disclosure={
        <ButtonQuickAction
          variantColor="danger"
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({
            id: 'global.delete',
          })}
          type="button"
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading as="h4">{intl.formatMessage({ id: 'question.alert.delete' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <FormattedHTMLMessage id="question.alert.delete.body" />
          </Modal.Body>
          <Modal.Footer>
            <Button variantSize="big" variant="secondary" variantColor="hierarchy" onClick={hide}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button variantSize="big" variant="primary" variantColor="danger" onClick={onDelete}>
              {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}
