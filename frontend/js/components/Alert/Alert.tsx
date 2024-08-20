import React, { useEffect } from 'react'
import AlertContainer from './Alert.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'

type Props = {
  children: any
  type: string
  timeout?: number
  onDismiss?: () => void
}

const Alert = ({ children, type, onDismiss, timeout = 10000 }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      if (typeof onDismiss === 'function') onDismiss()
    }, timeout)
  }, [onDismiss, timeout])
  return (
    <AlertContainer type={type}>
      {children}
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="btn-close">
          <Icon name={ICON_NAME.close} size={10} color={colors.darkGray} />
        </button>
      )}
    </AlertContainer>
  )
}

export default Alert
