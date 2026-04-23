import type { IntlShape } from 'react-intl'
import { toast } from '@cap-collectif/ui'

export const mutationErrorToast = (intl: IntlShape, content?: string) =>
  toast({
    variant: 'danger',
    content: content ?? intl.formatMessage({ id: 'global.error.server.form' }),
  })
