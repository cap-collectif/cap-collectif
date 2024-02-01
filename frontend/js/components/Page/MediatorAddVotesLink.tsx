import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { Button } from '@cap-collectif/ui'
import type { GlobalState } from '~/types'
import useIsMobile from '~/utils/hooks/useIsMobile'

type Props = {
  projectId: string
}
export const MediatorAddVotesLink = ({ projectId }: Props) => {
  const intl = useIntl()
  const isMobile = useIsMobile()

  const { btnBgColor, btnTextColor } = useSelector((state: GlobalState) => ({
    btnBgColor: state.default.parameters['color.btn.primary.bg'],
    btnTextColor: state.default.parameters['color.btn.primary.text'],
  }))

  if (isMobile) return null

  return (
      <Button
        sx={{
          '&::before': {
            display: 'none'
          },
        }}
        width="fit-content"
        bg={`${btnBgColor} !important`}
        color={`${btnTextColor} !important`}
        variantSize="small"
        as="a"
        href={`/admin-next/project/${projectId}/mediator-view?add=true`}
        id="add-mediator-votes"
        textAlign="center"
        display="block"
      >
        {intl.formatMessage({
          id: 'mediator.new_participant',
        })}
      </Button>
  )
}

export default MediatorAddVotesLink
