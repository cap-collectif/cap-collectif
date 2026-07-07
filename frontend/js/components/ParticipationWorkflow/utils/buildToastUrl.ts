type ToastConfig = {
  variant: 'success' | 'danger' | 'info' | 'warning'
  message: string
}

export const buildToastUrl = (url: string, toast: ToastConfig): string => {
  const redirectUrl = new URL(url, window.location.origin)
  redirectUrl.searchParams.set('toast', JSON.stringify(toast))

  if (redirectUrl.origin === window.location.origin) {
    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
  }

  return redirectUrl.toString()
}
