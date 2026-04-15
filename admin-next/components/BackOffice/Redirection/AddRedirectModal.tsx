import * as React from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  CapInputSize,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Modal,
  Radio,
  RadioGroup,
  ButtonQuickAction,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import CreateHttpRedirectMutation from 'mutations/CreateHttpRedirectMutation'
import UpdateHttpRedirectMutation from 'mutations/UpdateHttpRedirectMutation'
import { Controller, UseFormSetError, useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'
import normalizeSourceUrl, { isAllowedSourceUrl, toAbsoluteSourceUrl } from './normalizeSourceUrl'
import { AddRedirectFormValues, RedirectModalProps, RedirectRow, RedirectType } from './types'

const getDefaultValues = (editingRedirect?: RedirectRow, sourceUrlOrigin?: string): AddRedirectFormValues => ({
  originalUrl: toAbsoluteSourceUrl(editingRedirect?.sourceUrl, sourceUrlOrigin),
  destinationUrl: editingRedirect?.destinationUrl ?? '',
  duration: editingRedirect?.duration ?? 'PERMANENT',
})

const handleRedirectError = (
  errorCode: string | null | undefined,
  setError: UseFormSetError<AddRedirectFormValues>,
  intl: IntlShape,
): boolean => {
  if (!errorCode) return false

  if (errorCode === 'DUPLICATE_URL') {
    setError('originalUrl', {
      type: 'server',
      message: intl.formatMessage({ id: 'admin.domain-url.url-management.duplicate-url-error' }),
    })
    return true
  }

  if (errorCode === 'INVALID_URL') {
    setError('originalUrl', {
      type: 'server',
      message: intl.formatMessage({ id: 'global.error.server.form' }),
    })
    return true
  }

  return false
}

const AddRedirectModal: React.FC<RedirectModalProps> = ({
  connectionId,
  usedSourceUrls,
  allowedSourceHosts,
  sourceUrlOrigin,
  editingRedirect,
  disclosure,
}) => {
  const intl = useIntl()
  const formId = React.useId()
  const defaultValues = React.useMemo(
    () => getDefaultValues(editingRedirect, sourceUrlOrigin),
    [editingRedirect, sourceUrlOrigin],
  )

  const { control, formState, handleSubmit, reset, setError } = useForm<AddRedirectFormValues>({
    mode: 'onChange',
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const validateSourceDomain = React.useCallback(
    (value?: string): true | string =>
      isAllowedSourceUrl(value, allowedSourceHosts)
        ? true
        : intl.formatMessage({ id: 'global.invalid-url' }),
    [allowedSourceHosts, intl],
  )

  const validateUniqueUrl = React.useCallback(
    (value?: string): true | string => {
      if (!value) return true
      const normalized = normalizeSourceUrl(value, allowedSourceHosts)
      if (!normalized) return true
      if (editingRedirect && normalizeSourceUrl(editingRedirect.sourceUrl) === normalized) {
        return true
      }
      return (
        !usedSourceUrls.has(normalized) ||
        intl.formatMessage({ id: 'admin.domain-url.url-management.duplicate-url-error' })
      )
    },
    [allowedSourceHosts, editingRedirect, intl, usedSourceUrls],
  )

  const closeModal = (hide: () => void) => {
    reset(defaultValues)
    hide()
  }

  const onSubmit = async (values: AddRedirectFormValues, hide: () => void) => {
    const input = {
      sourceUrl: values.originalUrl,
      destinationUrl: values.destinationUrl,
      duration: values.duration,
      redirectType: (editingRedirect?.redirectType ?? 'REDIRECTION') as RedirectType,
    }

    try {
      if (editingRedirect) {
        const response = await UpdateHttpRedirectMutation.commit({
          input: {
            id: editingRedirect.id,
            ...input,
          },
        })
        const errorCode = response.updateHttpRedirect?.errorCode
        if (handleRedirectError(errorCode, setError, intl)) {
          return
        }
        if (errorCode) {
          return mutationErrorToast(intl)
        }
      } else {
        const response = await CreateHttpRedirectMutation.commit({ input }, connectionId)
        const errorCode = response.createHttpRedirect?.errorCode
        if (handleRedirectError(errorCode, setError, intl)) {
          return
        }
        if (errorCode) {
          return mutationErrorToast(intl)
        }
      }

      successToast(intl.formatMessage({ id: 'admin.domain-url.url-management.success-redirect' }))
      closeModal(hide)
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Modal
      ariaLabel="add-redirect"
      size={CapUIModalSize.Md}
      disclosure={
        disclosure ?? (
          <ButtonQuickAction
            icon={CapUIIcon.Pencil}
            size={CapUIIconSize.Md}
            variantColor="hierarchy"
            label={intl.formatMessage({ id: 'global.edit' })}
          />
        )
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'domain.and.url' })}</Modal.Header.Label>
            <Heading>{intl.formatMessage({ id: 'admin.domain-url.url-management.add-redirect' })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex
              as="form"
              id={formId}
              direction="column"
              onSubmit={handleSubmit(values => onSubmit(values, hide))}
            >
              <FormControl name="originalUrl" control={control} isRequired>
                <FormLabel
                  htmlFor="originalUrl"
                  label={intl.formatMessage({ id: 'admin.domain-url.url-management.original-url' })}
                />
                <FieldInput
                  id="originalUrl"
                  name="originalUrl"
                  control={control}
                  type="textarea"
                  variantSize={CapInputSize.Md}
                  rows={2}
                  resize="none"
                  rules={{ validate: { sourceDomain: validateSourceDomain, unique: validateUniqueUrl } }}
                />
              </FormControl>
              <FormControl name="destinationUrl" control={control} isRequired>
                <FormLabel
                  htmlFor="destinationUrl"
                  label={intl.formatMessage({ id: 'admin.domain-url.url-management.destination-url' })}
                />
                <FieldInput
                  id="destinationUrl"
                  name="destinationUrl"
                  control={control}
                  type="textarea"
                  variantSize={CapInputSize.Md}
                  rows={2}
                  resize="none"
                />
              </FormControl>
              <Box mb={4}>
                <FormLabel
                  htmlFor="redirect-duration-permanent"
                  label={intl.formatMessage({ id: 'admin.domain-url.url-management.redirect-duration' })}
                />
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup direction="column" spacing={2}>
                      <Radio
                        id="redirect-duration-permanent"
                        name="redirect-duration"
                        variantSize={CapInputSize.Md}
                        checked={field.value === 'PERMANENT'}
                        onChange={() => field.onChange('PERMANENT')}
                      >
                        {intl.formatMessage({ id: 'admin.domain-url.url-management.duration-permanent' })}
                      </Radio>
                      <Radio
                        id="redirect-duration-temporary"
                        name="redirect-duration"
                        variantSize={CapInputSize.Md}
                        checked={field.value === 'TEMPORARY'}
                        onChange={() => field.onChange('TEMPORARY')}
                      >
                        {intl.formatMessage({ id: 'admin.domain-url.url-management.duration-temporary' })}
                      </Radio>
                    </RadioGroup>
                  )}
                />
              </Box>
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variant="secondary" variantColor="hierarchy" variantSize="medium" onClick={() => closeModal(hide)}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                type="submit"
                form={formId}
                variant="primary"
                variantColor="primary"
                variantSize="medium"
                disabled={!formState.isValid}
              >
                {intl.formatMessage({ id: editingRedirect ? 'global.save' : 'global.add' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default AddRedirectModal
