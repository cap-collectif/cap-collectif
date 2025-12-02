import saveAs from '@shared/utils/filesaver'
import { dangerToast } from '@shared/utils/toasts'
import { IntlShape } from 'react-intl'

const downloadCSV = async (
  url: string,
  intl: IntlShape,
  onLoad: () => void = null,
  onSuccess: () => void = null,
  onError: (errorTranslationKey: string) => void = null,
) => {
  if (onLoad) {
    onLoad()
  }
  const response = await fetch(url)
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
  } else {
    const { errorTranslationKey } = await response.json()

    if (onError) {
      onError(errorTranslationKey)
      return
    }

    dangerToast(intl.formatMessage({ id: errorTranslationKey }))
  }
}

export default downloadCSV
