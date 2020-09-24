// @flow
import * as React from 'react';
import cn from 'classnames';
import { Container } from './ImageSlider.style';
import type { SettingsSlider } from '~/types';

type Image = {|
  url: string,
  alt: string,
|};

export type Props = {
  images: Image[],
  settingsSlider: SettingsSlider,
  className?: string,
};

const ImageSlider = ({ images, className, settingsSlider }: Props) => (
  <Container {...settingsSlider} className={cn('image-slider', className)}>
    {images.map((img, idx) => (
      <img src={img.url} alt="" key={`image-slide-${idx}`} />
    ))}
  </Container>
);

export default ImageSlider;
