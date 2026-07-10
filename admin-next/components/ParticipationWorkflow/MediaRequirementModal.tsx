import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormGuideline,
  Text,
  UPLOADER_SIZE,
  useMultiStepModal,
} from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { HideBackArrowLayout } from './ModalLayoutHeader'
import ModalLayout from './ModalLayout'
import { FormValues as WorkflowFormValues } from './ParticipationWorkflowModal'
import { useUpdateParticipantMutation } from './mutations/UpdateParticipantMutation'
import { useUpdateProfilePersonalDataMutation } from './mutations/UpdateProfilePersonalDataMutation'

type FormValues = Pick<WorkflowFormValues, 'media'>

type Props = {
  hideGoBackArrow?: boolean
  username: string
}

const MediaRequirementModal: React.FC<Props> = ({ hideGoBackArrow, username }) => {
  const { goToNextStep } = useMultiStepModal()
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isAuthenticated = !!viewerSession?.id
  const updateParticipantMutation = useUpdateParticipantMutation()
  const updateProfilePersonalDataMutation = useUpdateProfilePersonalDataMutation()
  const isLoading = updateParticipantMutation.isLoading || updateProfilePersonalDataMutation.isLoading

  const { control, handleSubmit, watch } = useFormContext<FormValues>()
  const media = watch('media')

  const updateUser = (mediaId: string) => {
    updateProfilePersonalDataMutation.commit({
      variables: {
        input: {
          media: mediaId,
        },
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }

        goToNextStep()
      },
      onError: () => mutationErrorToast(intl),
    })
  }

  const updateParticipant = (mediaId: string) => {
    updateParticipantMutation.commit({
      variables: {
        input: {
          media: mediaId,
          token: CookieMonster.getParticipantCookie(),
        },
      },
      onCompleted: (response, errors) => {
        if (errors && errors.length > 0) {
          return mutationErrorToast(intl)
        }

        goToNextStep()
      },
      onError: () => mutationErrorToast(intl),
    })
  }

  const onSubmit = ({ media }: FormValues) => {
    if (!media?.id) {
      goToNextStep()
      return
    }

    if (isAuthenticated) {
      updateUser(media.id)
      return
    }

    updateParticipant(media.id)
  }

  const pseudo = username || intl.formatMessage({ id: 'global.anonymous' })

  return (
    <ModalLayout
      optional
      header={
        hideGoBackArrow
          ? ({ intl, onClose, goBackCallback, logo, isMobile }) => (
              <HideBackArrowLayout
                intl={intl}
                onClose={onClose}
                goBackCallback={goBackCallback}
                logo={logo}
                isMobile={isMobile}
                optional
              />
            )
          : null
      }
      onClose={() => {}}
      title={intl.formatMessage({ id: 'participation-workflow.media' })}
      info={intl.formatMessage({ id: 'participation-workflow.media_helptext' })}
    >
      <Box
        as="form"
        width="100%"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ '.cap-uploader': { alignSelf: 'center', mb: 'md' } }}
      >
        <Flex alignItems="center" borderRadius="xs" bg="white" px="md" py="sm" gap="xs" mb="md" overflow="hidden">
          <Avatar name={pseudo} src={media?.url} />
          <Text>{pseudo}</Text>
        </Flex>
        <FormControl name="media" control={control}>
          <FieldInput
            format=".jpg,.png,.gif"
            maxSize={500000}
            id="media"
            name="media"
            control={control}
            type="uploader"
            circle
            size={UPLOADER_SIZE.SM}
            minLength={2}
            showThumbnail
            uploadURI={UPLOAD_PATH}
          />
          <FormGuideline>
            {intl.formatMessage({ id: 'supported.format.listed' }, { format: 'jpg, png, gif' })}
            {intl.formatMessage({ id: 'specific-max-weight' }, { weight: '500ko' })}
            {intl.formatMessage({ id: 'min-size-dynamic' }, { width: '300', height: '300' })}
          </FormGuideline>
        </FormControl>
        <Button variantSize="big" justifyContent="center" width="100%" type="submit" isLoading={isLoading}>
          {intl.formatMessage({ id: 'global.continue' })}
        </Button>
      </Box>
    </ModalLayout>
  )
}

export default MediaRequirementModal
