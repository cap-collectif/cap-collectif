const isIos = () => {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
      window.navigator.platform,
    ) || // iPad on iOS 13 detection
    (window.navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

export default isIos
