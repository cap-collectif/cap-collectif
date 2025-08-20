import * as React from 'react'
import { Button, CapUIIcon, CapUIModalSize, MultiStepModal } from '@cap-collectif/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { CreateGroupFormProps } from '../UserGroups.type'
import StepMembers from './StepMembers'
import StepInfo from './StepInfo'

type Props = {
  connectionId: string
}

export const CreateGroupModal: React.FC<Props> = ({ connectionId }) => {
  const intl = useIntl()

  const methods = useForm<CreateGroupFormProps>({
    mode: 'onSubmit',
  })

  const { reset } = methods

  return (
    <FormProvider {...methods}>
      <MultiStepModal
        ariaLabelledby="modal-title"
        size={CapUIModalSize.Md}
        onClose={reset}
        ariaLabel={''}
        disclosure={
          <Button variant="primary" variantColor="primary" leftIcon={CapUIIcon.Add} id="create-group-btn">
            {intl.formatMessage({ id: 'users.create-group' })}
          </Button>
        }
        hideOnClickOutside={false}
      >
        <StepInfo />
        <StepMembers connectionId={connectionId} />
      </MultiStepModal>
    </FormProvider>
  )
}

export default CreateGroupModal
