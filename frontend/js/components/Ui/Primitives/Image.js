// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import config, { baseUrl } from '~/config';

export type ImageProps = {|
  ...AppBoxProps,
  +src?: string,
|};

const Image = ({ src, alt, ...props }: ImageProps) => {
  if (!src) {
    return null;
  }
  return !config.isDevOrTest ? (
    <img
      loading="lazy"
      srcSet={`
        ${baseUrl}/cdn-cgi/image/width=320,format=auto/${src}   320w,
         ${baseUrl}/cdn-cgi/image/width=640,format=auto/${src}   640w,
         ${baseUrl}/cdn-cgi/image/width=960,format=auto/${src}   960w,
         ${baseUrl}/cdn-cgi/image/width=1280,format=auto/${src} 1280w,
         ${baseUrl}/cdn-cgi/image/width=2560,format=auto/${src} 2560w,
         ${baseUrl}/cdn-cgi/image/dpr=2,format=auto/${src} 2x,
         ${baseUrl}/cdn-cgi/image/dpr=3,format=auto/${src} 3x,
         `}
      alt={alt}
      {...props}
    />
  ) : (
    <img loading="lazy" src={src} alt={alt} {...props} />
  );
};

export default Image;
