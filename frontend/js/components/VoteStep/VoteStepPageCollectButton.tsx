import { Button } from '@cap-collectif/ui'
import * as React from 'react'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'
import LoginOverlay from '~/components/Utils/LoginOverlay'
import { useIntl } from 'react-intl'
import useIsMobile from '~/utils/hooks/useIsMobile'

type Props = {
  disabled?: boolean
  onOpen: () => void
}

export const VoteStepPageCollectButton = ({ disabled, onOpen }: Props) => {
  const { width } = useWindowWidth()
  const intl = useIntl()
  const isMobile = useIsMobile()

  const isMediumScreen = width >= 1536

  return (
    <LoginOverlay>
      <Button
        variant="primary"
        mr={[0, 4]}
        flex="none"
        disabled={disabled}
        opacity={disabled ? 0.5 : 1}
        onClick={onOpen}
        position={['fixed', 'inherit']}
        left={[0, 'unset']}
        right={[0, 'unset']}
        bottom={[0, 'unset']}
        zIndex={[9, 0]}
        py={[6, 1]}
        borderBottomLeftRadius={[0, 'button']}
        borderBottomRightRadius={[0, 'button']}
        borderTopLeftRadius={['accordion', 'button']}
        borderTopRightRadius={['accordion', 'button']}
        justifyContent="center"
        id="add-proposal"
      >
        {intl.formatMessage({
          id: isMobile || isMediumScreen ? 'proposal.add' : 'global.collect',
        })}
      </Button>
    </LoginOverlay>
  )
}
export default VoteStepPageCollectButton
