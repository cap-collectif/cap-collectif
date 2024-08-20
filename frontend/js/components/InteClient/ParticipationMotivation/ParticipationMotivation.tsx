// @ts-nocheck
import * as React from 'react'
import cn from 'classnames'
import { Container, MotivationContainer } from './ParticipationMotivation.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'

export type Props = {
  motivations: string[]
  color: string
  className?: string
}

const ParticipationMotivation = ({ motivations, color, className }: Props) => (
  <Container className={cn('participation-motivation', className)}>
    {motivations.map((motivation, idx) => (
      <MotivationContainer color={color} key={idx}>
        <Icon name={ICON_NAME.certified} color={color} size={30} />
        <p
          dangerouslySetInnerHTML={{
            __html: motivation,
          }}
        />
      </MotivationContainer>
    ))}
  </Container>
)

export default ParticipationMotivation
