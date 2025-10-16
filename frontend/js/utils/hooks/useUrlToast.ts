import { toast } from '@cap-collectif/ui'
import useUrlState from '~/utils/hooks/useUrlState'
import { useIntl } from 'react-intl'
import React from 'react'

const DEFAULT_KEY = 'toast'

export const useUrlToast = (key: string = DEFAULT_KEY) => {
  const [urlToast] = useUrlState(key, '')
  const intl = useIntl()

  const clearUrlParams = React.useCallback(() => {
    const url = new URL(window.location.href)

    url.searchParams.delete(key)

    window.history.replaceState({}, document.title, url.toString())
  }, [key])

  React.useEffect(() => {
    const toastParams = urlToast ? JSON.parse(urlToast) : null
    if (!toastParams?.variant && !toastParams?.message) {
      return
    }
    toast({
      variant: toastParams.variant,
      content: intl.formatMessage({ id: toastParams.message }),
    })

    clearUrlParams()
  }, [urlToast, intl, clearUrlParams])
}
