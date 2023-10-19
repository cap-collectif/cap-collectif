// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/ImageSlider/ImageSlider'
import ImageSlider from '~/components/InteClient/ImageSlider/ImageSlider'

export default (props: Props) => (
  <Providers>
    <ImageSlider {...props} />
  </Providers>
)
