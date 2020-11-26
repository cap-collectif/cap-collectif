import { ComponentProps } from 'react';
import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type AvatarProps = {
  readonly name?: string
  readonly src?: string
  readonly alt?: string
};

type Props = ComponentProps<'div'> & AvatarProps & {
  readonly size?: AvatarSize
}

declare const Avatar: PolymorphicComponent<Props>

export default Avatar;
