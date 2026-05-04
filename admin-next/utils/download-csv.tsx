import { toast } from '@cap-collectif/ui'
import saveAs from '@shared/utils/filesaver'
import { dangerToast, infoToast } from '@shared/utils/toasts'
import React from 'react'
import { IntlShape } from 'react-intl'

type DownloadCSVResult = {
  downloaded: boolean
  jsonResponse: boolean
}

const showExportRequestedToast = (intl: IntlShape, translationKey: string): void => {
  const message = intl.formatMessage({ id: translationKey })
  const firstSentenceMatch = message.match(/^.*?[.!?](?:\s|$)/)
  const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : message
  const secondLine = firstSentenceMatch ? message.slice(firstSentenceMatch[0].length).trim() : ''

  toast({
    variant: 'info',
    content: (
      <span>
        <strong>{firstSentence}</strong>
        {secondLine.length > 0 ? (
          <>
            <br />
            {secondLine}
          </>
        ) : null}
      </span>
    ),
  })
}

const downloadCSV = async (
  url: string,
  intl: IntlShape,
  onLoad: () => void = null,
  onSuccess: () => void = null,
  onError: (errorTranslationKey: string) => void = null,
): Promise<DownloadCSVResult> => {
  if (onLoad) {
    onLoad()
  }
  const response = await fetch(url)
  const contentType = response.headers.get('content-type')?.toLowerCase() || ''
  const isJsonResponse = contentType.includes('application/json')

  if (response.status === 202 || (response.ok && isJsonResponse)) {
    const { errorTranslationKey = 'export.requested' } = await response.json()
    if (errorTranslationKey === 'export.requested') {
      showExportRequestedToast(intl, errorTranslationKey)
    } else {
      infoToast(intl.formatMessage({ id: errorTranslationKey }))
    }

    return {
      downloaded: false,
      jsonResponse: true,
    }
  }

  if (response.ok) {
    const contentDisposition = response.headers.get('content-disposition')
    let filename: string | null = ''
    if (contentDisposition) {
      // eslint-disable-next-line prefer-destructuring
      filename = contentDisposition.split('=')[1]
    } else {
      filename = response.headers.get('X-File-Name')
    }

    const blob = await response.blob()
    saveAs(blob, filename)

    if (onSuccess) {
      onSuccess()
    }

    return {
      downloaded: true,
      jsonResponse: false,
    }
  } else {
    const { errorTranslationKey = 'global.saving.error' } = isJsonResponse
      ? await response.json()
      : { errorTranslationKey: 'global.saving.error' }

    if (onError) {
      onError(errorTranslationKey)
      return {
        downloaded: false,
        jsonResponse: false,
      }
    }

    dangerToast(intl.formatMessage({ id: errorTranslationKey }))

    return {
      downloaded: false,
      jsonResponse: false,
    }
  }
}

export default downloadCSV
