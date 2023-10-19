// @ts-nocheck
import * as React from 'react'
import cn from 'classnames'
import { Container } from './ImageSlider.style'
import type { SettingsSlider } from '~/types'
import Image from '~ui/Primitives/Image'

type ImageType = {
  url: string
  alt: string
  link?: string
}
export type Props = {
  images: ImageType[]
  settingsSlider: SettingsSlider
  className?: string
}

const ImageSlider = ({ images, className, settingsSlider }: Props) => (
  <Container {...settingsSlider} className={cn('image-slider', className)}>
    {images.map((img, idx) =>
      img.link ? (
        <a href={img.link} key={`image-slide-${idx}`} className="image-slide">
          <Image src={img.url} alt={img.alt} />
        </a>
      ) : (
        <div key={`image-slide-${idx}`} className="image-slide">
          <Image src={img.url} alt={img.alt} />
        </div>
      ),
    )}
  </Container>
)

export default ImageSlider
