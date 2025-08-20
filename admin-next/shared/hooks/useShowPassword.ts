import { useState } from 'react'
import { CapUIIcon } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

export default function useShowPassword() {
  const intl = useIntl()

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const onClickActions = showPassword
    ? [
        {
          icon: CapUIIcon.Eye,
          onClick: () => setShowPassword(false),
          label: intl.formatMessage({ id: 'global.password.hide' }),
        },
      ]
    : [
        {
          icon: CapUIIcon.EyeClose,
          onClick: () => setShowPassword(true),
          label: intl.formatMessage({ id: 'global.password.show' }),
        },
      ]

  return { showPassword, onClickActions }
}
