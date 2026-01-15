import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, useMultiStepModal, Button } from '@cap-collectif/ui'
import ModalLayout from './ModalLayout'

const OptinModal = () => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()

  const onSubmit = (optin: boolean) => {
    console.log(optin)
    /** TODO Mutation and error handling */
    goToNextStep()
  }

  return (
    <>
      <ModalLayout
        onClose={() => {}}
        title={intl.formatMessage({ id: 'participation-workflow.optin' })}
        info={intl.formatMessage({ id: 'participation-workflow.optin_helptext' })}
      >
        <Box width="100%">
          <Button variantSize="big" justifyContent="center" width="100%" onClick={() => onSubmit(true)}>
            {intl.formatMessage({ id: 'participation-workflow.yes' })}
          </Button>
          <Button
            mt={4}
            variant="link"
            variantColor="hierarchy"
            width="100%"
            justifyContent="center"
            onClick={() => onSubmit(false)}
          >
            {intl.formatMessage({ id: 'participation-workflow.no' })}
          </Button>
        </Box>
      </ModalLayout>
    </>
  )
}

export default OptinModal
