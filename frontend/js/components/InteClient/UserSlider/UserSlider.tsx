// @ts-nocheck
import * as React from 'react'
import cn from 'classnames'
import type { Props as UserSlideProps } from './UserSlide/UserSlide'
import UserSlide from './UserSlide/UserSlide'
import { Container } from './UserSlider.style'
import type { SettingsSlider } from '~/types'

export type Props = {
  users: Array<UserSlideProps>
  settingsSlider: SettingsSlider
  lang: string
  className?: string
}

const UserSlider = ({ users, lang, className, settingsSlider }: Props) => (
  <Container {...settingsSlider} className={cn('user-slider', className)}>
    {users.map((user, idx) => (
      <UserSlide {...user} key={`user-slide-${idx}`} lang={lang} />
    ))}
  </Container>
)

export default UserSlider
