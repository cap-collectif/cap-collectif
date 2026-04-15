import * as React from 'react'
import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapInputSize,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Modal,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import CreateHttpRedirectMutation from 'mutations/CreateHttpRedirectMutation'
import UpdateHttpRedirectMutation from 'mutations/UpdateHttpRedirectMutation'
import { UseFormSetError, useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'
import normalizeSourceUrl, { isAllowedSourceUrl, toAbsoluteSourceUrl } from './normalizeSourceUrl'
import { RedirectDuration, RedirectModalProps, RedirectRow, RedirectType, ShortenUrlFormValues } from './types'

const getDefaultValues = (editingRedirect?: RedirectRow, sourceUrlOrigin?: string): ShortenUrlFormValues => ({
  longUrl: editingRedirect?.destinationUrl ?? '',
  shortUrl: toAbsoluteSourceUrl(editingRedirect?.sourceUrl, sourceUrlOrigin),
})

const handleRedirectError = (
  errorCode: string | null | undefined,
  setError: UseFormSetError<ShortenUrlFormValues>,
  intl: IntlShape,
): boolean => {
  if (!errorCode) return false

  if (errorCode === 'DUPLICATE_URL') {
    setError('shortUrl', {
      type: 'server',
      message: intl.formatMessage({ id: 'admin.domain-url.url-management.duplicate-url-error' }),
    })
    return true
  }

  if (errorCode === 'INVALID_URL') {
    setError('shortUrl', {
      type: 'server',
      message: intl.formatMessage({ id: 'global.error.server.form' }),
    })
    return true
  }

  return false
}

const ShortenUrlModal: React.FC<RedirectModalProps> = ({
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
  const { control, formState, handleSubmit, reset, setError } = useForm<ShortenUrlFormValues>({
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

  const onSubmit = async (values: ShortenUrlFormValues, hide: () => void) => {
    const input = {
      sourceUrl: values.shortUrl,
      destinationUrl: values.longUrl,
      duration: 'TEMPORARY' as RedirectDuration,
      redirectType: 'URL_SHORTENING' as RedirectType,
    }

    try {
      let errorCode: string | null | undefined
      if (editingRedirect) {
        const response = await UpdateHttpRedirectMutation.commit({
          input: {
            id: editingRedirect.id,
            ...input,
          },
        })
        errorCode = response.updateHttpRedirect?.errorCode
      } else {
        const response = await CreateHttpRedirectMutation.commit({ input }, connectionId)
        errorCode = response.createHttpRedirect?.errorCode
      }
      if (handleRedirectError(errorCode, setError, intl)) {
        return
      }
      if (errorCode) {
        return mutationErrorToast(intl)
      }

      successToast(intl.formatMessage({ id: 'admin.domain-url.url-management.success-shorten' }))
      closeModal(hide)
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Modal
      ariaLabel="shorten-url"
      size={CapUIModalSize.Md}
      disclosure={
        disclosure ?? (
          <ButtonQuickAction
            icon={CapUIIcon.ArrowDownO}
            size={CapUIIconSize.Md}
            variantColor="hierarchy"
            label={intl.formatMessage({ id: 'admin.domain-url.url-management.shorten-url' })}
          />
        )
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'domain.and.url' })}</Modal.Header.Label>
            <Heading>{intl.formatMessage({ id: 'admin.domain-url.url-management.shorten-url' })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(values => onSubmit(values, hide))}>
              <FormControl name="longUrl" control={control} isRequired>
                <FormLabel htmlFor="longUrl" label={intl.formatMessage({ id: 'admin.domain-url.url-management.long-url' })} />
                <FieldInput
                  id="longUrl"
                  name="longUrl"
                  control={control}
                  type="textarea"
                  variantSize={CapInputSize.Md}
                  rows={2}
                  resize="none"
                />
              </FormControl>
              <FormControl name="shortUrl" control={control} isRequired>
                <FormLabel htmlFor="shortUrl" label={intl.formatMessage({ id: 'admin.domain-url.url-management.short-url' })} />
                <FieldInput
                  id="shortUrl"
                  name="shortUrl"
                  control={control}
                  type="text"
                  variantSize={CapInputSize.Md}
                  rules={{ validate: { sourceDomain: validateSourceDomain, unique: validateUniqueUrl } }}
                />
              </FormControl>
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

export default ShortenUrlModal
