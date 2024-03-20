import type { IntlShape } from 'react-intl'
import { toast } from '@cap-collectif/ui'

export const mutationErrorToast = (intl: IntlShape) =>
  toast({
    variant: 'danger',
    content: intl.formatMessage({ id: 'global.error.server.form' }),
  })
