import * as React from 'react'
import { useIntl } from 'react-intl'
import { Button } from '@cap-collectif/ui'
import { SONATA_USER_LIST_URL } from './utils'

const BackToUserListButton: React.FC = () => {
  const intl = useIntl()

  return (
    <Button
      variant="tertiary"
      variantColor="hierarchy"
      variantSize="small"
      onClick={() => (window.location.href = SONATA_USER_LIST_URL)}
    >
      {intl.formatMessage({ id: 'global.back' })}
    </Button>
  )
}

export default BackToUserListButton
