import { Box, Button, CapUIFontSize, CapUIIcon, Flex, Text } from '@cap-collectif/ui'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import api from '@utils/config'
import * as React from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'

type UploadError = { messageId: string; fileName: string; fileType: string }

type Props = { busy: boolean; setBusy: (busy: boolean) => void; refresh: () => Promise<unknown> }

export default function FontUpload({ busy, setBusy, refresh }: Props) {
  const intl = useIntl()
  const input = React.useRef<HTMLInputElement>(null)
  const [loadingFile, setLoadingFile] = React.useState('')
  const [errors, setErrors] = React.useState<UploadError[]>([])

  const upload = async (files: File[]) => {
    if (!files.length) return
    setBusy(true)
    setErrors([])
    let uploaded = false
    try {
      for (const file of files) {
        setLoadingFile(file.name)
        const body = new FormData()
        body.append('file', file)
        let errorKey = 'download-error'
        try {
          const response = await fetch(`${api.getApiUrl()}/upload/fonts`, { method: 'POST', body })
          const result = await response.json()
          if (response.ok && result.id) {
            uploaded = true
            continue
          }
          if (result.message === 'Invalid font format.') errorKey = 'download-error-file-format'
        } catch {
          // Report each rejected file and continue uploading the rest of the selection.
        }
        const error = {
          messageId: errorKey,
          fileName: file.name,
          fileType: file.type || file.name.split('.').pop() || '',
        }
        setErrors(previous => [...previous, error])
      }
      if (uploaded) {
        await refresh()
        successToast(intl.formatMessage({ id: 'Typeface-successfully-updated' }))
      }
    } catch {
      mutationErrorToast(intl)
    } finally {
      setLoadingFile('')
      setBusy(false)
    }
  }

  return (
    <Box mb={4} gap={2}>
      <input
        hidden
        ref={input}
        type="file"
        multiple
        accept=".zip,.ttf,.woff,.otf,.eot"
        onChange={event => {
          const files = Array.from(event.currentTarget.files ?? [])
          event.currentTarget.value = ''
          void upload(files)
        }}
      />
      <Flex align="center" gap={2}>
        <Button
          variant="secondary"
          variantSize="small"
          leftIcon={CapUIIcon.Add}
          onClick={() => input.current?.click()}
          aria-describedby="font-upload-formats"
          disabled={busy}
          isLoading={!!loadingFile}
        >
          {intl.formatMessage({ id: 'admin.settings.add-font' })}
        </Button>
        <Button
          as="a"
          href={intl.formatMessage({ id: 'admin.helplink.custom-fonts' })}
          target="_blank"
          rel="noopener noreferrer"
          variant="link"
          variantColor="primary"
          leftIcon={CapUIIcon.Info}
        >
          {intl.formatMessage({ id: 'global.help' })}
        </Button>
      </Flex>
      <Text id="font-upload-formats" mt={2} fontSize={CapUIFontSize.BodySmall} color="gray.500">
        {intl.formatMessage({ id: 'Add-custom-typeface-file-format' })}
      </Text>
      <Text aria-live="polite">{loadingFile}</Text>
      {errors.map(({ messageId, fileName, fileType }, index) => (
        <Text role="alert" color="danger.base" key={index}>
          <FormattedHTMLMessage id={messageId} values={{ fileName, fileType }} />
        </Text>
      ))}
    </Box>
  )
}
