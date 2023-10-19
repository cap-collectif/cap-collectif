// @ts-nocheck
import * as React from 'react'
import type { Colors } from './UserSlide.style'
import { Container } from './UserSlide.style'
import Image from '~ui/Primitives/Image'

export type Props = {
  name: string
  job: Record<string, string>
  img: string
  lang: string
  colors: Colors
}

const UserSlide = ({ name, job, img, lang, colors }: Props) => (
  <Container nameColor={colors.name}>
    <div className="avatar-wrapper">
      <Image src={img} alt="" />
    </div>

    <div>
      <p className="name">{name}</p>
      <p className="job">{job[lang]}</p>
    </div>
  </Container>
)

export default UserSlide
