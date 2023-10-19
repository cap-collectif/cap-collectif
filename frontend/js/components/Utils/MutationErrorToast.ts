import type { IntlShape } from 'react-intl'
import 'react-intl'
import { toast } from '~ds/Toast'

export const mutationErrorToast = (intl: IntlShape) =>
  toast({
    variant: 'danger',
    content: intl.formatMessage({
      id: 'global.error.server.form',
    }),
  })
